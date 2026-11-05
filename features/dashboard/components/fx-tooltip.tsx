"use client";

import { formatMoney } from "@/lib/format";
import type { MonthlyRevenueTrend } from "../types/dashboard";
import type { MetricKey } from "../hooks/use-revenue-trend";
import { metricConfig } from "../lib/metric-config";

type TooltipPayloadItem = {
  value?: number;
  dataKey?: string;
  payload?: MonthlyRevenueTrend;
};

export function FxTooltip({
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
  selectedMetric: MetricKey;
}) {
  if (!active || !payload?.length) return null;

  const data = payload[0].payload;
  if (!data) return null;

  const config = metricConfig[selectedMetric];
  const activeValue = data[selectedMetric];

  return (
    <div className="rounded-xl border border-sidebar-border/40 bg-deep px-4 py-3 text-xs text-white shadow-2xl">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-semibold text-muted-light">
          {label} {data.year}
        </p>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ backgroundColor: `${config.color}25`, color: config.color }}>
          {config.label}
        </span>
      </div>

      <p className="mt-1.5 text-base font-bold tracking-tight text-white">
        {formatMoney(activeValue, currency)}
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

