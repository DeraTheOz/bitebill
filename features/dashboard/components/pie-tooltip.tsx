"use client";

import { formatMoney } from "@/lib/format";
import type { InvoiceStatus } from "@/features/invoices/types/invoice";
import { statusConfig } from "../lib/status-config";

type TooltipPayloadItem = {
  name?: string;
  value?: number;
  payload?: {
    status: InvoiceStatus;
    count: number;
    total: number;
    percentage: number;
  };
};

export function PieCustomTooltip({
  active,
  payload,
  currency,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  currency: string;
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0].payload;
  if (!item) return null;

  const config = statusConfig[item.status];

  return (
    <div className="relative z-50 rounded-xl border border-sidebar-border/40 bg-deep px-3.5 py-2.5 text-xs text-white shadow-2xl">
      <div className="flex items-center gap-2">
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: config.color }}
        />
        <span className="font-bold text-sm tracking-tight">{config.label}</span>
      </div>
      <p className="mt-1 font-semibold text-muted-light">
        {item.count} {item.count === 1 ? "invoice" : "invoices"} ({item.percentage}%)
      </p>
      <p className="mt-0.5 font-bold text-white">
        {formatMoney(item.total, currency)}
      </p>
    </div>
  );
}

