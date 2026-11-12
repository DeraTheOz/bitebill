import { useState } from "react";
import toast from "react-hot-toast";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import type {
  RecurringFrequency,
  RecurringStatusFilter,
} from "../types/recurring";
import {
  useRecurringTemplates,
  useRunDueRecurringTemplates,
} from "./use-recurring-queries";

/** Manages search, status/frequency filters, pagination, and run-due actions on the recurring page. */
export function useRecurringWorkspace() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilters, setStatusFilters] = useState<RecurringStatusFilter[]>(
    [],
  );
  const [frequencyFilters, setFrequencyFilters] = useState<
    RecurringFrequency[]
  >([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const debouncedQuery = useDebouncedValue(query);
  const search = debouncedQuery.trim();

  const filterKey = `${statusFilters.join(",")}|${frequencyFilters.join(",")}`;
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

  const { data, isPending, isPlaceholderData, isError, refetch } =
    useRecurringTemplates({
      page,
      pageSize: 10,
      q: search || undefined,
      status: statusFilters.length ? statusFilters : undefined,
      frequency: frequencyFilters.length ? frequencyFilters : undefined,
    });

  const runDue = useRunDueRecurringTemplates();

  const templates = data?.templates ?? [];
  const pagination = data?.pagination;
  const dueCount = data?.dueCount ?? 0;
  const hasActiveFilters =
    statusFilters.length > 0 || frequencyFilters.length > 0 || Boolean(search);

  function toggleStatusFilter(value: RecurringStatusFilter) {
    setStatusFilters((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  function toggleFrequencyFilter(value: RecurringFrequency) {
    setFrequencyFilters((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  async function handleRunDue() {
    try {
      const result = await runDue.mutateAsync();
      if (result.generated > 0) {
        toast.success(
          `Generated ${result.generated} ${
            result.generated === 1 ? "invoice" : "invoices"
          }`,
        );
      } else if (result.paused > 0) {
        toast("Paused recurring invoices with deleted clients");
      } else {
        toast("No recurring invoices are currently due");
      }
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not process due recurring invoices",
      );
    }
  }

  return {
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
    isRunningDue: runDue.isPending,
    refetch,
    setQuery,
    setPage,
    setIsCreateOpen,
    toggleStatusFilter,
    toggleFrequencyFilter,
    handleRunDue,
  };
}

