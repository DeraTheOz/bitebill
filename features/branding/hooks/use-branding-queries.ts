import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { brandingApi } from "../lib/api";
import type { BrandingSettingsValues } from "../schemas/branding-schema";
import type { BrandingSettings } from "../types/branding";

export const brandingKeys = {
  all: ["branding"] as const,
};

export function useBrandingSettings() {
  return useQuery({
    queryKey: brandingKeys.all,
    queryFn: brandingApi.get,
    staleTime: 5 * 60 * 1000,
  });
}

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
