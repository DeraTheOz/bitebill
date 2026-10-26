import { useState } from "react";
import { useClients } from "./use-client-queries";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type { ClientActivityFilter } from "../types/client";
import type { ClientListActivityFilter } from "../components/client-filter";

export function useClientWorkspace() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<
    ClientListActivityFilter[]
  >([]);

  const debouncedQuery = useDebouncedValue(query);
  const search = debouncedQuery.trim();

  // A new search always starts from the first page of results.
  const [lastSearch, setLastSearch] = useState(search);
  if (lastSearch !== search) {
    setLastSearch(search);
    setPage(1);
  }

  function toggleFilter(filter: ClientListActivityFilter) {
    setSelectedFilters((current) =>
      current.includes(filter)
        ? current.filter((value) => value !== filter)
        : [...current, filter],
    );
    setPage(1);
  }

  // Selecting both (or neither) means "no activity filter".
  const activity: ClientActivityFilter | undefined =
    selectedFilters.length === 1
      ? selectedFilters[0] === "with-invoices"
        ? "with"
        : "without"
      : undefined;

  const { data, isPending, isPlaceholderData, isError, refetch } = useClients({
    page,
    q: search || undefined,
    activity,
  });

  const clients = data?.clients ?? [];
  const pagination = data?.pagination;
  const hasActiveSearch = Boolean(search) || Boolean(activity);

  return {
    query,
    page,
    isCreateOpen,
    clients,
    pagination,
    selectedFilters,
    hasActiveSearch,
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
