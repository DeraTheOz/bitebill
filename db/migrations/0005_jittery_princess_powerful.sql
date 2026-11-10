CREATE TABLE "invoice_shares" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"invoice_id" uuid NOT NULL,
	"token" text NOT NULL,
	"view_count" integer DEFAULT 0 NOT NULL,
	"last_viewed_at" timestamp with time zone,
	"expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "invoice_shares_view_count_non_negative" CHECK ("invoice_shares"."view_count" >= 0)
);
--> statement-breakpoint
ALTER TABLE "invoice_shares" ADD CONSTRAINT "invoice_shares_invoice_id_invoices_id_fk" FOREIGN KEY ("invoice_id") REFERENCES "public"."invoices"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "invoice_shares_token_idx" ON "invoice_shares" USING btree ("token");--> statement-breakpoint
CREATE UNIQUE INDEX "invoice_shares_invoice_id_idx" ON "invoice_shares" USING btree ("invoice_id");