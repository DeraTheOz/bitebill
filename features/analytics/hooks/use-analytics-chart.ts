"use client";

import { useMemo, useState } from "react";
import type { AnalyticsMonthlyPoint } from "../types/analytics";

export type AnalyticsMetricKey = "total" | "paid" | "pending" | "overdue";

export type MetricDisplayConfig = {
  key: AnalyticsMetricKey;
  label: string;
  tabLabel: string;
  color: string;
  gradientId: string;
};

export const ANALYTICS_METRIC_CONFIG: Record<AnalyticsMetricKey, MetricDisplayConfig> = {
  total: {
    key: "total",
    label: "Total Billed",
    tabLabel: "Total Billed",
    color: "#7c5dfa",
    gradientId: "analyticsTotalGrad",
  },
  paid: {
    key: "paid",
    label: "Collected (Paid)",
    tabLabel: "Paid",
    color: "#33d69f",
    gradientId: "analyticsPaidGrad",
  },
  pending: {
    key: "pending",
    label: "Pending",
    tabLabel: "Pending",
    color: "#ff8f00",
    gradientId: "analyticsPendingGrad",
  },
  overdue: {
    key: "overdue",
    label: "Overdue",
    tabLabel: "Overdue",
    color: "#ec5757",
    gradientId: "analyticsOverdueGrad",
  },
};

/**
 * Manages metric selection, series calculation, and display configuration for the revenue trend chart.
 *
 * @param series - Array of monthly analytics series points.
 * @returns Active metric, tab configurations, and derived summary stats for chart presentation.
 */
export function useAnalyticsChart(series: AnalyticsMonthlyPoint[]) {
  const [activeMetric, setActiveMetric] = useState<AnalyticsMetricKey>("total");

  const activeConfig = ANALYTICS_METRIC_CONFIG[activeMetric];

  const hasData = useMemo(
    () => series.some((p) => p.total > 0 || p.invoiceCount > 0),
    [series],
  );

  const activeTotal = useMemo(() => {
    return series.reduce((acc, curr) => acc + (curr[activeMetric] || 0), 0);
  }, [series, activeMetric]);

  const monthlyAverage = useMemo(() => {
    if (!series.length) return 0;
    return Math.round((activeTotal / series.length) * 100) / 100;
  }, [activeTotal, series.length]);

  const highestMonth = useMemo(() => {
    if (!series.length) return null;
    return [...series].sort((a, b) => b[activeMetric] - a[activeMetric])[0] ?? null;
  }, [series, activeMetric]);

  return {
    activeMetric,
    setActiveMetric,
    activeConfig,
    hasData,
    activeTotal,
    monthlyAverage,
    highestMonth,
  };
}

