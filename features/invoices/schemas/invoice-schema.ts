import { z } from "zod";

export const invoiceItemSchema = z.object({
  name: z.string().trim().min(1, "Enter an item name").max(200),
  quantity: z.coerce
    .number()
    .min(0, "Quantity can't be negative")
    .max(999_999),
  unitPrice: z.coerce
    .number()
    .min(0, "Price can't be negative")
    .max(9_999_999),
});

export const invoiceFormBaseSchema = z.object({
  clientId: z.uuid("Select a client"),
  issueDate: z.iso.date("Select an invoice date"),
  dueDate: z.iso.date("Select a due date"),
  notes: z.string().trim().max(2000, "Notes are too long"),
  items: z
    .array(invoiceItemSchema)
    .min(1, "Add at least one item")
    .max(50, "Too many items"),
});

const dueDateAfterIssue = (values: { issueDate: string; dueDate: string }) =>
  values.dueDate >= values.issueDate;

export const invoiceFormSchema = invoiceFormBaseSchema.refine(
  dueDateAfterIssue,
  {
    path: ["dueDate"],
    message: "Due date can't be before the invoice date",
  },
);

/** POST /api/invoices body — form values plus the status intent. */
export const createInvoiceInputSchema = invoiceFormBaseSchema
  .extend({
    status: z.enum(["draft", "pending"]),
  })
  .refine(dueDateAfterIssue, {
    path: ["dueDate"],
    message: "Due date can't be before the invoice date",
  });

/** PUT /api/invoices/[id] body — status omitted keeps the current one. */
export const updateInvoiceInputSchema = invoiceFormBaseSchema
  .extend({
    status: z.enum(["draft", "pending"]).optional(),
  })
  .refine(dueDateAfterIssue, {
    path: ["dueDate"],
    message: "Due date can't be before the invoice date",
  });

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export type InvoiceItemValues = z.infer<typeof invoiceItemSchema>;

// Which footer button submitted the form. `edit` keeps the existing
// status; the others are explicit transition intents.
export type InvoiceFormIntent = "draft" | "pending" | "edit";

/** Status transitions the API accepts on create/update. */
export type InvoiceStatusIntent = Extract<InvoiceFormIntent, "draft" | "pending">;
