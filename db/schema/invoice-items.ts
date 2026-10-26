import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  numeric,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { invoices } from "./invoices";
import { users } from "./users";

export const invoiceItems = pgTable(
  "invoice_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    invoiceId: uuid("invoice_id")
      .references(() => invoices.id, { onDelete: "cascade" })
      .notNull(),

    name: text("name").notNull(),

    quantity: numeric("quantity", { precision: 12, scale: 2 }).notNull(),
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
    // Server-computed: quantity × unitPrice.
    total: numeric("total", { precision: 12, scale: 2 }).notNull(),
    position: integer("position").notNull(),

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
  },
  (table) => [
    // Ordered fetch for a single invoice's line items.
    index("invoice_items_invoice_position_idx").on(
      table.invoiceId,
      table.position,
    ),
    check("invoice_items_quantity_non_negative", sql`${table.quantity} >= 0`),
    check(
      "invoice_items_unit_price_non_negative",
      sql`${table.unitPrice} >= 0`,
    ),
    check("invoice_items_total_non_negative", sql`${table.total} >= 0`),
  ],
);

export type InvoiceItemRow = typeof invoiceItems.$inferSelect;
export type NewInvoiceItem = typeof invoiceItems.$inferInsert;
