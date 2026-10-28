import { sql } from "drizzle-orm";
import {
  check,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { clients } from "./clients";
import { users } from "./users";

// `overdue` is intentionally NOT part of this enum
export const invoiceStatus = pgEnum("invoice_status", [
  "draft",
  "pending",
  "paid",
]);

const money = (name: string) =>
  numeric(name, { precision: 12, scale: 2 }).notNull();

export const invoices = pgTable(
  "invoices",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),

    // App-level client deletion is a soft delete, so history survives.
    // The DB cascade only fires on hard user deletion, where invoices
    // must be removed too (RESTRICT would break the user cascade).
    clientId: uuid("client_id")
      .references(() => clients.id, { onDelete: "cascade" })
      .notNull(),

    // Human-facing number (INV-0001) plus the numeric sequence that
    // produced it. Both are unique per user; the sequence is the
    // concurrency-safe counter.
    invoiceNumber: text("invoice_number").notNull(),
    invoiceSequence: integer("invoice_sequence").notNull(),

    status: invoiceStatus("status").default("draft").notNull(),

    issueDate: date("issue_date").notNull(),
    dueDate: date("due_date").notNull(),
    currency: text("currency").default("GBP").notNull(),

    // Server-computed only. Never populated from client input.
    subtotal: money("subtotal").default("0"),
    taxRate: numeric("tax_rate", { precision: 5, scale: 2 })
      .default("0")
      .notNull(),
    tax: money("tax").default("0"),
    discount: money("discount").default("0"),
    total: money("total").default("0"),

    publicNotes: text("public_notes"),
    internalNotes: text("internal_notes"),

    pdfTemplate: text("pdf_template").default("classic").notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),

    createdBy: uuid("created_by")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    updatedBy: uuid("updated_by").references(() => users.id, {
      onDelete: "set null",
    }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    // Soft delete — invoices are never hard-deleted by the app.
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    // Serves the paginated list: WHERE user_id = ? ORDER BY created_at DESC.
    index("invoices_user_created_idx").on(table.userId, table.createdAt.desc()),
    index("invoices_client_id_idx").on(table.clientId),
    index("invoices_status_idx").on(table.status),
    uniqueIndex("invoices_user_number_idx").on(
      table.userId,
      table.invoiceNumber,
    ),
    uniqueIndex("invoices_user_sequence_idx").on(
      table.userId,
      table.invoiceSequence,
    ),
    check(
      "invoices_due_after_issue",
      sql`${table.dueDate} >= ${table.issueDate}`,
    ),
    check(
      "invoices_amounts_non_negative",
      sql`${table.subtotal} >= 0 AND ${table.tax} >= 0 AND ${table.discount} >= 0 AND ${table.total} >= 0`,
    ),
    check(
      "invoices_tax_rate_range",
      sql`${table.taxRate} >= 0 AND ${table.taxRate} <= 100`,
    ),
  ],
);

export type InvoiceRow = typeof invoices.$inferSelect;
export type NewInvoice = typeof invoices.$inferInsert;
