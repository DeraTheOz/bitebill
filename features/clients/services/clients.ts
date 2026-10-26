import "server-only";

import { and, desc, eq, ilike, isNull, not, or, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { clients } from "@/db/schema";
import { generateAvatar } from "@/lib/avatar";
import type { ClientFormValues } from "../schemas/client-schema";
import type {
  Client,
  ClientActivityFilter,
  ClientListItem,
  ClientListPagination,
} from "../types/client";

type ClientRow = typeof clients.$inferSelect;

export type ClientListParams = {
  page: number;
  pageSize: number;
  q?: string;
  activity?: ClientActivityFilter;
};

export type PaginatedClients = {
  clients: ClientListItem[];
  pagination: ClientListPagination;
};

/**
 * Empty form strings map to SQL NULL so the API stays ergonomic for
 * the frontend while the database keeps true nullability.
 */
function toNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

const invoiceCountSql = sql<number>`(
  select count(*)::int from "invoices"
  where "invoices"."client_id" = "clients"."id"
    and "invoices"."deleted_at" is null
)`.as("invoice_count");

const hasInvoicesSql = sql`exists (
  select 1 from "invoices"
  where "invoices"."client_id" = "clients"."id"
    and "invoices"."deleted_at" is null
)`;

function toClientDto(row: ClientRow): Client {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    company: row.company,
    image: row.image,
    address: {
      addressLine1: row.addressLine1,
      addressLine2: row.addressLine2,
      city: row.city,
      state: row.state,
      country: row.country,
    },
    notes: row.notes,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

const ownership = (userId: string) => eq(clients.userId, userId);
const notDeleted = () => isNull(clients.deletedAt);

/** Escapes ILIKE wildcards so user input matches literally. */
function ilikePattern(term: string) {
  return `%${term.replace(/[\\%_]/g, "\\$&")}%`;
}

function searchFilter(q?: string) {
  const term = q?.trim();
  if (!term) return undefined;

  const pattern = ilikePattern(term);
  return or(
    ilike(clients.name, pattern),
    ilike(clients.email, pattern),
    ilike(clients.company, pattern),
  );
}

function activityFilter(activity?: ClientActivityFilter) {
  if (!activity) return undefined;
  return activity === "with" ? hasInvoicesSql : not(hasInvoicesSql);
}

export async function listClients(
  userId: string,
  params: ClientListParams,
): Promise<PaginatedClients> {
  const { page, pageSize, q, activity } = params;

  // `count(*) over()` returns the total matching rows alongside each
  // page row, so list + total cost a single query.
  const rows = await db
    .select({
      client: clients,
      invoiceCount: invoiceCountSql,
      total: sql<number>`(count(*) over())::int`.as("total"),
    })
    .from(clients)
    .where(
      and(
        ownership(userId),
        notDeleted(),
        searchFilter(q),
        activityFilter(activity),
      ),
    )
    .orderBy(desc(clients.createdAt))
    .limit(pageSize)
    .offset((page - 1) * pageSize);

  // An empty result on a later page (e.g. items deleted while viewing
  // it) would otherwise lose the real total. Retry once at page 1.
  if (rows.length === 0 && page > 1) {
    return listClients(userId, { ...params, page: 1 });
  }

  const total = rows[0]?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    clients: rows.map((row) => ({
      ...toClientDto(row.client),
      invoiceCount: row.invoiceCount,
    })),
    pagination: {
      page,
      pageSize,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}

export async function getClient(
  userId: string,
  clientId: string,
): Promise<Client | null> {
  const [row] = await db
    .select()
    .from(clients)
    .where(and(ownership(userId), eq(clients.id, clientId), notDeleted()))
    .limit(1);

  return row ? toClientDto(row) : null;
}

export async function createClient(
  userId: string,
  input: ClientFormValues,
): Promise<Client> {
  const [row] = await db
    .insert(clients)
    .values({
      userId,
      name: input.name.trim(),
      email: toNull(input.email),
      phone: toNull(input.phone),
      company: toNull(input.company),
      addressLine1: toNull(input.addressLine1),
      addressLine2: toNull(input.addressLine2),
      city: toNull(input.city),
      state: toNull(input.state),
      country: toNull(input.country),
      notes: toNull(input.notes),
      image: generateAvatar(),
      createdBy: userId,
      updatedBy: userId,
    })
    .returning();

  return toClientDto(row);
}

export async function updateClient(
  userId: string,
  clientId: string,
  input: ClientFormValues,
): Promise<Client | null> {
  const [row] = await db
    .update(clients)
    .set({
      name: input.name.trim(),
      email: toNull(input.email),
      phone: toNull(input.phone),
      company: toNull(input.company),
      addressLine1: toNull(input.addressLine1),
      addressLine2: toNull(input.addressLine2),
      city: toNull(input.city),
      state: toNull(input.state),
      country: toNull(input.country),
      notes: toNull(input.notes),
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(and(ownership(userId), eq(clients.id, clientId), notDeleted()))
    .returning();

  return row ? toClientDto(row) : null;
}

export async function deleteClient(
  userId: string,
  clientId: string,
): Promise<boolean> {
  const rows = await db
    .update(clients)
    .set({
      deletedAt: new Date(),
      updatedBy: userId,
      updatedAt: new Date(),
    })
    .where(and(ownership(userId), eq(clients.id, clientId), notDeleted()))
    .returning({ id: clients.id });

  return rows.length > 0;
}
