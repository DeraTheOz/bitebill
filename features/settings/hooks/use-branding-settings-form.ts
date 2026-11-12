import type { ChangeEvent } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  brandingLogoUrl,
  useBranding,
} from "@/features/branding/components/branding-provider";
import { useUpdateBranding } from "@/features/branding/hooks/use-branding-queries";
import {
  businessIdentitySettingsSchema,
  type BusinessIdentitySettingsValues,
} from "@/features/branding/schemas/branding-schema";
import type { BrandingSettings } from "@/features/branding/types/branding";

/** Maps persisted workspace branding settings into React Hook Form default values. */
function toDefaults(
  branding: BrandingSettings,
): BusinessIdentitySettingsValues {
  return {
    businessName: branding.businessName,
    businessEmail: branding.businessEmail,
    businessPhone: branding.businessPhone ?? "",
    website: branding.website ?? "",
    addressLine1: branding.addressLine1 ?? "",
    addressLine2: branding.addressLine2 ?? "",
    city: branding.city ?? "",
    state: branding.state ?? "",
    country: branding.country ?? "",
    brandColor: branding.brandColor,
    logoUrl: undefined,
  };
}

/** Manages business identity & branding form state, logo upload validation, and persistence. */
export function useBrandingSettingsForm() {
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
  } = useForm<BusinessIdentitySettingsValues>({
    resolver: zodResolver(businessIdentitySettingsSchema),
    defaultValues: defaults,
    mode: "onTouched",
  });

  const watchedValues = useWatch({ control });
  const watched = { ...defaults, ...watchedValues };
  const savedLogoUrl = brandingLogoUrl(branding);
  const logoPreviewSrc =
    watched.logoUrl === undefined ? savedLogoUrl : watched.logoUrl || null;

  const isPending = isSubmitting || updateBranding.isPending;

  function handleLogoChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Choose a PNG, JPG, SVG, or WebP file.");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Keep the logo under 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setValue("logoUrl", String(reader.result), {
        shouldDirty: true,
        shouldValidate: true,
      });
    };
    reader.readAsDataURL(file);
  }

  function handleRemoveLogo() {
    setValue("logoUrl", "", { shouldDirty: true, shouldValidate: true });
  }

  function handleBrandColorChange(color: string) {
    setValue("brandColor", color, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  function handleCountryChange(country: string) {
    setValue("country", country, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  async function onSubmit(values: BusinessIdentitySettingsValues) {
    try {
      const updated = await updateBranding.mutateAsync(values);
      reset(toDefaults(updated));
      toast.success("Business branding updated");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not save branding settings",
      );
    }
  }

  return {
    branding,
    watched,
    logoPreviewSrc,
    errors,
    isDirty,
    isPending,
    register,
    handleSubmit: handleSubmit(onSubmit),
    handleLogoChange,
    handleRemoveLogo,
    handleBrandColorChange,
    handleCountryChange,
  };
}

