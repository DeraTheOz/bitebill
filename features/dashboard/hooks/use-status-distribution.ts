"use client";

import { useMemo } from "react";
import type { StatusDistributionItem } from "../types/dashboard";
import { statusConfig } from "../lib/status-config";

/** Placeholder slice rendered in the status pie chart when a user has no invoices yet. */
export const EMPTY_PIE_DATA = [
  { name: "None", count: 1, fill: "var(--border)", fillOpacity: 0.3 },
];

/** Derives pie chart slices, empty placeholder data, and pluralized labels from invoice status counts. */
export function useStatusDistribution(
  items: StatusDistributionItem[],
  totalInvoices: number,
) {
  const chartData = useMemo(() => {
    return items
      .filter((item) => item.count > 0)
      .map((item) => ({
        ...item,
        name: statusConfig[item.status].label,
        fill: statusConfig[item.status].color,
      }));
  }, [items]);

  const hasData = chartData.length > 0;
  const displayData = hasData ? chartData : EMPTY_PIE_DATA;

  const invoiceLabel = totalInvoices === 1 ? "invoice" : "invoices";
  const centerInvoiceLabel = totalInvoices === 1 ? "Invoice" : "Invoices";

  return {
    chartData,
    displayData,
    hasData,
    invoiceLabel,
    centerInvoiceLabel,
  };
}

