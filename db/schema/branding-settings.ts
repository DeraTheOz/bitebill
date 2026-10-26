import { sql } from "drizzle-orm";
import {
  check,
  pgEnum,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { users } from "./users";

export const pdfTemplate = pgEnum("pdf_template", [
  "classic",
  "modern",
  "corporate",
]);

// One row per user. The row's existence is the "onboarding complete"
// marker, so there is deliberately no soft delete: settings are
// overwritten in place and removed only when the user is deleted.
export const brandingSettings = pgTable(
  "branding_settings",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .references(() => users.id, { onDelete: "cascade" })
      .notNull(),
    businessName: text("business_name").notNull(),
    businessEmail: text("business_email").notNull(),
    businessPhone: text("business_phone"),
    website: text("website"),

    addressLine1: text("address_line1"),
    addressLine2: text("address_line2"),
    city: text("city"),
    state: text("state"),
    country: text("country"),

    currency: text("currency").default("USD").notNull(),

    // Base64 data URL. Served through /api/branding/logo so list and
    // settings responses never carry the image bytes.
    logoUrl: text("logo_url"),

    invoicePrefix: text("invoice_prefix").default("BB").notNull(),
    defaultTerms: text("default_terms"),
    defaultPdfTemplate: pdfTemplate("default_pdf_template")
      .default("classic")
      .notNull(),

    brandColor: text("brand_color").default("#7C5DFA").notNull(),

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
    uniqueIndex("branding_settings_user_id_idx").on(table.userId),
    check(
      "branding_settings_currency_format",
      sql`${table.currency} ~ '^[A-Z]{3}$'`,
    ),
    check(
      "branding_settings_invoice_prefix_format",
      sql`${table.invoicePrefix} ~ '^[A-Z0-9]{1,6}$'`,
    ),
    check(
      "branding_settings_brand_color_format",
      sql`${table.brandColor} ~ '^#[0-9A-Fa-f]{6}$'`,
    ),
  ],
);

export type BrandingSettingsRow = typeof brandingSettings.$inferSelect;
export type NewBrandingSettings = typeof brandingSettings.$inferInsert;
