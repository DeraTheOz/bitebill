"use client";

import { Plus } from "lucide-react";
import { ClientList } from "./client-list";
import { ClientListSkeleton } from "./client-list-skeleton";
import { ClientEmptyState, ClientNoResultsState } from "./client-empty-state";
import { ClientFormDrawer } from "./client-form-drawer";
import { ClientSearch } from "./client-search";
import { PaginationBar } from "./pagination-bar";
import { ErrorState } from "@/components/errors/error-state";
import { useClientWorkspace } from "../hooks/use-client-workspace";

export function ClientWorkspace() {
  const {
    query,
    page,
    isCreateOpen,
    clients,
    pagination,
    hasActiveSearch,
    isPending,
    isPlaceholderData,
    isError,
    refetch,
    setQuery,
    setPage,
    setIsCreateOpen,
  } = useClientWorkspace();

  return (
    <main className="px-6 pb-14 pt-30 md:px-10 md:pt-32 lg:pl-[calc((100%-730px)/2)] lg:pr-[calc((100%-730px)/2)] lg:pt-19.25">
      <section className="mx-auto w-full max-w-182.5">
        <header className="mb-8 flex flex-wrap items-end justify-between gap-x-4 gap-y-6 md:mb-16">
          <div>
            <h1 className="text-[36px] font-bold leading-none tracking-[-1.125px]">
              Clients
            </h1>
            <p className="mt-2 text-[13px] font-medium tracking-[-0.1px] text-muted-light">
              <span className="hidden sm:inline">There are </span>
              <span className="sm:hidden">{pagination?.total ?? 0} clients</span>
              <span className="hidden sm:inline">
                {pagination?.total ?? 0} total clients
              </span>
            </p>
          </div>

          <div className="ml-auto flex items-center gap-5 md:gap-10">
            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="flex h-12 items-center gap-2 rounded-full bg-purple py-2 pl-2 pr-4 text-[15px] font-bold tracking-[-0.25px] text-white transition-colors hover:bg-purple-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple sm:gap-2">
              <span className="grid size-8 place-items-center rounded-full bg-white text-purple">
                <Plus size={16} strokeWidth={2.5} />
              </span>
              <span className="hidden md:inline">New Client</span>
              <span className="md:hidden">New</span>
            </button>
          </div>
        </header>

        <div className="mb-8">
          <ClientSearch value={query} onChange={setQuery} />
        </div>

        {isPending ? (
          <ClientListSkeleton />
        ) : isError ? (
          <ErrorState
            title="Could not load clients"
            description="We couldn't fetch your clients. Check your connection and try again."
            onRetry={() => void refetch()}
          />
        ) : clients.length ? (
          <div
            aria-busy={isPlaceholderData}
            className={`transition-opacity ${
              isPlaceholderData ? "opacity-60" : ""
            }`}>
            <ClientList clients={clients} />
            {pagination && (
              <PaginationBar
                page={page}
                pageCount={pagination.totalPages}
                pageSize={pagination.pageSize}
                total={pagination.total}
                onPageChange={setPage}
                label="Client pagination"
              />
            )}
          </div>
        ) : hasActiveSearch ? (
          <ClientNoResultsState />
        ) : (
          <ClientEmptyState />
        )}
      </section>

      {isCreateOpen && (
        <ClientFormDrawer
          mode="create"
          onClose={() => setIsCreateOpen(false)}
        />
      )}
    </main>
  );
}
