"use client";

import { formatMoney } from "@/lib/format";
import type { AgingBucket, AgingBucketKey } from "../types/analytics";

const BUCKET_THEME: Record<
  AgingBucketKey,
  { dot: string; text: string; bar: string }
> = {
  current: {
    dot: "bg-status-paid",
    text: "text-status-paid",
    bar: "bg-status-paid",
  },
  "1-30": {
    dot: "bg-status-pending",
    text: "text-status-pending",
    bar: "bg-status-pending",
  },
  "31-60": {
    dot: "bg-status-pending/80",
    text: "text-status-pending",
    bar: "bg-status-pending/80",
  },
  "61-90": {
    dot: "bg-danger/80",
    text: "text-danger",
    bar: "bg-danger/80",
  },
  "90+": {
    dot: "bg-danger",
    text: "text-danger",
    bar: "bg-danger",
  },
};

export function AnalyticsAgingCard({
  buckets,
  currency,
  className = "",
}: {
  buckets: AgingBucket[];
  currency: string;
  className?: string;
}) {
  const totalUnpaid = buckets.reduce((sum, b) => sum + b.amount, 0);
  const totalUnpaidCount = buckets.reduce((sum, b) => sum + b.count, 0);
  const overdueOnly = buckets
    .filter((b) => b.key !== "current")
    .reduce((sum, b) => sum + b.amount, 0);

  return (
    <div
      className={`flex flex-col justify-between rounded-xl border border-transparent bg-surface p-4 sm:p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] transition-colors dark:shadow-none ${className}`}>
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold tracking-[-0.2px] text-ink sm:text-[16px]">
            Accounts Receivable Aging
          </h2>
          <span className="text-[12px] font-bold text-muted-light">
            {totalUnpaidCount}{" "}
            {totalUnpaidCount === 1 ? "unpaid invoice" : "unpaid invoices"}
          </span>
        </div>

        {/* Amount summary */}
        <div className="mt-3 border-b border-border/40 pb-3">
          <p className="text-2xl font-bold tracking-tight text-ink sm:text-3xl wrap-break-word">
            {formatMoney(totalUnpaid, currency)}
          </p>
          <div className="mt-1 flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
            <p className="text-[12px] font-medium text-muted">
              Total outstanding balance
            </p>
            {overdueOnly > 0 && (
              <span className="inline-flex items-center rounded-full bg-danger/10 px-2.5 py-0.5 text-[11px] font-bold text-danger">
                {formatMoney(overdueOnly, currency)} overdue
              </span>
            )}
          </div>
        </div>

        {/* Stacked Proportional Bar */}
        <div className="mt-4 flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-surface-subtle">
          {totalUnpaid > 0 ? (
            buckets
              .filter((b) => b.amount > 0)
              .map((b) => {
                const theme = BUCKET_THEME[b.key];
                return (
                  <span
                    key={b.key}
                    style={{ width: `${b.percentage}%` }}
                    title={`${b.label}: ${formatMoney(b.amount, currency)} (${b.percentage}%)`}
                    className={`${theme.bar} transition-all duration-300`}
                  />
                );
              })
          ) : (
            <span className="w-full bg-status-paid/30" />
          )}
        </div>
      </div>

      {/* Breakdown list */}
      <div className="mt-4 space-y-2 border-t border-border/40 pt-3">
        {buckets.map((b) => {
          const theme = BUCKET_THEME[b.key];
          return (
            <div
              key={b.key}
              className="flex items-center justify-between rounded-lg px-2.5 py-1.5 text-[12px] sm:text-[13px] transition-colors hover:bg-surface-subtle/60">
              <div className="flex items-center gap-2.5">
                <span
                  className={`size-2.5 shrink-0 rounded-full ${theme.dot}`}
                />
                <span className="font-bold text-ink">{b.label}</span>
                <span className="font-medium text-muted-light">
                  ({b.count})
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-muted">
                  {formatMoney(b.amount, currency)}
                </span>
                <span className="w-9 text-right font-bold text-ink">
                  {b.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
