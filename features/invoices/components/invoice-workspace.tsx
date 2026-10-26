"use client";

import { Plus } from "lucide-react";
import { InvoiceList } from "./invoice-list";
import { InvoiceListSkeleton } from "./invoice-list-skeleton";
import {
  InvoiceEmptyState,
  InvoiceNoResultsState,
} from "./invoice-empty-state";
import { InvoiceFormDrawer } from "./invoice-form-drawer";
import { InvoiceFilter } from "./invoice-filter";
import { InvoiceSearch } from "./invoice-search";
import { PaginationBar } from "@/components/pagination-bar";
import { ErrorState } from "@/components/errors/error-state";
import { useInvoiceWorkspace } from "../hooks/use-invoice-workspace";

export function InvoiceWorkspace() {
  const {
    query,
    page,
    selectedFilters,
    isCreateOpen,
    invoices,
    pagination,
    hasActiveFilters,
    isPending,
    isPlaceholderData,
    isError,
    refetch,
    setQuery,
    setPage,
    setIsCreateOpen,
    toggleFilter,
  } = useInvoiceWorkspace();

  return (
    <main className="px-6 pb-14 pt-30 md:px-10 md:pt-32 lg:pl-[calc((100%-730px)/2)] lg:pr-[calc((100%-730px)/2)] lg:pt-19.25">
      <section className="mx-auto w-full max-w-182.5">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-x-4 gap-y-6 md:mb-16">
          <div>
            <h1 className="text-[32px] font-bold leading-none tracking-[-1.125px] sm:text-[36px]">
              Invoices
            </h1>
            <p className="mt-2 text-[13px] font-medium tracking-[-0.1px] text-muted-light">
              <span className="hidden sm:inline">There are </span>
              <span className="sm:hidden">
                {pagination?.total ?? 0} invoices
              </span>
              <span className="hidden sm:inline">
                {pagination?.total ?? 0} total invoices
              </span>
            </p>
          </div>

          <div className="flex w-full items-center justify-between gap-5 sm:ml-auto sm:w-auto md:gap-10">
            <InvoiceFilter
              selectedFilters={selectedFilters}
              onToggle={toggleFilter}
            />

            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="flex h-12 items-center gap-2 rounded-full bg-purple py-2 pl-2 pr-4 text-[15px] font-bold tracking-[-0.25px] text-white transition-colors hover:bg-purple-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple sm:gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-white text-purple">
                <Plus size={16} strokeWidth={2.5} />
              </span>
              <span className="hidden md:inline">New Invoice</span>
              <span className="md:hidden">New</span>
            </button>
          </div>
        </header>

        <div className="mb-8">
          <InvoiceSearch value={query} onChange={setQuery} />
        </div>

        {isPending ? (
          <InvoiceListSkeleton />
        ) : isError ? (
          <ErrorState
            title="Could not load invoices"
            description="We couldn't fetch your invoices. Check your connection and try again."
            onRetry={() => void refetch()}
          />
        ) : invoices.length ? (
          <div
            aria-busy={isPlaceholderData}
            className={`transition-opacity ${
              isPlaceholderData ? "opacity-60" : ""
            }`}>
            <InvoiceList invoices={invoices} />
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
          </div>
        ) : hasActiveFilters ? (
          <InvoiceNoResultsState />
        ) : (
          <InvoiceEmptyState />
        )}
      </section>

      {isCreateOpen && (
        <InvoiceFormDrawer
          mode="create"
          onClose={() => setIsCreateOpen(false)}
        />
      )}
    </main>
  );
}
