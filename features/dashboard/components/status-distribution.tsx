"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { formatMoney } from "@/lib/format";
import type { StatusDistributionItem } from "../types/dashboard";
import { statusConfig } from "../lib/status-config";
import { useStatusDistribution } from "../hooks/use-status-distribution";
import { PieCustomTooltip } from "./pie-tooltip";

export function StatusDistribution({
  items,
  totalInvoices,
  currency,
  className = "",
}: {
  items: StatusDistributionItem[];
  totalInvoices: number;
  currency: string;
  className?: string;
}) {
  const isMounted = useIsMounted();
  const { displayData, hasData, invoiceLabel, centerInvoiceLabel } =
    useStatusDistribution(items, totalInvoices);

  return (
    <div
      className={`flex h-full flex-col justify-between rounded-xl border border-transparent bg-surface p-4 sm:p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] transition-colors dark:shadow-none ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-[16px] font-bold tracking-[-0.2px] text-ink">
            Status Breakdown
          </h2>
          <PieChartIcon size={16} className="text-purple" />
        </div>
        <span className="text-[13px] font-bold text-muted-light">
          {totalInvoices} {invoiceLabel}
        </span>
      </div>

      {/* Donut Chart */}
      <div className="relative my-2 flex flex-1 min-h-60 sm:min-h-64 w-full items-center justify-center select-none outline-none **:outline-none">
        {isMounted ? (
          <>
            {/* Center Label (positioned behind chart & tooltip layer) */}
            <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center text-center">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-light">
                Total
              </span>
              <span className="text-3xl font-bold tracking-tight text-ink">
                {totalInvoices}
              </span>
              <span className="text-[12px] font-semibold text-muted">
                {centerInvoiceLabel}
              </span>
            </div>

            <div className="relative z-10 h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={displayData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={102}
                    paddingAngle={displayData.length > 1 ? 4 : 0}
                    cornerRadius={5}
                    stroke="none"
                  />
                  {hasData && (
                    <Tooltip
                      wrapperStyle={{ zIndex: 50, outline: "none" }}
                      content={<PieCustomTooltip currency={currency} />}
                    />
                  )}
                </PieChart>
              </ResponsiveContainer>
            </div>
          </>
        ) : (
          <div className="size-48 animate-pulse rounded-full bg-surface-subtle" />
        )}
      </div>

      {/* Legend & Breakdown list */}
      <div className="space-y-1.5 border-t border-border/40 pt-3">
        {items.map((item) => {
          const config = statusConfig[item.status];

          return (
            <div
              key={item.status}
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[13px] transition-colors hover:bg-surface-subtle/60">
              <div className="flex items-center gap-2.5">
                <span
                  className={`size-2.5 shrink-0 rounded-full ${config.dot}`}
                />
                <span className="font-bold text-ink">{config.label}</span>
                <span className="font-medium text-muted-light">
                  ({item.count})
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-muted">
                  {formatMoney(item.total, currency)}
                </span>
                <span className="w-10 text-right font-bold text-ink">
                  {item.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
