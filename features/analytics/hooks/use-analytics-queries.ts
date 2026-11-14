import { useQuery } from "@tanstack/react-query";
import { analyticsApi } from "../lib/api";
import type { AnalyticsData } from "../types/analytics";

/**
 * Centralized TanStack Query key factory for analytics queries.
 */
export const analyticsKeys = {
  all: ["analytics"] as const,
  byRange: (range: string) => ["analytics", range] as const,
};

/**
 * Fetches the analytics dataset for the selected reporting range.
 *
 * @param range - Reporting timeframe identifier or calendar year.
 * @returns TanStack Query result holding analytics metrics, series, and status flags.
 */
export function useAnalytics(range = "6m") {
  return useQuery<AnalyticsData>({
    queryKey: analyticsKeys.byRange(range),
    queryFn: () => analyticsApi.get(range),
    placeholderData: (previousData) => previousData,
  });
}

