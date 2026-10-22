import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users";

export const clients = pgTable(
  "clients",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    // Better Auth owns user records; user_id stores the session user id.
    // Must be uuid to match neon_auth."user".id.
    // ON DELETE CASCADE preserves the spec rule: deleting a user
    // deletes their clients.
    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    name: text("name").notNull(),
    email: text("email"),
    phone: text("phone"),
    image: text("image"),
    company: text("company"),
    addressLine1: text("address_line1"),
    addressLine2: text("address_line2"),
    city: text("city"),
    state: text("state"),
    country: text("country"),

    notes: text("notes"),

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

    // Soft delete. Preserve invoice history.
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => [
    // Composite index serves the paginated list query:
    // WHERE user_id = ? [AND ILIKE …] ORDER BY created_at DESC LIMIT/OFFSET.
    index("clients_user_created_idx").on(table.userId, table.createdAt.desc()),
    index("clients_user_id_idx").on(table.userId),
    index("clients_email_idx").on(table.email),
    index("clients_company_idx").on(table.company),
  ],
);

export type Client = typeof clients.$inferSelect;
export type NewClient = typeof clients.$inferInsert;
