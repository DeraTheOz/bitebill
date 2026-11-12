CREATE TYPE "public"."recurring_frequency" AS ENUM('monthly', 'quarterly', 'yearly');--> statement-breakpoint
CREATE TABLE "recurring_invoice_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"template_id" uuid NOT NULL,
	"name" text NOT NULL,
	"quantity" numeric(12, 2) NOT NULL,
	"unit_price" numeric(12, 2) NOT NULL,
	"position" integer NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recurring_items_quantity_non_negative" CHECK ("recurring_invoice_items"."quantity" >= 0),
	CONSTRAINT "recurring_items_unit_price_non_negative" CHECK ("recurring_invoice_items"."unit_price" >= 0)
);
--> statement-breakpoint
CREATE TABLE "recurring_invoice_templates" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"client_id" uuid NOT NULL,
	"title" text NOT NULL,
	"frequency" "recurring_frequency" DEFAULT 'monthly' NOT NULL,
	"start_date" date NOT NULL,
	"next_run_date" date NOT NULL,
	"last_run_at" timestamp with time zone,
	"run_count" integer DEFAULT 0 NOT NULL,
	"payment_terms_days" integer DEFAULT 14 NOT NULL,
	"tax_rate" numeric(5, 2) DEFAULT '0' NOT NULL,
	"public_notes" text,
	"internal_notes" text,
	"auto_send" boolean DEFAULT true NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_by" uuid NOT NULL,
	"updated_by" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "recurring_templates_tax_rate_range" CHECK ("recurring_invoice_templates"."tax_rate" >= 0 AND "recurring_invoice_templates"."tax_rate" <= 100),
	CONSTRAINT "recurring_templates_terms_range" CHECK ("recurring_invoice_templates"."payment_terms_days" >= 0 AND "recurring_invoice_templates"."payment_terms_days" <= 365),
	CONSTRAINT "recurring_templates_run_count_non_negative" CHECK ("recurring_invoice_templates"."run_count" >= 0)
);
--> statement-breakpoint
ALTER TABLE "invoices" ADD COLUMN "recurring_template_id" uuid;--> statement-breakpoint
ALTER TABLE "recurring_invoice_items" ADD CONSTRAINT "recurring_invoice_items_template_id_recurring_invoice_templates_id_fk" FOREIGN KEY ("template_id") REFERENCES "public"."recurring_invoice_templates"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_invoice_items" ADD CONSTRAINT "recurring_invoice_items_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "neon_auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_invoice_items" ADD CONSTRAINT "recurring_invoice_items_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "neon_auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_invoice_templates" ADD CONSTRAINT "recurring_invoice_templates_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "neon_auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_invoice_templates" ADD CONSTRAINT "recurring_invoice_templates_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_invoice_templates" ADD CONSTRAINT "recurring_invoice_templates_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "neon_auth"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_invoice_templates" ADD CONSTRAINT "recurring_invoice_templates_updated_by_user_id_fk" FOREIGN KEY ("updated_by") REFERENCES "neon_auth"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "recurring_items_template_position_idx" ON "recurring_invoice_items" USING btree ("template_id","position");--> statement-breakpoint
CREATE INDEX "recurring_templates_user_created_idx" ON "recurring_invoice_templates" USING btree ("user_id","created_at" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "recurring_templates_client_id_idx" ON "recurring_invoice_templates" USING btree ("client_id");--> statement-breakpoint
CREATE INDEX "recurring_templates_due_idx" ON "recurring_invoice_templates" USING btree ("active","next_run_date");--> statement-breakpoint
ALTER TABLE "invoices" ADD CONSTRAINT "invoices_recurring_template_id_recurring_invoice_templates_id_fk" FOREIGN KEY ("recurring_template_id") REFERENCES "public"."recurring_invoice_templates"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "invoices_recurring_template_idx" ON "invoices" USING btree ("recurring_template_id");