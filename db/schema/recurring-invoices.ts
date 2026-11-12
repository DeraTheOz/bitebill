import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { clients } from "./clients";
import { users } from "./users";

export const recurringFrequency = pgEnum("recurring_frequency", [
  "monthly",
  "quarterly",
  "yearly",
]);

export const recurringInvoiceTemplates = pgTable(
  "recurring_invoice_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    clientId: uuid("client_id")
      .references(() => clients.id, { onDelete: "cascade" })
      .notNull(),

    title: text("title").notNull(),
    frequency: recurringFrequency("frequency").default("monthly").notNull(),

    startDate: date("start_date").notNull(),
    nextRunDate: date("next_run_date").notNull(),
    lastRunAt: timestamp("last_run_at", { withTimezone: true }),
    runCount: integer("run_count").default(0).notNull(),

    paymentTermsDays: integer("payment_terms_days").default(14).notNull(),
    taxRate: numeric("tax_rate", { precision: 5, scale: 2 })
      .default("0")
      .notNull(),

    publicNotes: text("public_notes"),
    internalNotes: text("internal_notes"),

    autoSend: boolean("auto_send").default(true).notNull(),
    active: boolean("active").default(true).notNull(),

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
    index("recurring_templates_user_created_idx").on(
      table.userId,
      table.createdAt.desc(),
    ),
    index("recurring_templates_client_id_idx").on(table.clientId),
    index("recurring_templates_due_idx").on(table.active, table.nextRunDate),
    check(
      "recurring_templates_tax_rate_range",
      sql`${table.taxRate} >= 0 AND ${table.taxRate} <= 100`,
    ),
    check(
      "recurring_templates_terms_range",
      sql`${table.paymentTermsDays} >= 0 AND ${table.paymentTermsDays} <= 365`,
    ),
    check(
      "recurring_templates_run_count_non_negative",
      sql`${table.runCount} >= 0`,
    ),
  ],
);

export const recurringInvoiceItems = pgTable(
  "recurring_invoice_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    templateId: uuid("template_id")
      .references(() => recurringInvoiceTemplates.id, { onDelete: "cascade" })
      .notNull(),

    name: text("name").notNull(),
    quantity: numeric("quantity", { precision: 12, scale: 2 }).notNull(),
    unitPrice: numeric("unit_price", { precision: 12, scale: 2 }).notNull(),
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
    index("recurring_items_template_position_idx").on(
      table.templateId,
      table.position,
    ),
    check(
      "recurring_items_quantity_non_negative",
      sql`${table.quantity} >= 0`,
    ),
    check(
      "recurring_items_unit_price_non_negative",
      sql`${table.unitPrice} >= 0`,
    ),
  ],
);

export type RecurringInvoiceTemplateRow =
  typeof recurringInvoiceTemplates.$inferSelect;
export type NewRecurringInvoiceTemplate =
  typeof recurringInvoiceTemplates.$inferInsert;
export type RecurringInvoiceItemRow = typeof recurringInvoiceItems.$inferSelect;
export type NewRecurringInvoiceItem = typeof recurringInvoiceItems.$inferInsert;

