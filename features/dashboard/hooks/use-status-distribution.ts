"use client";

import { useMemo } from "react";
import type { StatusDistributionItem } from "../types/dashboard";
import { statusConfig } from "../lib/status-config";

export const EMPTY_PIE_DATA = [
  { name: "None", count: 1, fill: "var(--border)", fillOpacity: 0.3 },
];

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

