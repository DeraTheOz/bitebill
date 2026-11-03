"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import { useIsMounted } from "@/hooks/use-is-mounted";
import { formatMoney } from "@/lib/format";
import type { StatusDistributionItem } from "../types/dashboard";
import { statusConfig } from "../lib/status-config";
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

  const emptyData = [
    { name: "None", count: 1, fill: "var(--border)", fillOpacity: 0.3 },
  ];

  const chartData = items
    .filter((item) => item.count > 0)
    .map((item) => ({
      ...item,
      name: statusConfig[item.status].label,
      fill: statusConfig[item.status].color,
    }));

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
          {totalInvoices} {totalInvoices === 1 ? "invoice" : "invoices"}
        </span>
      </div>

      {/* Donut Chart */}
      <div className="relative my-2 flex h-52 w-full items-center justify-center">
        {isMounted ? (
          <>
            {/* Center Label (positioned behind chart & tooltip layer) */}
            <div className="pointer-events-none absolute inset-0 z-0 flex flex-col items-center justify-center text-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-light">
                Total
              </span>
              <span className="text-2xl font-bold tracking-tight text-ink">
                {totalInvoices}
              </span>
              <span className="text-[11px] font-semibold text-muted">
                Invoices
              </span>
            </div>

            <div className="relative z-10 h-full w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData.length > 0 ? chartData : emptyData}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={74}
                    paddingAngle={chartData.length > 1 ? 4 : 0}
                    cornerRadius={4}
                    stroke="none"
                  />
                  {chartData.length > 0 && (
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
          <div className="size-40 animate-pulse rounded-full bg-surface-subtle" />
        )}
      </div>

      {/* Legend & Breakdown list */}
      <div className="space-y-2 pt-2">
        {items.map((item) => {
          const config = statusConfig[item.status];

          return (
            <div
              key={item.status}
              className="flex items-center justify-between rounded-lg px-2 py-1 text-[13px] transition-colors hover:bg-surface-subtle/60">
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
