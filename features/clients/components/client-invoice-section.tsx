"use client";

import { ClientInvoiceFilter } from "./client-invoice-filter";
import { ClientInvoiceCard } from "./client-invoice-card";
import { PaginationBar } from "./pagination-bar";
import { useClientInvoice } from "../hooks/use-client-invoice";

export function ClientInvoiceSection({ clientId }: { clientId: string }) {
  const {
    PAGE_SIZE,
    currentPage,
    pageCount,
    counts,
    statusFilter,
    filteredInvoices,
    visibleInvoices,
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
            {filteredInvoices.length} of {counts.all} invoices
          </p>
        </div>

        <ClientInvoiceFilter
          value={statusFilter}
          counts={counts}
          onChange={handleFilterChange}
        />
      </div>

      <div className="mt-5 rounded-lg">
        {visibleInvoices.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {visibleInvoices.map((invoice) => (
              <ClientInvoiceCard key={invoice.id} invoice={invoice} />
            ))}
          </div>
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

        <PaginationBar
          page={currentPage}
          pageCount={pageCount}
          pageSize={PAGE_SIZE}
          total={filteredInvoices.length}
          onPageChange={setPage}
          label="Invoice pagination"
        />
      </div>
    </section>
  );
}
