import { useEffect } from "react";
import toast from "react-hot-toast";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  recurringTemplateFormSchema,
  type RecurringTemplateFormInput,
  type RecurringTemplateFormValues,
} from "../schemas/recurring-schema";
import { useRecurringDraftStore } from "../store/recurring-draft-store";
import {
  useCreateRecurringTemplate,
  useRecurringTemplate,
  useUpdateRecurringTemplate,
} from "./use-recurring-queries";

/** Formats a `Date` instance as a `yyyy-MM-dd` calendar date string. */
const isoDate = (date: Date) => format(date, "yyyy-MM-dd");

/** Returns blank default form values for creating a new recurring invoice schedule. */
function createDefaults(): RecurringTemplateFormInput {
  return {
    title: "",
    clientId: "",
    frequency: "monthly",
    startDate: isoDate(new Date()),
    paymentTermsDays: 14,
    taxRate: "",
    publicNotes: "",
    internalNotes: "",
    autoSend: true,
    active: true,
    items: [{ name: "", quantity: 1, unitPrice: "" }],
  };
}

/** Manages create/edit recurring invoice drawer form state, line totals, and session draft persistence. */
export function useRecurringFormDrawer(
  mode: "create" | "edit",
  onClose: () => void,
  templateId?: string,
) {
  const createTemplate = useCreateRecurringTemplate();
  const updateTemplate = useUpdateRecurringTemplate();
  const { data: existingTemplate } = useRecurringTemplate(
    mode === "edit" ? (templateId ?? "") : "",
  );

  const { draft, setDraft, clearDraft } = useRecurringDraftStore();

  const defaults: RecurringTemplateFormInput =
    mode === "edit" && existingTemplate
      ? {
          title: existingTemplate.title,
          clientId: existingTemplate.client?.id ?? "",
          frequency: existingTemplate.frequency,
          startDate: existingTemplate.startDate,
          paymentTermsDays: existingTemplate.paymentTermsDays,
          taxRate:
            existingTemplate.taxRate > 0 ? existingTemplate.taxRate : "",
          publicNotes: existingTemplate.publicNotes ?? "",
          internalNotes: existingTemplate.internalNotes ?? "",
          autoSend: existingTemplate.autoSend,
          active: existingTemplate.active,
          items: existingTemplate.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        }
      : draft
        ? {
            ...createDefaults(),
            ...(draft as Partial<RecurringTemplateFormInput>),
          }
        : createDefaults();

  const {
    register,
    control,
    setValue,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RecurringTemplateFormInput, unknown, RecurringTemplateFormValues>(
    {
      resolver: zodResolver(recurringTemplateFormSchema),
      defaultValues: defaults,
    },
  );

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const items = useWatch({ control, name: "items" }) ?? [];
  const taxRate = useWatch({ control, name: "taxRate" }) ?? 0;

  const subtotal = items.reduce((sum, item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unitPrice) || 0;
    return sum + quantity * unitPrice;
  }, 0);
  const taxRateValue = Math.min(Math.max(Number(taxRate) || 0, 0), 100);
  const tax = (subtotal * taxRateValue) / 100;
  const total = subtotal + tax;

  const allValues = useWatch({ control });
  useEffect(() => {
    if (mode !== "create") return;
    setDraft(allValues as Partial<RecurringTemplateFormInput>);
  }, [mode, allValues, setDraft]);

  async function onSubmit(values: RecurringTemplateFormValues) {
    try {
      if (mode === "edit" && templateId) {
        await updateTemplate.mutateAsync({ id: templateId, values });
        toast.success("Recurring invoice updated");
      } else {
        await createTemplate.mutateAsync(values);
        toast.success("Recurring invoice created");
        clearDraft();
      }
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  }

  function discard() {
    clearDraft();
    onClose();
  }

  return {
    existingTemplate,
    errors,
    isSubmitting,
    register,
    control,
    setValue,
    fields,
    appendItem: () => append({ name: "", quantity: 1, unitPrice: "" }),
    removeItem: remove,
    subtotal,
    taxRateValue,
    tax,
    total,
    discard,
    handleSubmit,
    onSubmit,
  };
}

