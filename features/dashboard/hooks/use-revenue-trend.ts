"use client";

import { useState } from "react";
import { metricConfig, type MetricKey } from "../lib/metric-config";
import type { MonthlyRevenueTrend } from "../types/dashboard";

export type { MetricKey };

export function useRevenueTrend(trends: MonthlyRevenueTrend[]) {
  const [activeMetric, setActiveMetric] = useState<MetricKey>("total");

  const currentMonthData = trends[trends.length - 1];
  const previousMonthData = trends[trends.length - 2];

  const currentVal = currentMonthData ? currentMonthData[activeMetric] : 0;
  const previousVal = previousMonthData ? previousMonthData[activeMetric] : 0;

  const diffPercent =
    previousVal > 0
      ? Math.round(((currentVal - previousVal) / previousVal) * 100)
      : 0;
  const isPositive = diffPercent >= 0;

  const activeConfig = metricConfig[activeMetric];

  return {
    activeMetric,
    setActiveMetric,
    currentVal,
    previousVal,
    diffPercent,
    isPositive,
    activeConfig,
  };
}

