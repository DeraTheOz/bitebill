import { useState } from "react";
import type { InvoiceStatus } from "../types/invoice";
import { useInvoices } from "./use-invoice-queries";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export function useInvoiceWorkspace() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [selectedFilters, setSelectedFilters] = useState<InvoiceStatus[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const debouncedQuery = useDebouncedValue(query);
  const search = debouncedQuery.trim();

  // Any filter or search change restarts at page 1
  const filterKey = selectedFilters.join(",");
  const [lastFilterKey, setLastFilterKey] = useState(filterKey);
  if (lastFilterKey !== filterKey) {
    setLastFilterKey(filterKey);
    setPage(1);
  }

  const [lastSearch, setLastSearch] = useState(search);
  if (lastSearch !== search) {
    setLastSearch(search);
    setPage(1);
  }

  const { data, isPending, isPlaceholderData, isError, refetch } = useInvoices({
    page,
    pageSize: 10,
    q: search || undefined,
    status: selectedFilters.length ? selectedFilters : undefined,
  });

  const invoices = data?.invoices ?? [];
  const pagination = data?.pagination;
  const hasActiveFilters = selectedFilters.length > 0 || Boolean(search);

  function toggleFilter(status: InvoiceStatus) {
    setSelectedFilters((current) =>
      current.includes(status)
        ? current.filter((value) => value !== status)
        : [...current, status],
    );
  }

  return {
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
  };
}
