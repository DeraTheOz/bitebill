"use client";

import { useMemo, useState } from "react";
import { metricConfig, type MetricKey } from "../lib/metric-config";
import type { MonthlyRevenueTrend } from "../types/dashboard";
import type { ChartDropdownOption } from "./use-chart-dropdown";

export type { MetricKey };

const round2 = (val: number) =>
  Math.round((val + Number.EPSILON) * 100) / 100;

export function useRevenueTrend(
  trends: MonthlyRevenueTrend[],
  period = "6m",
  availableYears: readonly number[] = [],
) {
  const [activeMetric, setActiveMetric] = useState<MetricKey>("total");
  const [selectedScope, setSelectedScope] = useState<string>("period");

  // Sum of active metric across the entire trend array
  const periodTotal = useMemo(() => {
    return round2(
      trends.reduce((acc, curr) => acc + (Number(curr[activeMetric]) || 0), 0),
    );
  }, [trends, activeMetric]);

  const monthlyAverage = useMemo(() => {
    if (!trends.length) return 0;
    return round2(periodTotal / trends.length);
  }, [periodTotal, trends.length]);

  // Find selected month index if in month scope
  const selectedMonthIndex = useMemo(() => {
    if (selectedScope === "period") return -1;
    return trends.findIndex(
      (t) => `${t.month} ${t.year}` === selectedScope,
    );
  }, [trends, selectedScope]);

  const isPeriodScope = selectedMonthIndex === -1;

  const currentMonthData = isPeriodScope
    ? null
    : trends[selectedMonthIndex];

  const previousMonthData = isPeriodScope
    ? null
    : selectedMonthIndex > 0
      ? trends[selectedMonthIndex - 1]
      : null;

  const currentVal = isPeriodScope
    ? periodTotal
    : currentMonthData
      ? currentMonthData[activeMetric]
      : 0;

  const previousVal = previousMonthData
    ? previousMonthData[activeMetric]
    : 0;

  const diffPercent =
    !isPeriodScope && previousVal > 0
      ? Math.round(((currentVal - previousVal) / previousVal) * 100)
      : 0;

  const isPositive = diffPercent >= 0;

  const activeConfig = metricConfig[activeMetric];

  // Options for the scope dropdown
  const periodLabel =
    period === "6m" ? "Last 6 Months (Total)" : `${period} (Full Year Total)`;

  const scopeOptions = useMemo(() => {
    const list: { value: string; label: string; shortLabel: string }[] = [
      {
        value: "period",
        label: periodLabel,
        shortLabel: period === "6m" ? "6-Mo Total" : `${period} Total`,
      },
    ];

    // Add each month in reverse chronological order (latest month first)
    for (let i = trends.length - 1; i >= 0; i--) {
      const item = trends[i];
      const isLatest = i === trends.length - 1;
      const key = `${item.month} ${item.year}`;
      list.push({
        value: key,
        label: `${key}${isLatest ? " (Latest)" : ""}`,
        shortLabel: key,
      });
    }

    return list;
  }, [trends, periodLabel, period]);

  const periodOptions: ChartDropdownOption[] = useMemo(() => {
    const list: ChartDropdownOption[] = [
      { value: "6m", label: "Last 6 Months" },
    ];
    for (const yr of availableYears) {
      list.push({
        value: String(yr),
        label: `${yr} (Full Year)`,
      });
    }
    return list;
  }, [availableYears]);

  const selectMonth = (month: string, year: number) => {
    setSelectedScope(`${month} ${year}`);
  };

  const resetToPeriod = () => {
    setSelectedScope("period");
  };

  return {
    activeMetric,
    setActiveMetric,
    selectedScope,
    setSelectedScope,
    isPeriodScope,
    currentVal,
    previousVal,
    periodTotal,
    monthlyAverage,
    diffPercent,
    isPositive,
    activeConfig,
    periodOptions,
    scopeOptions,
    selectMonth,
    resetToPeriod,
    selectedMonthData: currentMonthData,
    previousMonthData,
  };
}

