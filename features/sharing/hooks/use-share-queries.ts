import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { dashboardKeys } from "@/features/dashboard/hooks/use-dashboard-queries";
import { invoiceKeys } from "@/features/invoices/hooks/use-invoice-queries";
import { sharingApi } from "../lib/api";
import type { CreateShareInput } from "../schemas/share-schema";

/** TanStack Query key factory for private invoice share settings and public share views. */
export const shareKeys = {
  byInvoice: (invoiceId: string) => ["invoice-share", invoiceId] as const,
  public: (token: string) => ["public-share", token] as const,
};

/** Fetches public share link metadata for an owned invoice. */
export function useInvoiceShare(invoiceId: string) {
  return useQuery({
    queryKey: shareKeys.byInvoice(invoiceId),
    queryFn: () => sharingApi.getForInvoice(invoiceId),
    enabled: Boolean(invoiceId),
  });
}

/** Creates or regenerates a public share link and refreshes dependent invoice/dashboard caches. */
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

/** Updates the expiration timestamp of an active invoice share link. */
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

/** Revokes an invoice's public share link and clears cached share state. */
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

/** Fetches sanitized public invoice data for a share token with caching tuned to avoid duplicate view logs. */
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

/** Triggers a browser PDF download for a publicly shared invoice. */
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
