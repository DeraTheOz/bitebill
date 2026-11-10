import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardKeys } from "@/features/dashboard/hooks/use-dashboard-queries";
import { invoiceKeys } from "@/features/invoices/hooks/use-invoice-queries";
import { sharingApi } from "../lib/api";
import type { CreateShareInput } from "../schemas/share-schema";

export const shareKeys = {
  byInvoice: (invoiceId: string) => ["invoice-share", invoiceId] as const,
  public: (token: string) => ["public-share", token] as const,
};

export function useInvoiceShare(invoiceId: string) {
  return useQuery({
    queryKey: shareKeys.byInvoice(invoiceId),
    queryFn: () => sharingApi.getForInvoice(invoiceId),
    enabled: Boolean(invoiceId),
  });
}

export function useCreateInvoiceShare(invoiceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateShareInput = {}) =>
      sharingApi.createOrRegenerate(invoiceId, input),
    onSuccess: (share) => {
      queryClient.setQueryData(shareKeys.byInvoice(invoiceId), share);
      queryClient.invalidateQueries({
        queryKey: invoiceKeys.detail(invoiceId),
      });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function useUpdateInvoiceShare(invoiceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (expiresAt: string | null) =>
      sharingApi.updateExpiration(invoiceId, expiresAt),
    onSuccess: (share) => {
      queryClient.setQueryData(shareKeys.byInvoice(invoiceId), share);
    },
  });
}

export function useRevokeInvoiceShare(invoiceId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => sharingApi.revoke(invoiceId),
    onSuccess: () => {
      queryClient.setQueryData(shareKeys.byInvoice(invoiceId), null);
      queryClient.invalidateQueries({
        queryKey: invoiceKeys.detail(invoiceId),
      });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

export function usePublicShare(token: string) {
  return useQuery({
    queryKey: shareKeys.public(token),
    queryFn: () => sharingApi.getPublic(token),
    enabled: Boolean(token),
    retry: false,
    // Keep the loaded invoice cached across mounts in the same session so
    // StrictMode / tab switching does not re-trigger view count increments.
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });
}

export function useDownloadPublicSharePdf() {
  return useMutation({
    mutationFn: ({
      token,
      invoiceNumber,
    }: {
      token: string;
      invoiceNumber: string;
    }) => sharingApi.downloadPublicPdf(token, invoiceNumber),
  });
}
