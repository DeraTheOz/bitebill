"use client";

import toast from "react-hot-toast";
import { useDownloadPublicSharePdf } from "./use-share-queries";
import type { PublicSharedInvoice } from "../types/share";

export function usePublicShareView({
  token,
  data,
}: {
  token: string;
  data: PublicSharedInvoice;
}) {
  const downloadPdf = useDownloadPublicSharePdf();
  const { invoice, branding, share } = data;

  const logoUrl = branding.hasLogo
    ? `/api/share/${encodeURIComponent(token)}/logo?v=${encodeURIComponent(branding.logoUpdatedAt ?? "")}`
    : null;

  function handleDownloadPdf() {
    downloadPdf.mutate(
      { token, invoiceNumber: invoice.invoiceNumber },
      {
        onSuccess: () => toast.success("Invoice PDF downloaded"),
        onError: (error) => toast.error(error.message),
      },
    );
  }

  return {
    invoice,
    branding,
    share,
    logoUrl,
    isDownloadingPdf: downloadPdf.isPending,
    handleDownloadPdf,
  };
}

