import { z } from "zod";
import { invoiceItemSchema } from "@/features/invoices/schemas/invoice-schema";

export const recurringFrequencySchema = z.enum([
  "monthly",
  "quarterly",
  "yearly",
]);

export const recurringTemplateFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(2, "Enter a title")
    .max(120, "Keep title under 120 characters"),
  clientId: z.uuid("Select a client"),
  frequency: recurringFrequencySchema,
  startDate: z.iso.date("Select a start date"),
  paymentTermsDays: z.coerce
    .number()
    .int("Payment terms must be whole days")
    .min(0, "Payment terms can't be negative")
    .max(365, "Payment terms can't exceed 365 days"),
  taxRate: z.coerce
    .number()
    .min(0, "Tax can't be negative")
    .max(100, "Tax can't exceed 100%")
    .refine((val) => {
      if (!Number.isFinite(val)) return false;
      const parts = val.toString().split(".");
      return parts.length < 2 || parts[1].length <= 2;
    }, "Tax rate can have at most 2 decimal places")
    .default(0),
  publicNotes: z.string().trim().max(2000, "Notes are too long").default(""),
  internalNotes: z
    .string()
    .trim()
    .max(2000, "Internal notes are too long")
    .optional()
    .default(""),
  autoSend: z.boolean().default(true),
  active: z.boolean().default(true),
  items: z
    .array(invoiceItemSchema)
    .min(1, "Add at least one item")
    .max(50, "Too many items"),
});

export const toggleRecurringInputSchema = z.object({
  active: z.boolean(),
});

export type RecurringTemplateFormInput = z.input<
  typeof recurringTemplateFormSchema
>;
export type RecurringTemplateFormValues = z.infer<
  typeof recurringTemplateFormSchema
>;

