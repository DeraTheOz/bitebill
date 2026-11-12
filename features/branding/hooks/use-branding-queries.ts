"use client";

import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardKeys } from "@/features/dashboard/hooks/use-dashboard-queries";
import { invoiceKeys } from "@/features/invoices/hooks/use-invoice-queries";
import { brandingApi } from "../lib/api";
import type {
  BrandingPatchValues,
  BrandingSettingsValues,
} from "../schemas/branding-schema";
import type { BrandingSettings } from "../types/branding";

/** TanStack Query key factory for workspace branding cache entries. */
export const brandingKeys = {
  all: ["branding"] as const,
};

/** Fetches the signed-in user's workspace branding settings. */
export function useBrandingSettings(initialData?: BrandingSettings) {
  return useQuery({
    queryKey: brandingKeys.all,
    queryFn: brandingApi.get,
    initialData,
    staleTime: 5 * 60 * 1000,
  });
}

/** Saves full onboarding branding settings and primes the branding cache. */
export function useSaveBranding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: BrandingSettingsValues) => brandingApi.save(values),
    onSuccess: (settings) => {
      queryClient.setQueryData<BrandingSettings | null>(
        brandingKeys.all,
        settings,
      );
    },
  });
}

/** Applies partial branding updates and refreshes dependent invoice and dashboard queries. */
export function useUpdateBranding() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: (values: BrandingPatchValues) => brandingApi.patch(values),
    onSuccess: (settings) => {
      queryClient.setQueryData<BrandingSettings | null>(
        brandingKeys.all,
        settings,
      );
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      router.refresh();
    },
  });
}
