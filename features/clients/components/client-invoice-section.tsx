"use client";

import { ClientInvoiceFilter } from "./client-invoice-filter";
import { ClientInvoiceCard } from "./client-invoice-card";
import { PaginationBar } from "@/components/pagination-bar";
import { ErrorState } from "@/components/errors/error-state";
import { useClientInvoice } from "../hooks/use-client-invoice";
import { ClientInvoiceCardSkeleton } from "./client-invoice-card-skeleton";

export function ClientInvoiceSection({ clientId }: { clientId: string }) {
  const {
    statusFilter,
    page,
    counts,
    invoices,
    pagination,
    isPending,
    isPlaceholderData,
    isError,
    refetch,
    setPage,
    handleFilterChange,
  } = useClientInvoice(clientId);

  return (
    <section aria-labelledby="client-invoices-heading">
      <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-4">
        <div>
          <h2
            id="client-invoices-heading"
            className="text-[24px] font-bold tracking-[-0.75px] text-ink">
            Invoices
          </h2>
          <p className="mt-1 text-[13px] font-medium tracking-[-0.1px] text-muted-light">
            {pagination?.total ?? 0} of {counts.all} invoices
          </p>
        </div>

        <ClientInvoiceFilter
          value={statusFilter}
          counts={counts}
          onChange={handleFilterChange}
        />
      </div>

      <div className="mt-5 rounded-lg">
        {isPending ? (
          <ClientInvoiceCardSkeleton />
        ) : isError ? (
          <ErrorState
            title="Could not load invoices"
            description="We couldn't fetch this client's invoices. Try again."
            onRetry={() => void refetch()}
          />
        ) : invoices.length ? (
          <>
            <div
              aria-busy={isPlaceholderData}
              className={`grid gap-4 transition-opacity sm:grid-cols-2 ${
                isPlaceholderData ? "opacity-60" : ""
              }`}>
              {invoices.map((invoice) => (
                <ClientInvoiceCard key={invoice.id} invoice={invoice} />
              ))}
            </div>

            {pagination && (
              <PaginationBar
                page={page}
                pageCount={pagination.totalPages}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onPageChange={setPage}
                label="Invoice pagination"
              />
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
            <p className="text-[15px] font-bold text-ink">
              No {statusFilter === "all" ? "" : `${statusFilter} `}
              invoices here
            </p>
            <p className="mt-2 max-w-sm text-[13px] font-medium leading-5 text-muted-light">
              {counts.all
                ? "Try another filter to see the rest of this client's invoices."
                : "Invoices for this client will show up here once they are created."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
