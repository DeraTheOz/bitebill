"use client";

import { PageLoader } from "@/components/loaders/page-loader";
import { ErrorState } from "@/components/errors/error-state";
import { NotFoundState } from "@/components/errors/not-found-state";
import { InvoiceDetail } from "./invoice-detail";
import { useInvoice } from "../hooks/use-invoice-queries";
import { ApiError } from "../lib/api";

export function InvoiceDetailShell({ invoiceId }: { invoiceId: string }) {
  const {
    data: invoice,
    isPending,
    isError,
    error,
    refetch,
  } = useInvoice(invoiceId);

  if (isPending) {
    return (
      <main className="px-6 md:px-10">
        <PageLoader label="Loading invoice…" />
      </main>
    );
  }

  if (isError) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <main className="px-6 md:px-10">
          <NotFoundState
            title="Invoice not found"
            description="This invoice may have been deleted or is no longer available."
            href="/invoices"
            actionLabel="Back to invoices"
          />
        </main>
      );
    }

    return (
      <main className="px-6 md:px-10">
        <ErrorState
          title="Could not load invoice"
          className="min-h-screen"
          description="We couldn't fetch this invoice. Check your connection and try again."
          onRetry={() => void refetch()}
        />
      </main>
    );
  }

  return <InvoiceDetail invoice={invoice} />;
}
