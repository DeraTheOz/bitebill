import { useState } from "react";
import { useClients } from "./use-client-queries";
import { useDebouncedValue } from "@/hooks/use-debounced-value";

export function useClientWorkspace() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const debouncedQuery = useDebouncedValue(query);
  const search = debouncedQuery.trim();

  // A new search always starts from the first page of results.
  const [lastSearch, setLastSearch] = useState(search);
  if (lastSearch !== search) {
    setLastSearch(search);
    setPage(1);
  }

  const { data, isPending, isPlaceholderData, isError, refetch } = useClients({
    page,
    q: search || undefined,
  });

  const clients = data?.clients ?? [];
  const pagination = data?.pagination;
  const hasActiveSearch = Boolean(search);

  return {
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
  };
}
