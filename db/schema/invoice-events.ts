import {
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { invoices } from "./invoices";
import { users } from "./users";

export const invoiceEventType = pgEnum("invoice_event_type", [
  "created",
  "updated",
  "sent",
  "paid",
  "deleted",
  "shared",
  "downloaded",
]);

// Append-only audit trail. Events survive invoice soft-deletion so the
// history of a removed invoice is not lost.
export const invoiceEvents = pgTable(
  "invoice_events",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    invoiceId: uuid("invoice_id")
      .references(() => invoices.id, { onDelete: "cascade" })
      .notNull(),
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    eventType: invoiceEventType("event_type").notNull(),

    // Human-readable, server-generated (e.g. "Invoice INV-0001 created").
    description: text("description").notNull(),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => [
    // Timeline query: WHERE invoice_id = ? ORDER BY created_at DESC.
    index("invoice_events_invoice_created_idx").on(
      table.invoiceId,
      table.createdAt.desc(),
    ),
    index("invoice_events_user_id_idx").on(table.userId),
    index("invoice_events_type_idx").on(table.eventType),
  ],
);

export type InvoiceEventRow = typeof invoiceEvents.$inferSelect;
export type NewInvoiceEvent = typeof invoiceEvents.$inferInsert;
