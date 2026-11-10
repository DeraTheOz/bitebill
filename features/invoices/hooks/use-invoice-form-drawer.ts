import { useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format } from "date-fns";
import {
  invoiceFormSchema,
  type InvoiceFormInput,
  type InvoiceFormIntent,
  type InvoiceFormValues,
} from "../schemas/invoice-schema";
import {
  useCreateInvoice,
  useInvoice,
  useUpdateInvoice,
} from "./use-invoice-queries";
import { useInvoiceDraftStore } from "../store/invoice-draft-store";

const isoDate = (date: Date) => format(date, "yyyy-MM-dd");

function createDefaults(): InvoiceFormInput {
  const now = new Date();
  return {
    clientId: "",
    issueDate: isoDate(now),
    dueDate: isoDate(addDays(now, 14)),
    notes: "",
    internalNotes: "",
    taxRate: "",
    items: [{ name: "", quantity: 1, unitPrice: "" }],
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

  const { draft, setDraft, clearDraft } = useInvoiceDraftStore();

  const defaults: InvoiceFormInput =
    mode === "edit" && existingInvoice
      ? {
          clientId: existingInvoice.client?.id ?? "",
          issueDate: existingInvoice.issueDate,
          dueDate: existingInvoice.dueDate,
          notes: existingInvoice.publicNotes ?? "",
          internalNotes: existingInvoice.internalNotes ?? "",
          taxRate:
            Number(existingInvoice.taxRate) > 0 ? existingInvoice.taxRate : "",
          items: existingInvoice.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        }
      : // Restore a saved draft (create mode only) so accidental closes don't lose work.
        draft
        ? { ...createDefaults(), ...(draft as Partial<InvoiceFormInput>) }
        : createDefaults();

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
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
  const taxRate = useWatch({ control, name: "taxRate" }) ?? 0;

  // Persist draft as the user types (create mode only). Skipped for edit
  // because the server already holds the canonical values.
  const allValues = useWatch({ control });
  useEffect(() => {
    if (mode !== "create") return;
    setDraft(allValues as Partial<InvoiceFormInput>);
  }, [mode, allValues, setDraft]);

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
        // Clear the persisted draft now that it's been saved to the server.
        clearDraft();
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

  /** Called by the Discard button to intentionally wipe the draft. */
  function discard() {
    clearDraft();
    onClose();
  }

  return {
    existingInvoice,
    errors,
    isSubmitting,
    register,
    control,
    watch,
    setValue,
    fields,
    appendItem: () => append({ name: "", quantity: 1, unitPrice: "" }),
    removeItem: remove,
    items,
    taxRate,
    submit,
    discard,
    handleSubmit,
    onSubmit,
    hasDraft: mode === "create" && draft !== null,
  };
}
