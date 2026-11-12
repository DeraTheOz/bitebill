import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../lib/api";

/** TanStack Query key factory for dashboard analytics queries. */
export const dashboardKeys = {
  all: ["dashboard"] as const,
  byPeriod: (period: string) => ["dashboard", period] as const,
};

/** Fetches dashboard metrics, trends, and recent activity for the selected period. */
export function useDashboard(period = "6m") {
  return useQuery({
    queryKey: dashboardKeys.byPeriod(period),
    queryFn: () => dashboardApi.get(period),
    placeholderData: (previousData) => previousData,
  });
}

