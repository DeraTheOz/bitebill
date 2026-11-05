import { useQuery } from "@tanstack/react-query";
import { dashboardApi } from "../lib/api";

export const dashboardKeys = {
  all: ["dashboard"] as const,
  byPeriod: (period: string) => ["dashboard", period] as const,
};

export function useDashboard(period = "6m") {
  return useQuery({
    queryKey: dashboardKeys.byPeriod(period),
    queryFn: () => dashboardApi.get(period),
    placeholderData: (previousData) => previousData,
  });
}

