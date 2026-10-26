import { useRef } from "react";
import toast from "react-hot-toast";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";
import {
  invoiceFormSchema,
  type InvoiceFormIntent,
  type InvoiceFormValues,
} from "../schemas/invoice-schema";
import {
  useCreateInvoice,
  useInvoice,
  useUpdateInvoice,
} from "./use-invoice-queries";

// Coerced fields (quantity, unitPrice) have `unknown` as their input
// type; the form works with the raw input type and resolves to
// InvoiceFormValues on submit.
type InvoiceFormInput = z.input<typeof invoiceFormSchema>;

const DAY_MS = 24 * 60 * 60 * 1000;

const isoDate = (date: Date) => date.toISOString().slice(0, 10);

function createDefaults(): InvoiceFormValues {
  const now = new Date();
  return {
    clientId: "",
    issueDate: isoDate(now),
    dueDate: isoDate(new Date(now.getTime() + 30 * DAY_MS)),
    notes: "",
    items: [{ name: "", quantity: 1, unitPrice: 0 }],
  };
}

export function useInvoiceFormDrawer(
  mode: "create" | "edit",
  onClose: () => void,
  invoiceId?: string,
) {
  const createInvoice = useCreateInvoice();
  const updateInvoice = useUpdateInvoice();
  const { data: existingInvoice } = useInvoice(
    mode === "edit" ? (invoiceId ?? "") : "",
  );

  const defaults: InvoiceFormValues =
    mode === "edit" && existingInvoice
      ? {
          clientId: existingInvoice.client?.id ?? "",
          issueDate: existingInvoice.issueDate,
          dueDate: existingInvoice.dueDate,
          notes: existingInvoice.publicNotes ?? "",
          items: existingInvoice.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        }
      : createDefaults();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<InvoiceFormInput, unknown, InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: defaults,
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  // Refs are synchronous, so the click on a footer button always lands
  // before the submit handler reads the intent.
  const intentRef = useRef<InvoiceFormIntent>(
    mode === "edit" ? "edit" : "pending",
  );

  const items = useWatch({ control, name: "items" }) ?? [];

  async function onSubmit(values: InvoiceFormValues) {
    const intent = intentRef.current;

    try {
      if (mode === "edit" && invoiceId) {
        await updateInvoice.mutateAsync({
          id: invoiceId,
          values,
          status: intent === "pending" ? "pending" : undefined,
        });
        toast.success("Invoice updated");
      } else {
        await createInvoice.mutateAsync({
          values,
          status: intent === "draft" ? "draft" : "pending",
        });
        toast.success(intent === "draft" ? "Draft saved" : "Invoice created");
      }
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  }

  function submit(intent: InvoiceFormIntent) {
    intentRef.current = intent;
    void handleSubmit(onSubmit)();
  }

  return {
    existingInvoice,
    errors,
    isSubmitting,
    register,
    fields,
    appendItem: () => append({ name: "", quantity: 1, unitPrice: 0 }),
    removeItem: remove,
    items,
    submit,
    handleSubmit,
    onSubmit,
  };
}
