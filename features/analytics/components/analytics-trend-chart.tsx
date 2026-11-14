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
import { TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { formatMoney } from "@/lib/format";
import type { AnalyticsMonthlyPoint } from "../types/analytics";
import {
  ANALYTICS_METRIC_CONFIG,
  useAnalyticsChart,
  type AnalyticsMetricKey,
} from "../hooks/use-analytics-chart";

const ALL_STREAM_KEYS = ["paid", "pending", "overdue"] as const;

type TooltipPayloadItem = {
  value?: number;
  dataKey?: string;
  payload?: AnalyticsMonthlyPoint;
};

function AnalyticsTrendTooltip({
  active,
  payload,
  label,
  currency,
  selectedMetric,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
  currency: string;
  selectedMetric: AnalyticsMetricKey;
}) {
  if (!active || !payload?.length) return null;
  const data = payload[0].payload;
  if (!data) return null;

  const config = ANALYTICS_METRIC_CONFIG[selectedMetric];

  return (
    <div className="rounded-xl border border-sidebar-border/40 bg-deep px-4 py-3 text-xs text-white shadow-2xl">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold text-muted-light">
          {label} {data.year}
        </p>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ backgroundColor: `${config.color}25`, color: config.color }}>
          {data.invoiceCount} {data.invoiceCount === 1 ? "invoice" : "invoices"}
        </span>
      </div>

      <p className="mt-1.5 text-base font-bold tracking-tight text-white">
        {formatMoney(data[selectedMetric], currency)}
      </p>

      {selectedMetric === "total" && (
        <div className="mt-2.5 space-y-1 border-t border-sidebar-border/40 pt-2 text-[11px]">
          <div className="flex justify-between gap-4 text-muted-light">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-status-paid" />
              Paid
            </span>
            <span className="font-semibold text-white">
              {formatMoney(data.paid, currency)}
            </span>
          </div>
          <div className="flex justify-between gap-4 text-muted-light">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-status-pending" />
              Pending
            </span>
            <span className="font-semibold text-white">
              {formatMoney(data.pending, currency)}
            </span>
          </div>
          <div className="flex justify-between gap-4 text-muted-light">
            <span className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-danger" />
              Overdue
            </span>
            <span
              className={`font-semibold ${
                data.overdue > 0 ? "text-danger-light" : "text-white"
              }`}>
              {formatMoney(data.overdue, currency)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function AnalyticsTrendChart({
  series,
  currency,
  className = "",
}: {
  series: AnalyticsMonthlyPoint[];
  currency: string;
  className?: string;
}) {
  const isMounted = useIsMounted();
  const {
    activeMetric,
    setActiveMetric,
    activeConfig,
    hasData,
    activeTotal,
    monthlyAverage,
  } = useAnalyticsChart(series);

  return (
    <div
      className={`flex flex-col justify-between rounded-xl border border-transparent bg-surface p-4 sm:p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] transition-colors dark:shadow-none ${className}`}>
      {/* Header and Controls */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <p className="text-[13px] font-bold uppercase tracking-wider text-muted-light">
              Revenue & Invoicing Trend
            </p>
            <TrendingUp size={14} className="text-purple" />
          </div>

          {/* Segmented Metric Switcher */}
          <div
            role="tablist"
            aria-label="Analytics trend metric"
            className="flex w-full items-center gap-1 rounded-xl border border-border/40 bg-surface-subtle p-1 shadow-xs sm:w-auto">
            {(["total", "paid", "pending", "overdue"] as const).map((key) => {
              const isSelected = activeMetric === key;
              const config = ANALYTICS_METRIC_CONFIG[key];
              return (
                <button
                  key={key}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => setActiveMetric(key)}
                  className={`relative flex flex-1 min-w-0 items-center justify-center rounded-lg px-2.5 py-1.5 text-[12px] font-bold transition-colors sm:flex-initial sm:px-3 sm:py-1.5 sm:text-[13px] ${
                    isSelected
                      ? "text-ink dark:text-white"
                      : "text-muted hover:text-ink hover:bg-surface/40 dark:hover:bg-sidebar-border/40"
                  }`}>
                  {isSelected && (
                    <motion.span
                      layoutId="activeAnalyticsTrendTab"
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

        {/* Current Metric Details */}
        <div className="mt-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-border/40 pb-3">
          <div>
            <p className="text-2xl font-bold tracking-tight text-ink sm:text-3xl">
              {formatMoney(activeTotal, currency)}
            </p>
            <p className="mt-0.5 text-[12px] font-medium text-muted">
              {activeConfig.label} total across period · Avg{" "}
              {formatMoney(monthlyAverage, currency)}/mo
            </p>
          </div>

          <div className="flex items-center gap-4 text-[12px] font-medium text-muted">
            {activeMetric === "total" ? (
              <div className="flex items-center gap-3">
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
              <span className="flex items-center gap-1.5 font-bold" style={{ color: activeConfig.color }}>
                <span className="size-2 rounded-full" style={{ backgroundColor: activeConfig.color }} />
                {activeConfig.label}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Area Chart Canvas */}
      <div className="mt-4 h-64 sm:h-72 w-full select-none outline-none **:outline-none">
        {isMounted ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={series}
              margin={{ top: 12, right: 18, left: -6, bottom: 0 }}>
              <defs>
                <linearGradient id="analyticsTotalGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c5dfa" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#7c5dfa" stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="analyticsPaidGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#33d69f" stopOpacity={0.38} />
                  <stop offset="95%" stopColor="#33d69f" stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="analyticsPendingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff8f00" stopOpacity={0.38} />
                  <stop offset="95%" stopColor="#ff8f00" stopOpacity={0.03} />
                </linearGradient>
                <linearGradient id="analyticsOverdueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ec5757" stopOpacity={0.38} />
                  <stop offset="95%" stopColor="#ec5757" stopOpacity={0.03} />
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
                padding={{ left: 8, right: 16 }}
                tick={{
                  fill: "currentColor",
                  fontSize: series.length > 8 ? 10 : 12,
                  fontWeight: 700,
                }}
                className="text-muted-light"
              />
              <YAxis
                width={38}
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
                  <AnalyticsTrendTooltip
                    currency={currency}
                    selectedMetric={activeMetric}
                  />
                }
              />

              {activeMetric === "total" ? (
                hasData ? (
                  ALL_STREAM_KEYS.map((key) => {
                    const config = ANALYTICS_METRIC_CONFIG[key];
                    return (
                      <Area
                        key={`stream-${key}`}
                        type="monotone"
                        dataKey={key}
                        stroke={config.color}
                        strokeWidth={2.5}
                        fill={`url(#${config.gradientId})`}
                        fillOpacity={0.5}
                        dot={false}
                        activeDot={{
                          r: 5,
                          strokeWidth: 2,
                          stroke: "#ffffff",
                          fill: config.color,
                        }}
                      />
                    );
                  })
                ) : (
                  <Area
                    key="empty-total"
                    type="monotone"
                    dataKey="total"
                    stroke="#7c5dfa"
                    strokeWidth={2.5}
                    fill="url(#analyticsTotalGrad)"
                    dot={false}
                    activeDot={{
                      r: 5,
                      strokeWidth: 2,
                      stroke: "#ffffff",
                      fill: "#7c5dfa",
                    }}
                  />
                )
              ) : (
                <Area
                  key={activeMetric}
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
