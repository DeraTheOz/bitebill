import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  brandingLogoUrl,
  useBranding,
} from "@/features/branding/components/branding-provider";
import { useUpdateBranding } from "@/features/branding/hooks/use-branding-queries";
import {
  pdfDefaultsSettingsSchema,
  type PdfDefaultsSettingsValues,
} from "@/features/branding/schemas/branding-schema";
import type { BrandingSettings } from "@/features/branding/types/branding";

/** Maps persisted branding settings into Invoice & PDF default form values. */
function toDefaults(branding: BrandingSettings): PdfDefaultsSettingsValues {
  return {
    currency: branding.currency,
    invoicePrefix: branding.invoicePrefix,
    pdfTemplate: branding.defaultPdfTemplate,
    defaultTerms: branding.defaultTerms ?? "",
  };
}

/** Manages invoice numbering, currency, and default PDF template settings form state. */
export function usePdfSettingsForm() {
  const branding = useBranding();
  const updateBranding = useUpdateBranding();

  const defaults = toDefaults(branding);

  const {
    register,
    control,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<PdfDefaultsSettingsValues>({
    resolver: zodResolver(pdfDefaultsSettingsSchema),
    defaultValues: defaults,
    mode: "onTouched",
  });

  const watchedValues = useWatch({ control });
  const watched = { ...defaults, ...watchedValues };
  const logoSrc = brandingLogoUrl(branding);
  const isPending = isSubmitting || updateBranding.isPending;

  function handleCurrencyChange(code: string) {
    setValue("currency", code, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  async function onSubmit(values: PdfDefaultsSettingsValues) {
    try {
      const updated = await updateBranding.mutateAsync(values);
      reset(toDefaults(updated));
      toast.success("Invoice & PDF defaults updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save PDF settings",
      );
    }
  }

  return {
    branding,
    logoSrc,
    watched,
    errors,
    isDirty,
    isPending,
    register,
    handleCurrencyChange,
    handleSubmit: handleSubmit(onSubmit),
  };
}

