"use client";

import { Play, Plus } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { ErrorState } from "@/components/errors/error-state";
import { Spinner } from "@/components/loaders/spinner";
import { PaginationBar } from "@/components/pagination-bar";
import { useRecurringWorkspace } from "../hooks/use-recurring-workspace";
import {
  RecurringEmptyState,
  RecurringNoResultsState,
} from "./recurring-empty-state";
import { RecurringFilter } from "./recurring-filter";
import { RecurringFormDrawer } from "./recurring-form-drawer";
import { RecurringList } from "./recurring-list";
import { RecurringListSkeleton } from "./recurring-list-skeleton";
import { RecurringSearch } from "./recurring-search";

export function RecurringWorkspace() {
  const {
    query,
    page,
    statusFilters,
    frequencyFilters,
    isCreateOpen,
    templates,
    pagination,
    dueCount,
    hasActiveFilters,
    isPending,
    isPlaceholderData,
    isError,
    isRunningDue,
    refetch,
    setQuery,
    setPage,
    setIsCreateOpen,
    toggleStatusFilter,
    toggleFrequencyFilter,
    handleRunDue,
  } = useRecurringWorkspace();

  return (
    <main className="px-6 pb-14 pt-30 md:px-10 md:pt-32 lg:pl-[calc((100%-730px)/2)] lg:pr-[calc((100%-730px)/2)] lg:pt-19.25">
      <section className="mx-auto w-full max-w-182.5">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-x-4 gap-y-6 md:mb-16">
          <div>
            <h1 className="text-[32px] font-bold leading-none tracking-[-1.125px] sm:text-[36px]">
              Recurring Invoices
            </h1>
            <p className="mt-2 text-[13px] font-medium tracking-[-0.1px] text-muted-light">
              <span className="hidden sm:inline">
                There {(pagination?.total ?? 0) === 1 ? "is" : "are"}{" "}
              </span>
              <span className="sm:hidden">
                {pagination?.total ?? 0}{" "}
                {(pagination?.total ?? 0) === 1
                  ? "recurring invoice"
                  : "recurring invoices"}
              </span>
              <span className="hidden sm:inline">
                {pagination?.total ?? 0} total{" "}
                {(pagination?.total ?? 0) === 1
                  ? "recurring invoice"
                  : "recurring invoices"}
              </span>
            </p>
          </div>

          <div className="flex w-full flex-wrap items-center justify-between gap-4 sm:ml-auto sm:w-auto md:gap-6">
            <RecurringFilter
              selectedStatuses={statusFilters}
              selectedFrequencies={frequencyFilters}
              onToggleStatus={toggleStatusFilter}
              onToggleFrequency={toggleFrequencyFilter}
            />

            {dueCount > 0 && (
              <button
                type="button"
                onClick={handleRunDue}
                disabled={isRunningDue}
                className="flex h-12 items-center gap-2 rounded-full border border-purple/30 bg-purple/10 px-4 text-[14px] font-bold tracking-[-0.25px] text-purple transition-colors hover:bg-purple/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple disabled:cursor-not-allowed disabled:opacity-60">
                {isRunningDue ? (
                  <Spinner className="size-4" tone="brand" />
                ) : (
                  <Play size={14} strokeWidth={2.5} />
                )}
                <span>Run Due ({dueCount})</span>
              </button>
            )}

            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="flex h-12 items-center gap-2 rounded-full bg-purple py-2 pl-2 pr-4 text-[15px] font-bold tracking-[-0.25px] text-white transition-colors hover:bg-purple-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple sm:gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-white text-purple">
                <Plus size={16} strokeWidth={2.5} />
              </span>
              <span className="hidden md:inline">New Recurring</span>
              <span className="md:hidden">New</span>
            </button>
          </div>
        </header>

        <div className="mb-8">
          <RecurringSearch value={query} onChange={setQuery} />
        </div>

        {isPending ? (
          <RecurringListSkeleton />
        ) : isError ? (
          <ErrorState
            title="Could not load recurring invoices"
            description="We couldn't fetch your recurring invoices. Check your connection and try again."
            onRetry={() => void refetch()}
          />
        ) : templates.length ? (
          <div
            aria-busy={isPlaceholderData}
            className={`transition-opacity ${
              isPlaceholderData ? "opacity-60" : ""
            }`}>
            <RecurringList templates={templates} />
            {pagination && (
              <PaginationBar
                page={page}
                pageCount={pagination.totalPages}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onPageChange={setPage}
                label="Recurring invoices pagination"
              />
            )}
          </div>
        ) : hasActiveFilters ? (
          <RecurringNoResultsState />
        ) : (
          <RecurringEmptyState />
        )}
      </section>

      <AnimatePresence>
        {isCreateOpen && (
          <RecurringFormDrawer
            mode="create"
            onClose={() => setIsCreateOpen(false)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}

