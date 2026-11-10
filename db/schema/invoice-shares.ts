import { sql } from "drizzle-orm";
import {
  check,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { invoices } from "./invoices";

export const invoiceShares = pgTable(
  "invoice_shares",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    invoiceId: uuid("invoice_id")
      .references(() => invoices.id, { onDelete: "cascade" })
      .notNull(),

    token: text("token").notNull(),

    viewCount: integer("view_count").default(0).notNull(),
    lastViewedAt: timestamp("last_viewed_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    uniqueIndex("invoice_shares_token_idx").on(table.token),
    uniqueIndex("invoice_shares_invoice_id_idx").on(table.invoiceId),
    check(
      "invoice_shares_view_count_non_negative",
      sql`${table.viewCount} >= 0`,
    ),
  ],
);

export type InvoiceShareRow = typeof invoiceShares.$inferSelect;
export type NewInvoiceShare = typeof invoiceShares.$inferInsert;

