"use client";

import { useMemo, useState } from "react";
import type { CustomSelectOption } from "@/components/forms/custom-select-field";
import type { ClientAnalyticsItem } from "../types/analytics";

export type ClientSortBy = "billed" | "outstanding" | "invoices" | "slowest_pay";

const SORT_OPTIONS: readonly CustomSelectOption[] = [
  { value: "billed", label: "Highest Billed" },
  { value: "outstanding", label: "Highest Outstanding" },
  { value: "invoices", label: "Most Invoices" },
  { value: "slowest_pay", label: "Slowest to Pay" },
];

/**
 * Manages client search filtering, custom sorting, and top-client grouping for analytics insights.
 *
 * @param clients - Unfiltered list of client analytics records.
 * @returns Filtered client list, top ranking items, search state, and custom sort handlers.
 */
export function useClientInsights(clients: ClientAnalyticsItem[]) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<ClientSortBy>("billed");

  const filteredClients = useMemo(() => {
    let result = [...clients];

    const query = searchQuery.trim().toLowerCase();
    if (query) {
      result = result.filter((client) => {
        const nameMatch = client.clientName.toLowerCase().includes(query);
        const companyMatch = client.company?.toLowerCase().includes(query) ?? false;
        const emailMatch = client.email?.toLowerCase().includes(query) ?? false;
        return nameMatch || companyMatch || emailMatch;
      });
    }

    result.sort((a, b) => {
      switch (sortBy) {
        case "outstanding":
          return b.outstandingAmount - a.outstandingAmount;
        case "invoices":
          return b.invoiceCount - a.invoiceCount;
        case "slowest_pay": {
          const aDays = a.averageDaysToPay ?? -1;
          const bDays = b.averageDaysToPay ?? -1;
          return bDays - aDays;
        }
        case "billed":
        default:
          return b.totalBilled - a.totalBilled;
      }
    });

    return result;
  }, [clients, searchQuery, sortBy]);

  const topClients = useMemo(() => {
    return [...clients]
      .sort((a, b) => b.totalBilled - a.totalBilled)
      .slice(0, 10)
      .filter((c) => c.totalBilled > 0);
  }, [clients]);

  return {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOptions: SORT_OPTIONS,
    filteredClients,
    topClients,
    totalClientsCount: clients.length,
  };
}

