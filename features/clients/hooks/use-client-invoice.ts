import { useMemo, useState } from "react";
import { InvoiceStatusFilter } from "../types/client-invoice";
import { getClientInvoices, getInvoiceCounts } from "../lib/helpers";

const PAGE_SIZE = 10;

export function useClientInvoice(clientId: string) {
  const [statusFilter, setStatusFilter] = useState<InvoiceStatusFilter>("all");
  const [page, setPage] = useState(1);

  const counts = useMemo(() => getInvoiceCounts(clientId), [clientId]);

  const filteredInvoices = useMemo(() => {
    const invoices = getClientInvoices(clientId);
    if (statusFilter === "all") return invoices;
    return invoices.filter((invoice) => invoice.status === statusFilter);
  }, [clientId, statusFilter]);

  const pageCount = Math.max(1, Math.ceil(filteredInvoices.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const visibleInvoices = filteredInvoices.slice(
    startIndex,
    startIndex + PAGE_SIZE,
  );

  function handleFilterChange(filter: InvoiceStatusFilter) {
    setStatusFilter(filter);
    setPage(1);
  }

  const pageNumbers = Array.from(
    { length: pageCount },
    (_, index) => index + 1,
  );

  return {
    PAGE_SIZE,
    statusFilter,
    page,
    counts,
    filteredInvoices,
    pageCount,
    currentPage,
    startIndex,
    visibleInvoices,
    pageNumbers,
    setPage,
    setStatusFilter,
    handleFilterChange,
  };
}
