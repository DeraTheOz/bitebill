"use client";

import { useState } from "react";
import type { InvoiceStatusFilter } from "@/features/invoices/types/invoice";
import { useInvoices } from "@/features/invoices/hooks/use-invoice-queries";

const PAGE_SIZE = 10;

const EMPTY_COUNTS = {
  all: 0,
  paid: 0,
  pending: 0,
  overdue: 0,
  draft: 0,
};

export function useClientInvoice(clientId: string) {
  const [statusFilter, setStatusFilter] = useState<InvoiceStatusFilter>("all");
  const [page, setPage] = useState(1);

  // A new filter always starts from the first page of results.
  const [lastFilter, setLastFilter] = useState(statusFilter);
  if (lastFilter !== statusFilter) {
    setLastFilter(statusFilter);
    setPage(1);
  }

  const { data, isPending, isPlaceholderData, isError, refetch } = useInvoices({
    clientId,
    page,
    pageSize: PAGE_SIZE,
    status: statusFilter === "all" ? undefined : [statusFilter],
  });

  const invoices = data?.invoices ?? [];
  const pagination = data?.pagination;
  const counts = data?.summary?.counts ?? EMPTY_COUNTS;

  function handleFilterChange(filter: InvoiceStatusFilter) {
    setStatusFilter(filter);
  }

  return {
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
  };
}
