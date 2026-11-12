import { useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  brandingLogoUrl,
  useBranding,
} from "@/features/branding/components/branding-provider";
import type { RecurringTemplate } from "../types/recurring";
import {
  useDeleteRecurringTemplate,
  useGenerateRecurringInvoice,
  useToggleRecurringTemplate,
} from "./use-recurring-queries";

/** Manages recurring invoice detail actions, confirmation state, and derived client display data. */
export function useRecurringDetail(template: RecurringTemplate) {
  const router = useRouter();
  const branding = useBranding();
  const logoUrl = brandingLogoUrl(branding);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const toggleTemplate = useToggleRecurringTemplate();
  const generateInvoice = useGenerateRecurringInvoice();
  const deleteTemplate = useDeleteRecurringTemplate();

  const clientDeleted = Boolean(template.client?.isDeleted);
  const isBusy =
    toggleTemplate.isPending ||
    generateInvoice.isPending ||
    deleteTemplate.isPending;

  const client = template.client;
  const addressLines = client
    ? [
        client.address.addressLine1,
        client.address.addressLine2,
        client.address.city,
        client.address.state,
        client.address.country,
      ].filter((line): line is string => Boolean(line))
    : [];

  function handleToggle() {
    toggleTemplate.mutate(
      { id: template.id, active: !template.active },
      {
        onSuccess: (updated) => {
          toast.success(
            updated.active ? "Recurring schedule resumed" : "Schedule paused",
          );
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  function handleGenerateNow() {
    generateInvoice.mutate(template.id, {
      onSuccess: (invoice) => {
        toast.success(`Invoice #${invoice.invoiceNumber} generated`);
      },
      onError: (error) => toast.error(error.message),
    });
  }

  function handleDelete() {
    deleteTemplate.mutate(template.id, {
      onSuccess: () => {
        toast.success("Recurring invoice deleted");
        router.push("/recurring-invoices");
      },
      onError: (error) => toast.error(error.message),
    });
  }

  return {
    branding,
    logoUrl,
    client,
    addressLines,
    clientDeleted,
    isEditOpen,
    isDeleteOpen,
    isBusy,
    isToggling: toggleTemplate.isPending,
    isGenerating: generateInvoice.isPending,
    isDeleting: deleteTemplate.isPending,
    setIsEditOpen,
    setIsDeleteOpen,
    handleToggle,
    handleGenerateNow,
    handleDelete,
  };
}

