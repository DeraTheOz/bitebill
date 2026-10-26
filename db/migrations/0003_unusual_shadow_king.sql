CREATE TYPE "public"."pdf_template" AS ENUM('classic', 'modern', 'corporate');--> statement-breakpoint
CREATE TABLE "branding_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"business_name" text NOT NULL,
	"business_email" text NOT NULL,
	"business_phone" text,
	"website" text,
	"address_line1" text,
	"address_line2" text,
	"city" text,
	"state" text,
	"country" text,
	"currency" text DEFAULT 'USD' NOT NULL,
	"logo_url" text,
	"invoice_prefix" text DEFAULT 'BB' NOT NULL,
	"default_terms" text,
	"default_pdf_template" "pdf_template" DEFAULT 'classic' NOT NULL,
	"brand_color" text DEFAULT '#7C5DFA' NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "branding_settings_currency_format" CHECK ("branding_settings"."currency" ~ '^[A-Z]{3}$'),
	CONSTRAINT "branding_settings_invoice_prefix_format" CHECK ("branding_settings"."invoice_prefix" ~ '^[A-Z0-9]{1,6}$'),
	CONSTRAINT "branding_settings_brand_color_format" CHECK ("branding_settings"."brand_color" ~ '^#[0-9A-Fa-f]{6}$')
);
--> statement-breakpoint
ALTER TABLE "branding_settings" ADD CONSTRAINT "branding_settings_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "neon_auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branding_settings" ADD CONSTRAINT "branding_settings_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "neon_auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "branding_settings" ADD CONSTRAINT "branding_settings_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "neon_auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "branding_settings_user_id_idx" ON "branding_settings" USING btree ("user_id");