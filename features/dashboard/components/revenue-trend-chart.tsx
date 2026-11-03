"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ArrowDownRight, ArrowUpRight, TrendingUp } from "lucide-react";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { formatMoney } from "@/lib/format";
import type { MonthlyRevenueTrend } from "../types/dashboard";
import { metricConfig } from "../lib/metric-config";
import { useRevenueTrend } from "../hooks/use-revenue-trend";
import { FxTooltip } from "./fx-tooltip";

export function RevenueTrendChart({
  trends,
  currency,
  className = "",
}: {
  trends: MonthlyRevenueTrend[];
  currency: string;
  className?: string;
}) {
  const {
    activeMetric,
    setActiveMetric,
    currentVal,
    diffPercent,
    isPositive,
    activeConfig,
  } = useRevenueTrend(trends);

  const isMounted = useIsMounted();

  return (
    <div
      className={`flex h-full flex-col justify-between rounded-xl border border-transparent bg-surface p-4 sm:p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] transition-colors dark:shadow-none ${className}`}>
      {/* Header */}
      <div>
        {/* Total revenue trend */}
        <div className="flex items-center gap-2">
          <p className="text-[13px] font-bold uppercase tracking-wider text-muted-light">
            Revenue Trend
          </p>
          <TrendingUp size={14} className="text-purple" />
        </div>

        {/* Amount + Tab row */}
        <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <p className="text-2xl font-bold tracking-[-0.5px] text-ink">
                {formatMoney(currentVal, currency)}
              </p>
              {diffPercent !== 0 && (
                <span
                  className={`flex items-center gap-0.5 text-[12px] font-bold ${
                    isPositive ? "text-status-paid" : "text-danger"
                  }`}>
                  {isPositive ? (
                    <ArrowUpRight size={14} strokeWidth={2.5} />
                  ) : (
                    <ArrowDownRight size={14} strokeWidth={2.5} />
                  )}
                  {Math.abs(diffPercent)}%
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[12px] font-medium text-muted">
              Current month vs previous
            </p>
          </div>

          <div className="flex w-full max-w-full items-center gap-1 overflow-x-auto no-scrollbar rounded-xl bg-surface-subtle p-1 shadow-xs sm:w-auto sm:justify-start sm:gap-1.5 sm:p-1.5">
            {(["total", "paid", "pending", "overdue"] as const).map((key) => {
              const isSelected = activeMetric === key;
              const config = metricConfig[key];
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveMetric(key)}
                  className={`flex flex-1 min-w-0 items-center justify-center gap-1 rounded-lg px-2 py-1.5 text-[11px] font-bold capitalize whitespace-nowrap transition-all sm:flex-initial sm:gap-2 sm:px-3.5 sm:py-2 sm:text-[13px] ${
                    isSelected
                      ? "bg-surface text-ink shadow-[0_2px_8px_rgba(var(--shadow-navy),0.08)] dark:bg-sidebar-border dark:text-white"
                      : "text-muted hover:bg-surface/50 hover:text-ink dark:hover:bg-sidebar-border/50"
                  }`}>
                  <span
                    className="size-1.5 shrink-0 rounded-full sm:size-2"
                    style={{ backgroundColor: config.color }}
                  />
                  <span>{key}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Chart Container */}
      <div className="mt-6 flex-1 min-h-72.5 w-full">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trends}
              margin={{ top: 14, right: 6, left: -6, bottom: 0 }}>
              <defs>
                <linearGradient
                  id={activeConfig.gradientId}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1">
                  <stop
                    offset="5%"
                    stopColor={activeConfig.color}
                    stopOpacity={0.28}
                  />
                  <stop
                    offset="95%"
                    stopColor={activeConfig.color}
                    stopOpacity={0.0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="var(--border)"
                opacity={0.35}
              />

              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tick={{ fill: "currentColor", fontSize: 12, fontWeight: 700 }}
                className="text-muted-light"
                padding={{ left: 4, right: 4 }}
              />

              <YAxis
                width={34}
                tickLine={false}
                axisLine={false}
                tickMargin={4}
                tick={{ fill: "currentColor", fontSize: 11, fontWeight: 500 }}
                className="text-muted"
                tickFormatter={(val: number) => {
                  try {
                    return new Intl.NumberFormat("en-US", {
                      notation: "compact",
                      compactDisplay: "short",
                      maximumFractionDigits: 1,
                    }).format(val);
                  } catch {
                    return `${val / 1000}k`;
                  }
                }}
              />

              <Tooltip
                cursor={{
                  stroke: "var(--border)",
                  strokeWidth: 1.5,
                  strokeDasharray: "4 4",
                }}
                content={
                  <FxTooltip
                    currency={currency}
                    selectedMetric={activeMetric}
                  />
                }
              />

              <Area
                type="monotone"
                dataKey={activeMetric}
                stroke={activeConfig.color}
                strokeWidth={3}
                fill={`url(#${activeConfig.gradientId})`}
                dot={false}
                activeDot={{
                  r: 6,
                  strokeWidth: 2,
                  stroke: "#ffffff",
                  fill: activeConfig.color,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full animate-pulse rounded-lg bg-surface-subtle" />
        )}
      </div>
    </div>
  );
}
