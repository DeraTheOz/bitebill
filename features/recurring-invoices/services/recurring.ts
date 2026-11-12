import "server-only";

import {
  and,
  desc,
  eq,
  ilike,
  inArray,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import { db } from "@/db/client";
import {
  clients,
  invoices,
  recurringInvoiceItems,
  recurringInvoiceTemplates,
} from "@/db/schema";
import { getBrandingSettings } from "@/features/branding/services/branding";
import {
  computeInvoiceTotals,
  computeInvoiceStatus,
  createInvoice,
} from "@/features/invoices/services/invoices";
import type { InvoiceListItem } from "@/features/invoices/types/invoice";
import {
  computeDueDate,
  computeNextRunDate,
  resolveUpcomingRunDate,
} from "../lib/schedule";
import type { RecurringTemplateFormValues } from "../schemas/recurring-schema";
import type {
  ProcessDueResult,
  RecurringFrequency,
  RecurringListPagination,
  RecurringStatusFilter,
  RecurringTemplate,
  RecurringTemplateItem,
  RecurringTemplateListItem,
} from "../types/recurring";

type TemplateRow = typeof recurringInvoiceTemplates.$inferSelect;
type TemplateItemRow = typeof recurringInvoiceItems.$inferSelect;
type ClientRow = typeof clients.$inferSelect;

const CURRENCY_FALLBACK = "USD";

/** Service-layer error carrying an HTTP status code for recurring invoice operations. */
export class RecurringServiceError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "RecurringServiceError";
  }
}

export type RecurringListParams = {
  page: number;
  pageSize: number;
  status?: RecurringStatusFilter[];
  frequency?: RecurringFrequency[];
  q?: string;
};

export type RecurringListResult = {
  templates: RecurringTemplateListItem[];
  pagination: RecurringListPagination;
  dueCount: number;
};

/** Returns today's UTC calendar date in `YYYY-MM-DD` format. */
const today = () => new Date().toISOString().slice(0, 10);

const ownership = (userId: string) =>
  eq(recurringInvoiceTemplates.userId, userId);

/** Escapes SQL ILIKE wildcards (`\`, `%`, `_`) in search terms. */
function ilikePattern(term: string) {
  return `%${term.replace(/[\\%_]/g, "\\$&")}%`;
}

/** Maps a recurring invoice line item database row into a numeric DTO. */
function toItemDto(row: TemplateItemRow): RecurringTemplateItem {
  const quantity = Number(row.quantity);
  const unitPrice = Number(row.unitPrice);
  const total = Math.round((quantity * unitPrice + Number.EPSILON) * 100) / 100;

  return {
    id: row.id,
    name: row.name,
    quantity,
    unitPrice,
    total,
    position: row.position,
  };
}

/** Maps a joined client row into the subset attached to recurring invoice details. */
function toClientDto(row: ClientRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    company: row.company,
    isDeleted: Boolean(row.deletedAt),
    address: {
      addressLine1: row.addressLine1,
      addressLine2: row.addressLine2,
      city: row.city,
      state: row.state,
      country: row.country,
    },
  };
}

/** Verifies that `clientId` exists, belongs to `userId`, and has not been soft-deleted. */
async function verifyOwnedActiveClient(userId: string, clientId: string) {
  const [client] = await db
    .select({ id: clients.id })
    .from(clients)
    .where(
      and(
        eq(clients.id, clientId),
        eq(clients.userId, userId),
        isNull(clients.deletedAt),
      ),
    )
    .limit(1);

  if (!client) {
    throw new RecurringServiceError(
      "Selected client was not found or has been deleted",
      400,
    );
  }
}

/** Advances `nextRunDate` to the first upcoming cycle strictly after `currentDate`. */
function computeNextCycleAfterRun(
  startDate: string,
  frequency: RecurringFrequency,
  completedRunCount: number,
  currentDate: string,
): string {
  let cycle = Math.max(1, completedRunCount);
  let candidate = computeNextRunDate(startDate, frequency, cycle);
  while (candidate <= currentDate && cycle < 1200) {
    cycle += 1;
    candidate = computeNextRunDate(startDate, frequency, cycle);
  }
  return candidate;
}

/** Lists paginated recurring invoice schedules with filters and counts of active due schedules. */
export async function listRecurringTemplates(
  userId: string,
  params: RecurringListParams,
): Promise<RecurringListResult> {
  const { page, pageSize, status, frequency, q } = params;
  const conditions = [ownership(userId)];

  if (status?.length === 1) {
    conditions.push(eq(recurringInvoiceTemplates.active, status[0] === "active"));
  }

  if (frequency?.length) {
    conditions.push(inArray(recurringInvoiceTemplates.frequency, frequency));
  }

  const term = q?.trim();
  if (term) {
    const pattern = ilikePattern(term);
    conditions.push(
      or(
        ilike(recurringInvoiceTemplates.title, pattern),
        ilike(clients.name, pattern),
      )!,
    );
  }

  const currentDate = today();

  const [rows, branding, dueRow] = await Promise.all([
    db
      .select({
        template: recurringInvoiceTemplates,
        clientName: clients.name,
        clientDeletedAt: clients.deletedAt,
        totalCount: sql<number>`(count(*) over())::int`.as("total_count"),
      })
      .from(recurringInvoiceTemplates)
      .leftJoin(clients, eq(clients.id, recurringInvoiceTemplates.clientId))
      .where(and(...conditions))
      .orderBy(desc(recurringInvoiceTemplates.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    getBrandingSettings(userId),
    db
      .select({
        dueCount: sql<number>`count(*)::int`,
      })
      .from(recurringInvoiceTemplates)
      .innerJoin(clients, eq(clients.id, recurringInvoiceTemplates.clientId))
      .where(
        and(
          ownership(userId),
          eq(recurringInvoiceTemplates.active, true),
          lte(recurringInvoiceTemplates.nextRunDate, currentDate),
          isNull(clients.deletedAt),
        ),
      ),
  ]);

  if (rows.length === 0 && page > 1) {
    return listRecurringTemplates(userId, { ...params, page: 1 });
  }

  const currency = branding?.currency ?? CURRENCY_FALLBACK;
  const templateIds = rows.map((row) => row.template.id);

  const itemRows = templateIds.length
    ? await db
        .select()
        .from(recurringInvoiceItems)
        .where(inArray(recurringInvoiceItems.templateId, templateIds))
        .orderBy(recurringInvoiceItems.position)
    : [];

  const itemsByTemplate = new Map<string, TemplateItemRow[]>();
  for (const item of itemRows) {
    const list = itemsByTemplate.get(item.templateId) ?? [];
    list.push(item);
    itemsByTemplate.set(item.templateId, list);
  }

  const total = rows[0]?.totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const templates: RecurringTemplateListItem[] = rows.map((row) => {
    const t = row.template;
    const items = itemsByTemplate.get(t.id) ?? [];
    const { total: computedTotal } = computeInvoiceTotals(
      items.map((item) => ({
        name: item.name,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
      Number(t.taxRate),
    );

    return {
      id: t.id,
      title: t.title,
      frequency: t.frequency,
      startDate: t.startDate,
      nextRunDate: t.nextRunDate,
      lastRunAt: t.lastRunAt?.toISOString() ?? null,
      runCount: t.runCount,
      active: t.active,
      autoSend: t.autoSend,
      clientName: row.clientName,
      clientDeleted: Boolean(row.clientDeletedAt),
      currency,
      total: computedTotal,
    };
  });

  return {
    templates,
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
    dueCount: dueRow[0]?.dueCount ?? 0,
  };
}

/** Fetches an owned recurring invoice schedule with line items and recent generated invoices. */
export async function getRecurringTemplate(
  userId: string,
  templateId: string,
): Promise<RecurringTemplate | null> {
  const [row] = await db
    .select()
    .from(recurringInvoiceTemplates)
    .where(and(ownership(userId), eq(recurringInvoiceTemplates.id, templateId)))
    .limit(1);

  if (!row) return null;

  const [[client], itemRows, generatedRows, branding] = await Promise.all([
    db.select().from(clients).where(eq(clients.id, row.clientId)).limit(1),
    db
      .select()
      .from(recurringInvoiceItems)
      .where(eq(recurringInvoiceItems.templateId, templateId))
      .orderBy(recurringInvoiceItems.position),
    db
      .select({
        invoice: invoices,
        clientName: clients.name,
      })
      .from(invoices)
      .leftJoin(clients, eq(clients.id, invoices.clientId))
      .where(
        and(
          eq(invoices.userId, userId),
          eq(invoices.recurringTemplateId, templateId),
          isNull(invoices.deletedAt),
        ),
      )
      .orderBy(desc(invoices.createdAt))
      .limit(25),
    getBrandingSettings(userId),
  ]);

  const taxRate = Number(row.taxRate);
  const { subtotal, tax, total } = computeInvoiceTotals(
    itemRows.map((item) => ({
      name: item.name,
      quantity: Number(item.quantity),
      unitPrice: Number(item.unitPrice),
    })),
    taxRate,
  );

  const generatedInvoices: InvoiceListItem[] = generatedRows.map((entry) => ({
    id: entry.invoice.id,
    invoiceNumber: entry.invoice.invoiceNumber,
    clientName: entry.clientName,
    status: computeInvoiceStatus(entry.invoice.status, entry.invoice.dueDate),
    issueDate: entry.invoice.issueDate,
    dueDate: entry.invoice.dueDate,
    currency: entry.invoice.currency,
    total: Number(entry.invoice.total),
  }));

  return {
    id: row.id,
    title: row.title,
    frequency: row.frequency,
    startDate: row.startDate,
    nextRunDate: row.nextRunDate,
    lastRunAt: row.lastRunAt?.toISOString() ?? null,
    runCount: row.runCount,
    paymentTermsDays: row.paymentTermsDays,
    taxRate,
    subtotal,
    tax,
    total,
    currency: branding?.currency ?? CURRENCY_FALLBACK,
    publicNotes: row.publicNotes,
    internalNotes: row.internalNotes,
    autoSend: row.autoSend,
    active: row.active,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    client: client ? toClientDto(client) : null,
    items: itemRows.map(toItemDto),
    generatedInvoices,
  };
}

/** Creates a recurring invoice schedule and its line items for an active owned client. */
export async function createRecurringTemplate(
  userId: string,
  values: RecurringTemplateFormValues,
): Promise<RecurringTemplate> {
  await verifyOwnedActiveClient(userId, values.clientId);

  const templateId = crypto.randomUUID();
  const nextRunDate = resolveUpcomingRunDate(
    values.startDate,
    values.frequency,
    today(),
    "create",
  );

  await db.batch([
    db.insert(recurringInvoiceTemplates).values({
      id: templateId,
      userId,
      clientId: values.clientId,
      title: values.title.trim(),
      frequency: values.frequency,
      startDate: values.startDate,
      nextRunDate,
      paymentTermsDays: values.paymentTermsDays,
      taxRate: values.taxRate.toFixed(2),
      publicNotes: values.publicNotes || null,
      internalNotes: values.internalNotes || null,
      autoSend: values.autoSend,
      active: values.active,
      createdBy: userId,
    }),
    db.insert(recurringInvoiceItems).values(
      values.items.map((item, position) => ({
        templateId,
        name: item.name.trim(),
        quantity: item.quantity.toFixed(2),
        unitPrice: item.unitPrice.toFixed(2),
        position,
        createdBy: userId,
      })),
    ),
  ]);

  const created = await getRecurringTemplate(userId, templateId);
  if (!created) {
    throw new Error("Recurring template vanished after creation");
  }
  return created;
}

/** Updates an owned recurring schedule and recalculates `nextRunDate` if schedule terms changed. */
export async function updateRecurringTemplate(
  userId: string,
  templateId: string,
  values: RecurringTemplateFormValues,
): Promise<RecurringTemplate | null> {
  const [existing] = await db
    .select()
    .from(recurringInvoiceTemplates)
    .where(and(ownership(userId), eq(recurringInvoiceTemplates.id, templateId)))
    .limit(1);

  if (!existing) return null;

  await verifyOwnedActiveClient(userId, values.clientId);

  const scheduleChanged =
    values.startDate !== existing.startDate ||
    values.frequency !== existing.frequency;

  const nextRunDate = scheduleChanged
    ? resolveUpcomingRunDate(
        values.startDate,
        values.frequency,
        today(),
        "create",
      )
    : existing.nextRunDate;

  await db.batch([
    db
      .update(recurringInvoiceTemplates)
      .set({
        clientId: values.clientId,
        title: values.title.trim(),
        frequency: values.frequency,
        startDate: values.startDate,
        nextRunDate,
        paymentTermsDays: values.paymentTermsDays,
        taxRate: values.taxRate.toFixed(2),
        publicNotes: values.publicNotes || null,
        internalNotes: values.internalNotes || null,
        autoSend: values.autoSend,
        active: values.active,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(
        and(ownership(userId), eq(recurringInvoiceTemplates.id, templateId)),
      ),
    db
      .delete(recurringInvoiceItems)
      .where(eq(recurringInvoiceItems.templateId, templateId)),
    db.insert(recurringInvoiceItems).values(
      values.items.map((item, position) => ({
        templateId,
        name: item.name.trim(),
        quantity: item.quantity.toFixed(2),
        unitPrice: item.unitPrice.toFixed(2),
        position,
        createdBy: userId,
      })),
    ),
  ]);

  return getRecurringTemplate(userId, templateId);
}

/** Pauses or resumes an owned recurring schedule, re-anchoring past-due dates when resuming. */
export async function toggleRecurringTemplate(
  userId: string,
  templateId: string,
  active: boolean,
): Promise<RecurringTemplate | null> {
  const [existing] = await db
    .select()
    .from(recurringInvoiceTemplates)
    .where(and(ownership(userId), eq(recurringInvoiceTemplates.id, templateId)))
    .limit(1);

  if (!existing) return null;

  if (active) {
    await verifyOwnedActiveClient(userId, existing.clientId);
  }

  const currentDate = today();
  const nextRunDate =
    active && existing.nextRunDate < currentDate
      ? resolveUpcomingRunDate(
          existing.startDate,
          existing.frequency,
          currentDate,
          "resume",
        )
      : existing.nextRunDate;

  await db
    .update(recurringInvoiceTemplates)
    .set({
      active,
      nextRunDate,
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(and(ownership(userId), eq(recurringInvoiceTemplates.id, templateId)));

  return getRecurringTemplate(userId, templateId);
}

/** Permanently deletes an owned recurring schedule while retaining generated invoices. */
export async function deleteRecurringTemplate(
  userId: string,
  templateId: string,
): Promise<boolean> {
  const deleted = await db
    .delete(recurringInvoiceTemplates)
    .where(and(ownership(userId), eq(recurringInvoiceTemplates.id, templateId)))
    .returning({ id: recurringInvoiceTemplates.id });

  return deleted.length > 0;
}

/** Emits a concrete invoice row via `createInvoice` using the schedule's terms, items, and notes. */
async function emitInvoiceForTemplate(
  template: TemplateRow,
  items: TemplateItemRow[],
  issueDate: string,
) {
  if (items.length === 0) {
    throw new RecurringServiceError(
      "Recurring invoice has no line items",
      400,
    );
  }

  const dueDate = computeDueDate(issueDate, template.paymentTermsDays);

  return createInvoice(template.userId, {
    status: template.autoSend ? "pending" : "draft",
    recurringTemplateId: template.id,
    recurringTemplateTitle: template.title,
    values: {
      clientId: template.clientId,
      issueDate,
      dueDate,
      notes: template.publicNotes ?? "",
      internalNotes: template.internalNotes ?? "",
      taxRate: Number(template.taxRate),
      items: items.map((item) => ({
        name: item.name,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
      })),
    },
  });
}

/**
 * Generates an ad-hoc invoice immediately from a template without altering
 * its scheduled `nextRunDate`.
 */
export async function generateInvoiceNow(userId: string, templateId: string) {
  const [template] = await db
    .select()
    .from(recurringInvoiceTemplates)
    .where(and(ownership(userId), eq(recurringInvoiceTemplates.id, templateId)))
    .limit(1);

  if (!template) return null;

  await verifyOwnedActiveClient(userId, template.clientId);

  const items = await db
    .select()
    .from(recurringInvoiceItems)
    .where(eq(recurringInvoiceItems.templateId, templateId))
    .orderBy(recurringInvoiceItems.position);

  const invoice = await emitInvoiceForTemplate(template, items, today());

  await db
    .update(recurringInvoiceTemplates)
    .set({
      lastRunAt: new Date(),
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(and(ownership(userId), eq(recurringInvoiceTemplates.id, templateId)));

  return invoice;
}

/**
 * Finds all active templates due on or before today (optionally scoped to one user),
 * atomically claims each template cycle before generating its invoice, and advances
 * `nextRunDate` without day-of-month drift.
 */
export async function processDueRecurringTemplates(options?: {
  userId?: string;
}): Promise<ProcessDueResult> {
  const currentDate = today();
  const conditions = [
    eq(recurringInvoiceTemplates.active, true),
    lte(recurringInvoiceTemplates.nextRunDate, currentDate),
  ];

  if (options?.userId) {
    conditions.push(eq(recurringInvoiceTemplates.userId, options.userId));
  }

  const dueRows = await db
    .select({
      template: recurringInvoiceTemplates,
      clientDeletedAt: clients.deletedAt,
    })
    .from(recurringInvoiceTemplates)
    .leftJoin(clients, eq(clients.id, recurringInvoiceTemplates.clientId))
    .where(and(...conditions));

  let generated = 0;
  let paused = 0;
  let failed = 0;

  for (const row of dueRows) {
    const template = row.template;

    if (row.clientDeletedAt !== null) {
      await db
        .update(recurringInvoiceTemplates)
        .set({
          active: false,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(recurringInvoiceTemplates.id, template.id),
            eq(recurringInvoiceTemplates.active, true),
          ),
        );
      paused += 1;
      continue;
    }

    const nextCycle = template.runCount + 1;
    const nextRunDate = computeNextCycleAfterRun(
      template.startDate,
      template.frequency,
      nextCycle,
      currentDate,
    );

    // Atomic compare-and-set prevents duplicate billing under concurrent runs.
    const [claimed] = await db
      .update(recurringInvoiceTemplates)
      .set({
        nextRunDate,
        runCount: nextCycle,
        lastRunAt: new Date(),
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(recurringInvoiceTemplates.id, template.id),
          eq(recurringInvoiceTemplates.active, true),
          eq(recurringInvoiceTemplates.nextRunDate, template.nextRunDate),
        ),
      )
      .returning();

    if (!claimed) {
      continue;
    }

    try {
      const items = await db
        .select()
        .from(recurringInvoiceItems)
        .where(eq(recurringInvoiceItems.templateId, template.id))
        .orderBy(recurringInvoiceItems.position);

      await emitInvoiceForTemplate(template, items, currentDate);
      generated += 1;
    } catch (error) {
      console.error(
        `Failed generating invoice for recurring template ${template.id}:`,
        error,
      );
      // Roll back the claimed cycle so the next run can retry safely.
      await db
        .update(recurringInvoiceTemplates)
        .set({
          nextRunDate: template.nextRunDate,
          runCount: template.runCount,
          lastRunAt: template.lastRunAt,
          updatedAt: new Date(),
        })
        .where(eq(recurringInvoiceTemplates.id, template.id))
        .catch(() => undefined);
      failed += 1;
    }
  }

  return {
    processed: dueRows.length,
    generated,
    paused,
    failed,
  };
}

