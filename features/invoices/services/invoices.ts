import "server-only";

import {
  and,
  desc,
  eq,
  ilike,
  isNull,
  lt,
  ne,
  not,
  or,
  sql,
} from "drizzle-orm";
import type { SQL } from "drizzle-orm";
import { db } from "@/db/client";
import { clients, invoiceEvents, invoiceItems, invoices } from "@/db/schema";
import { getBrandingSettings } from "@/features/branding/services/branding";
import type {
  InvoiceFormValues,
  InvoiceItemValues,
  InvoiceStatusIntent,
} from "../schemas/invoice-schema";
import type {
  Invoice,
  InvoiceClient,
  InvoiceEvent,
  InvoiceEventType,
  InvoiceItem,
  InvoiceListItem,
  InvoiceListPagination,
  InvoiceStatus,
  InvoiceSummary,
  StoredInvoiceStatus,
} from "../types/invoice";

type InvoiceRow = typeof invoices.$inferSelect;
type InvoiceItemRow = typeof invoiceItems.$inferSelect;
type InvoiceEventRow = typeof invoiceEvents.$inferSelect;
type ClientRow = typeof clients.$inferSelect;

const NUMBER_FALLBACK_PREFIX = "INV";
const CURRENCY_FALLBACK = "GBP";
const PDF_TEMPLATE_FALLBACK = "classic";

export type InvoiceListParams = {
  page: number;
  pageSize: number;
  status?: InvoiceStatus[];
  clientId?: string;
  q?: string;
};

export type InvoiceListResult = {
  invoices: InvoiceListItem[];
  pagination: InvoiceListPagination;
  summary?: InvoiceSummary;
};

const round2 = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

const money = (value: number) => round2(value).toFixed(2);

const today = () => new Date().toISOString().slice(0, 10);

const ownership = (userId: string) => eq(invoices.userId, userId);
const notDeleted = () => isNull(invoices.deletedAt);

function overdueSql(): SQL<unknown> {
  return and(lt(invoices.dueDate, today()), ne(invoices.status, "paid"))!;
}

/** Filters match the *displayed* status, so rows always agree with the badge. */
function statusFilter(status?: InvoiceStatus[]) {
  if (!status?.length) return undefined;

  const conditions = status.map((value) => {
    if (value === "overdue") return overdueSql();
    if (value === "paid") return eq(invoices.status, "paid");
    return and(eq(invoices.status, value), not(overdueSql()));
  });

  return or(...conditions);
}

/** Escapes ILIKE wildcards so user input matches literally. */
function ilikePattern(term: string) {
  return `%${term.replace(/[\\%_]/g, "\\$&")}%`;
}

function searchFilter(q?: string) {
  const term = q?.trim();
  if (!term) return undefined;

  const pattern = ilikePattern(term);
  return or(
    ilike(invoices.invoiceNumber, pattern),
    ilike(clients.name, pattern),
  );
}

/** Stored status plus computed overdue, per the schema spec. */
function toStatus(row: InvoiceRow): InvoiceStatus {
  if (row.status !== "paid" && row.dueDate < today()) return "overdue";
  return row.status;
}

function toItemDto(row: InvoiceItemRow): InvoiceItem {
  return {
    id: row.id,
    name: row.name,
    quantity: Number(row.quantity),
    unitPrice: Number(row.unitPrice),
    total: Number(row.total),
    position: row.position,
  };
}

function toEventDto(row: InvoiceEventRow): InvoiceEvent {
  return {
    id: row.id,
    eventType: row.eventType,
    description: row.description,
    createdAt: row.createdAt.toISOString(),
  };
}

function toClientDto(row: ClientRow): InvoiceClient {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    company: row.company,
    address: {
      addressLine1: row.addressLine1,
      addressLine2: row.addressLine2,
      city: row.city,
      state: row.state,
      country: row.country,
    },
  };
}

function toInvoiceDto(
  row: InvoiceRow,
  client: ClientRow | null,
  items: InvoiceItemRow[],
  events: InvoiceEventRow[],
): Invoice {
  return {
    id: row.id,
    invoiceNumber: row.invoiceNumber,
    status: toStatus(row),
    issueDate: row.issueDate,
    dueDate: row.dueDate,
    currency: row.currency,
    subtotal: Number(row.subtotal),
    tax: Number(row.tax),
    discount: Number(row.discount),
    total: Number(row.total),
    publicNotes: row.publicNotes,
    paidAt: row.paidAt?.toISOString() ?? null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    client: client ? toClientDto(client) : null,
    items: items.map(toItemDto),
    events: events.map(toEventDto),
  };
}

/**
 * Computes line totals and rollups. The client never supplies these
 * values, totals are always derived from quantities and unit prices.
 */
function computeTotals(items: InvoiceItemValues[]) {
  const normalized = items.map((item, index) => {
    const total = round2(item.quantity * item.unitPrice);
    return {
      name: item.name.trim(),
      quantity: money(item.quantity),
      unitPrice: money(item.unitPrice),
      total: money(total),
      position: index,
      totalNumber: total,
    };
  });

  const subtotal = round2(
    normalized.reduce((sum, item) => sum + item.totalNumber, 0),
  );
  const tax = 0;
  const discount = 0;
  const total = round2(subtotal - discount + tax);

  return { normalized, subtotal, tax, discount, total };
}

function eventValues(
  invoiceId: string,
  userId: string,
  eventType: InvoiceEventType,
  description: string,
) {
  return { invoiceId, userId, eventType, description };
}

function isUniqueViolation(error: unknown) {
  return (error as { code?: string }).code === "23505";
}

export async function listInvoices(
  userId: string,
  params: InvoiceListParams,
): Promise<InvoiceListResult> {
  const { page, pageSize, status, clientId, q } = params;

  const conditions = [ownership(userId), notDeleted()];
  if (clientId) conditions.push(eq(invoices.clientId, clientId));

  const filter = statusFilter(status);
  if (filter) conditions.push(filter);

  const search = searchFilter(q);
  if (search) conditions.push(search);

  const rows = await db
    .select({
      invoice: invoices,
      clientName: clients.name,
      total: sql<number>`(count(*) over())::int`.as("total"),
    })
    .from(invoices)
    .leftJoin(clients, eq(clients.id, invoices.clientId))
    .where(and(...conditions))
    .orderBy(desc(invoices.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  // An empty page beyond page 1 loses the total. Recover it.
  if (rows.length === 0 && page > 1) {
    return listInvoices(userId, { ...params, page: 1 });
  }

  const total = rows[0]?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const summary = clientId
    ? await getClientInvoiceSummary(userId, clientId)
    : undefined;

  return {
    invoices: rows.map((row) => ({
      id: row.invoice.id,
      invoiceNumber: row.invoice.invoiceNumber,
      clientName: row.clientName,
      status: toStatus(row.invoice),
      issueDate: row.invoice.issueDate,
      dueDate: row.invoice.dueDate,
      currency: row.invoice.currency,
      total: Number(row.invoice.total),
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
    summary,
  };
}

/**
 * Aggregates across every invoice of one client so the client detail
 * page and invoice section can show real counts and money totals
 * without fetching all rows.
 */
async function getClientInvoiceSummary(
  userId: string,
  clientId: string,
): Promise<InvoiceSummary> {
  const [row] = await db
    .select({
      all: sql<number>`count(*)::int`,
      // Counts mirror the displayed status exactly: overdue-dated
      // drafts/pending items are counted under overdue, not their
      // stored status.
      draft: sql<number>`(count(*) filter (where ${invoices.status} = 'draft' and ${invoices.dueDate} >= ${today()}))::int`,
      pending: sql<number>`(count(*) filter (where ${invoices.status} = 'pending' and ${invoices.dueDate} >= ${today()}))::int`,
      paid: sql<number>`(count(*) filter (where ${invoices.status} = 'paid'))::int`,
      overdue: sql<number>`(count(*) filter (where ${overdueSql()}))::int`,
      billed: sql<string>`coalesce(sum(${invoices.total}) filter (where ${invoices.status} <> 'draft'), 0)`,
      paidTotal: sql<string>`coalesce(sum(${invoices.total}) filter (where ${invoices.status} = 'paid'), 0)`,
      outstanding: sql<string>`coalesce(sum(${invoices.total}) filter (where ${invoices.status} not in ('draft', 'paid')), 0)`,
    })
    .from(invoices)
    .where(
      and(ownership(userId), notDeleted(), eq(invoices.clientId, clientId)),
    );

  if (!row) {
    return {
      counts: { all: 0, draft: 0, pending: 0, paid: 0, overdue: 0 },
      billed: 0,
      paidTotal: 0,
      outstanding: 0,
    };
  }

  return {
    counts: {
      all: row.all,
      draft: row.draft,
      pending: row.pending,
      paid: row.paid,
      overdue: row.overdue,
    },
    billed: Number(row.billed),
    paidTotal: Number(row.paidTotal),
    outstanding: Number(row.outstanding),
  };
}

export async function getInvoice(
  userId: string,
  invoiceId: string,
): Promise<Invoice | null> {
  const [row] = await db
    .select()
    .from(invoices)
    .where(and(ownership(userId), eq(invoices.id, invoiceId), notDeleted()));

  if (!row) return null;

  const [[client], items, events] = await Promise.all([
    // The client may be soft-deleted; invoice history still shows it.
    db.select().from(clients).where(eq(clients.id, row.clientId)).limit(1),
    db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoiceId))
      .orderBy(invoiceItems.position),
    db
      .select()
      .from(invoiceEvents)
      .where(
        and(
          eq(invoiceEvents.invoiceId, invoiceId),
          eq(invoiceEvents.userId, userId),
        ),
      )
      .orderBy(desc(invoiceEvents.createdAt)),
  ]);

  return toInvoiceDto(row, client ?? null, items, events);
}

export async function createInvoice(
  userId: string,
  input: { status: InvoiceStatusIntent; values: InvoiceFormValues },
): Promise<Invoice> {
  const invoiceId = crypto.randomUUID();
  const { normalized, subtotal, tax, discount, total } = computeTotals(
    input.values.items,
  );

  const branding = await getBrandingSettings(userId);
  const prefix = branding?.invoicePrefix ?? NUMBER_FALLBACK_PREFIX;
  const currency = branding?.currency ?? CURRENCY_FALLBACK;
  const pdfTemplate = branding?.defaultPdfTemplate ?? PDF_TEMPLATE_FALLBACK;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const [sequenceRow] = await db
      .select({
        // Includes soft-deleted rows so numbers are never reused.
        next: sql<number>`(coalesce(max(${invoices.invoiceSequence}), 0) + 1)::int`,
      })
      .from(invoices)
      .where(ownership(userId));

    const sequence = sequenceRow?.next ?? 1;
    const invoiceNumber = `${prefix}-${String(sequence).padStart(4, "0")}`;

    try {
      await db.batch([
        db.insert(invoices).values({
          id: invoiceId,
          userId,
          clientId: input.values.clientId,
          invoiceNumber,
          invoiceSequence: sequence,
          status: input.status,
          issueDate: input.values.issueDate,
          dueDate: input.values.dueDate,
          currency,
          pdfTemplate,
          subtotal: money(subtotal),
          tax: money(tax),
          discount: money(discount),
          total: money(total),
          publicNotes: input.values.notes || null,
          createdBy: userId,
        }),
        db.insert(invoiceItems).values(
          normalized.map((item) => ({
            invoiceId,
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            total: item.total,
            position: item.position,
            createdBy: userId,
          })),
        ),
        db
          .insert(invoiceEvents)
          .values(
            eventValues(
              invoiceId,
              userId,
              "created",
              `Invoice ${invoiceNumber} created`,
            ),
          ),
      ]);

      const invoice = await getInvoice(userId, invoiceId);
      if (!invoice) throw new Error("Invoice vanished after creation");
      return invoice;
    } catch (error) {
      // Concurrent creates may have taken the sequence — recompute once.
      if (attempt === 0 && isUniqueViolation(error)) continue;
      throw error;
    }
  }

  throw new Error("Could not allocate an invoice number");
}

export async function updateInvoice(
  userId: string,
  invoiceId: string,
  input: { status?: InvoiceStatusIntent; values: InvoiceFormValues },
): Promise<Invoice | null> {
  const [existing] = await db
    .select()
    .from(invoices)
    .where(and(ownership(userId), eq(invoices.id, invoiceId), notDeleted()));

  if (!existing) return null;

  // Paid invoices are terminal. Never downgrade them on edit.
  const nextStatus: StoredInvoiceStatus =
    existing.status === "paid" ? "paid" : (input.status ?? existing.status);

  const { normalized, subtotal, tax, discount, total } = computeTotals(
    input.values.items,
  );

  await db.batch([
    db
      .update(invoices)
      .set({
        clientId: input.values.clientId,
        status: nextStatus,
        issueDate: input.values.issueDate,
        dueDate: input.values.dueDate,
        subtotal: money(subtotal),
        tax: money(tax),
        discount: money(discount),
        total: money(total),
        publicNotes: input.values.notes || null,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(and(ownership(userId), eq(invoices.id, invoiceId))),
    db.delete(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId)),
    db.insert(invoiceItems).values(
      normalized.map((item) => ({
        invoiceId,
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        total: item.total,
        position: item.position,
        createdBy: userId,
      })),
    ),
    db
      .insert(invoiceEvents)
      .values(
        eventValues(
          invoiceId,
          userId,
          "updated",
          `Invoice ${existing.invoiceNumber} updated`,
        ),
      ),
  ]);

  return getInvoice(userId, invoiceId);
}

export async function markInvoicePaid(
  userId: string,
  invoiceId: string,
): Promise<
  { outcome: "paid"; invoice: Invoice } | { outcome: "already-paid" } | null
> {
  const [existing] = await db
    .select()
    .from(invoices)
    .where(and(ownership(userId), eq(invoices.id, invoiceId), notDeleted()));

  if (!existing) return null;
  if (existing.status === "paid") return { outcome: "already-paid" };

  await db.batch([
    db
      .update(invoices)
      .set({
        status: "paid",
        paidAt: new Date(),
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(and(ownership(userId), eq(invoices.id, invoiceId))),
    db
      .insert(invoiceEvents)
      .values(
        eventValues(
          invoiceId,
          userId,
          "paid",
          `Invoice ${existing.invoiceNumber} marked as paid`,
        ),
      ),
  ]);

  const invoice = await getInvoice(userId, invoiceId);
  if (!invoice) return null;
  return { outcome: "paid", invoice };
}

export async function deleteInvoice(
  userId: string,
  invoiceId: string,
): Promise<boolean> {
  const [existing] = await db
    .select()
    .from(invoices)
    .where(and(ownership(userId), eq(invoices.id, invoiceId), notDeleted()));

  if (!existing) return false;

  const deleted = await db.batch([
    db
      .update(invoices)
      .set({ deletedAt: new Date(), updatedBy: userId })
      .where(and(ownership(userId), eq(invoices.id, invoiceId)))
      .returning({ id: invoices.id }),
    db
      .insert(invoiceEvents)
      .values(
        eventValues(
          invoiceId,
          userId,
          "deleted",
          `Invoice ${existing.invoiceNumber} deleted`,
        ),
      ),
  ]);

  return deleted[0].length > 0;
}
