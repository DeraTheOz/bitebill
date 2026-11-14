"use client";

import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import type { CustomSelectOption } from "@/components/forms/custom-select-field";
import { exportAnalyticsToCsv } from "../lib/csv";
import { useAnalytics } from "./use-analytics-queries";

const PRESET_OPTIONS: readonly CustomSelectOption[] = [
  { value: "3m", label: "Last 3 Months" },
  { value: "6m", label: "Last 6 Months" },
  { value: "12m", label: "Last 12 Months" },
  { value: "ytd", label: "Year to Date (YTD)" },
  { value: "all", label: "All Time" },
];

/**
 * Manages analytics workspace state, timeframe filtering options, data fetching, and CSV export.
 *
 * @returns State and event handlers for the primary analytics workspace.
 */
export function useAnalyticsWorkspace() {
  const [range, setRange] = useState<string>("6m");
  const { data, isPending, isError, refetch } = useAnalytics(range);

  const rangeOptions: CustomSelectOption[] = useMemo(() => {
    const list: CustomSelectOption[] = [...PRESET_OPTIONS];

    if (data?.availableYears && data.availableYears.length > 0) {
      for (const yr of data.availableYears) {
        list.push({
          value: String(yr),
          label: `${yr} (Full Year)`,
        });
      }
    }

    return list;
  }, [data]);

  const handleRangeChange = (newRange: string) => {
    setRange(newRange);
  };

  const handleExportCsv = () => {
    if (!data) {
      toast.error("No analytics data available to export.");
      return;
    }

    try {
      exportAnalyticsToCsv(data);
      toast.success("Analytics CSV exported successfully.");
    } catch (err) {
      console.error("Failed to export analytics CSV:", err);
      toast.error("Could not export CSV. Please try again.");
    }
  };

  return {
    range,
    data,
    isPending,
    isError,
    rangeOptions,
    handleRangeChange,
    handleExportCsv,
    refetch,
  };
}

