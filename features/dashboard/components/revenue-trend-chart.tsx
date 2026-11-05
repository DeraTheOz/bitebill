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
import {
  ArrowDownRight,
  ArrowUpRight,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import { motion } from "framer-motion";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { formatMoney } from "@/lib/format";
import type { MonthlyRevenueTrend } from "../types/dashboard";
import { metricConfig } from "../lib/metric-config";
import { useRevenueTrend } from "../hooks/use-revenue-trend";
import { FxTooltip } from "./fx-tooltip";
import { ChartDropdown } from "./chart-dropdown";

export function RevenueTrendChart({
  trends,
  currency,
  period = "6m",
  onPeriodChange,
  availableYears = [],
  className = "",
}: {
  trends: MonthlyRevenueTrend[];
  currency: string;
  period?: string;
  onPeriodChange?: (period: string) => void;
  availableYears?: number[];
  className?: string;
}) {
  const {
    activeMetric,
    setActiveMetric,
    selectedScope,
    setSelectedScope,
    isPeriodScope,
    currentVal,
    previousVal,
    monthlyAverage,
    diffPercent,
    isPositive,
    activeConfig,
    periodOptions,
    scopeOptions,
    selectMonth,
    resetToPeriod,
    selectedMonthData,
    previousMonthData,
  } = useRevenueTrend(trends, period, availableYears);

  const isMounted = useIsMounted();

  return (
    <div
      className={`flex h-full flex-col justify-between rounded-xl border border-transparent bg-surface p-4 sm:p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] transition-colors dark:shadow-none ${className}`}>
      {/* Header Row: Title & Period / Year Filter */}
      <div>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-bold uppercase tracking-wider text-muted-light">
              Revenue Trend
            </p>
            <TrendingUp size={14} className="text-purple" />
          </div>

          {/* Time Horizon (Custom Period / Year Dropdown) */}
          <div className="flex items-center gap-2">
            <span className="hidden text-[12px] font-medium text-muted sm:inline">
              Period:
            </span>
            <ChartDropdown
              value={period}
              onChange={(newPeriod) => onPeriodChange?.(newPeriod)}
              options={periodOptions}
              align="right"
              ariaLabel="Filter revenue period"
            />
          </div>
        </div>

        {/* Amount + Scope Selector + Tab Row */}
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 sm:gap-3">
              <p className="text-2xl font-bold tracking-[-0.5px] text-ink sm:text-3xl">
                {formatMoney(currentVal, currency)}
              </p>

              {/* MoM % Delta when viewing a specific month */}
              {!isPeriodScope && diffPercent !== 0 && (
                <span
                  className={`flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[12px] font-bold ${
                    isPositive
                      ? "bg-status-paid/10 text-status-paid"
                      : "bg-danger/10 text-danger"
                  }`}>
                  {isPositive ? (
                    <ArrowUpRight size={13} strokeWidth={2.5} />
                  ) : (
                    <ArrowDownRight size={13} strokeWidth={2.5} />
                  )}
                  {Math.abs(diffPercent)}%
                </span>
              )}

              {/* Custom Scope / Month Dropdown */}
              <ChartDropdown
                value={selectedScope}
                onChange={setSelectedScope}
                options={scopeOptions}
                align="left"
                ariaLabel="Select revenue inspection scope"
              />

              {/* Quick Reset to Period Total */}
              {!isPeriodScope && (
                <button
                  type="button"
                  onClick={resetToPeriod}
                  title="Reset to full period total"
                  className="inline-flex items-center gap-1 rounded-full border border-border/60 bg-surface px-2.5 py-1 text-[11px] font-bold text-muted transition-colors hover:border-purple hover:text-purple dark:bg-sidebar-border">
                  <RotateCcw className="size-2.5" />
                  <span>Reset</span>
                </button>
              )}
            </div>

            {/* Context Subtitle */}
            <p className="mt-1 text-[12px] font-medium text-muted">
              {isPeriodScope ? (
                <>
                  {activeConfig.label} across{" "}
                  {period === "6m" ? "last 6 months" : `year ${period}`}
                  {monthlyAverage > 0 && (
                    <span className="text-muted-light">
                      {" "}
                      · Avg {formatMoney(monthlyAverage, currency)}/mo
                    </span>
                  )}
                </>
              ) : selectedMonthData ? (
                <>
                  {activeConfig.label} · {selectedMonthData.month}{" "}
                  {selectedMonthData.year}
                  {previousMonthData
                    ? ` vs ${previousMonthData.month} (${formatMoney(previousVal, currency)})`
                    : ""}
                </>
              ) : null}
            </p>
          </div>

          {/* Interactive Segmented Switcher */}
          <div
            role="tablist"
            aria-label="Revenue metric view"
            className="flex w-full items-center gap-1 rounded-xl border border-border/40 bg-surface-subtle p-1 shadow-xs sm:w-auto">
            {(["total", "paid", "pending", "overdue"] as const).map((key) => {
              const isSelected = activeMetric === key;
              const config = metricConfig[key];
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveMetric(key)}
                  className={`relative flex flex-1 min-w-0 items-center justify-center rounded-lg px-2.5 py-1.5 text-[12px] font-bold transition-colors sm:flex-initial sm:px-3.5 sm:py-2 sm:text-[13px] ${
                    isSelected
                      ? "text-ink dark:text-white"
                      : "text-muted hover:text-ink hover:bg-surface/40 dark:hover:bg-sidebar-border/40"
                  }`}>
                  {isSelected && (
                    <motion.span
                      layoutId="activeRevenueTrendTab"
                      className="absolute inset-0 rounded-lg border border-border/60 bg-surface shadow-[0_2px_8px_rgba(var(--shadow-navy),0.08)] dark:border-border/30 dark:bg-sidebar-border"
                      transition={{
                        type: "spring",
                        bounce: 0.15,
                        duration: 0.3,
                      }}
                    />
                  )}
                  <span className="relative z-10">{config.tabLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend / Status Context Row */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-3 text-[12px] font-medium text-muted">
          {activeMetric === "total" ? (
            <div className="flex items-center gap-3 sm:gap-4">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-light">
                Stacked breakdown:
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-status-paid" />
                Paid
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-status-pending" />
                Pending
              </span>
              <span className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-danger" />
                Overdue
              </span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-light">
                  Viewing:
                </span>
                <span
                  className="flex items-center gap-1.5 font-bold"
                  style={{ color: activeConfig.color }}>
                  <span
                    className="size-2 rounded-full"
                    style={{ backgroundColor: activeConfig.color }}
                  />
                  {activeConfig.label}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveMetric("total")}
                className="text-[11px] font-bold text-purple transition-colors hover:text-purple-light focus-visible:outline-none">
                Show all streams
              </button>
            </>
          )}
        </div>
      </div>

      {/* Chart Container */}
      <div className="mt-4 flex-1 min-h-64 sm:min-h-68 w-full select-none outline-none **:outline-none">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={trends}
              onClick={(nextState) => {
                if (
                  nextState &&
                  typeof nextState.activeTooltipIndex === "number" &&
                  nextState.activeTooltipIndex >= 0 &&
                  nextState.activeTooltipIndex < trends.length
                ) {
                  const item = trends[nextState.activeTooltipIndex];
                  if (item) {
                    selectMonth(item.month, item.year);
                  }
                }
              }}
              margin={{ top: 14, right: 6, left: -6, bottom: 0 }}>
              <defs>
                <linearGradient id="totalFxGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c5dfa" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#7c5dfa" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="paidFxGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#33d69f" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#33d69f" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="pendingFxGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff8f00" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#ff8f00" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="overdueFxGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec5757" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#ec5757" stopOpacity={0.05} />
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
                interval={0}
                tickLine={false}
                axisLine={false}
                tick={{
                  fill: "currentColor",
                  fontSize: trends.length > 6 ? 10 : 12,
                  fontWeight: 700,
                }}
                className="text-muted-light"
                padding={{ left: 6, right: 6 }}
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

              {activeMetric === "total" ? (
                <>
                  <Area
                    type="monotone"
                    dataKey="paid"
                    stackId="revenue"
                    stroke="#33d69f"
                    strokeWidth={2.5}
                    fill="url(#paidFxGrad)"
                    dot={false}
                    activeDot={{
                      r: 5,
                      strokeWidth: 2,
                      stroke: "#ffffff",
                      fill: "#33d69f",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="pending"
                    stackId="revenue"
                    stroke="#ff8f00"
                    strokeWidth={2.5}
                    fill="url(#pendingFxGrad)"
                    dot={false}
                    activeDot={{
                      r: 5,
                      strokeWidth: 2,
                      stroke: "#ffffff",
                      fill: "#ff8f00",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="overdue"
                    stackId="revenue"
                    stroke="#ec5757"
                    strokeWidth={2.5}
                    fill="url(#overdueFxGrad)"
                    dot={false}
                    activeDot={{
                      r: 5,
                      strokeWidth: 2,
                      stroke: "#ffffff",
                      fill: "#ec5757",
                    }}
                  />
                </>
              ) : (
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
              )}
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full w-full animate-pulse rounded-lg bg-surface-subtle" />
        )}
      </div>
    </div>
  );
}
