"use client";

import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Repeat,
  Scale,
  Wallet,
} from "lucide-react";
import { AnimatedAmount } from "@/features/dashboard/components/animated-amount";
import { formatMoney } from "@/lib/format";
import type { AnalyticsSummary } from "../types/analytics";

export function AnalyticsKpiGrid({
  summary,
  currency,
}: {
  summary: AnalyticsSummary;
  currency: string;
}) {
  const isPositiveGrowth = summary.growthPercent >= 0;

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {/* 1. Total Billed */}
      <div className="flex flex-col justify-between rounded-xl border border-transparent bg-surface p-4 sm:p-5 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] transition-colors dark:shadow-none">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-[12px] font-medium tracking-[-0.1px] text-muted-light">
              Total Billed
            </span>
            {summary.previousPeriodBilled > 0 && (
              <div className="mt-1">
                <span
                  className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold ${
                    isPositiveGrowth
                      ? "bg-status-paid/10 text-status-paid"
                      : "bg-danger/10 text-danger"
                  }`}>
                  {isPositiveGrowth ? (
                    <ArrowUpRight size={12} strokeWidth={2.5} />
                  ) : (
                    <ArrowDownRight size={12} strokeWidth={2.5} />
                  )}
                  {Math.abs(summary.growthPercent)}% vs prior
                </span>
              </div>
            )}
          </div>
          <span
            className="grid size-8 shrink-0 place-items-center rounded-lg bg-purple/10 text-purple"
            aria-hidden="true">
            <Wallet size={16} strokeWidth={2.2} />
          </span>
        </div>

        <div className="mt-4">
          <p className="text-2xl sm:text-[26px] font-bold tracking-[-0.5px] text-ink wrap-break-word">
            <AnimatedAmount value={summary.totalBilled} currency={currency} />
          </p>
          <p className="mt-1 text-[12px] font-medium text-muted">
            {summary.totalInvoices}{" "}
            {summary.totalInvoices === 1 ? "invoice" : "invoices"}
          </p>
        </div>
      </div>

      {/* 2. Collection Rate */}
      <div className="flex flex-col justify-between rounded-xl border border-transparent bg-surface p-4 sm:p-5 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] transition-colors dark:shadow-none">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12px] font-medium tracking-[-0.1px] text-muted-light">
            Collection Rate
          </span>
          <span
            className="grid size-8 shrink-0 place-items-center rounded-lg bg-status-paid/10 text-status-paid"
            aria-hidden="true">
            <CheckCircle2 size={16} strokeWidth={2.2} />
          </span>
        </div>

        <div className="mt-4">
          <p className="text-2xl sm:text-[26px] font-bold tracking-[-0.5px] text-status-paid wrap-break-word">
            {summary.collectionRate}%
          </p>
          <p className="mt-1 text-[12px] font-medium text-muted truncate">
            {formatMoney(summary.collectedRevenue, currency)} collected
          </p>
        </div>
      </div>

      {/* 3. Outstanding / Overdue */}
      <div className="flex flex-col justify-between rounded-xl border border-transparent bg-surface p-4 sm:p-5 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] transition-colors dark:shadow-none">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12px] font-medium tracking-[-0.1px] text-muted-light">
            Outstanding
          </span>
          <span
            className={`grid size-8 shrink-0 place-items-center rounded-lg ${
              summary.overdueRevenue > 0
                ? "bg-danger/10 text-danger"
                : "bg-status-pending/10 text-status-pending"
            }`}
            aria-hidden="true">
            <AlertCircle size={16} strokeWidth={2.2} />
          </span>
        </div>

        <div className="mt-4">
          <p
            className={`text-2xl sm:text-[26px] font-bold tracking-[-0.5px] wrap-break-word ${
              summary.overdueRevenue > 0 ? "text-danger" : "text-status-pending"
            }`}>
            <AnimatedAmount
              value={summary.pendingRevenue + summary.overdueRevenue}
              currency={currency}
            />
          </p>
          <p className="mt-1 text-[12px] font-medium text-muted truncate">
            {summary.overdueRevenue > 0
              ? `${formatMoney(summary.overdueRevenue, currency)} overdue`
              : "0 overdue"}
          </p>
        </div>
      </div>

      {/* 4. Average Invoice Value */}
      <div className="flex flex-col justify-between rounded-xl border border-transparent bg-surface p-4 sm:p-5 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] transition-colors dark:shadow-none">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12px] font-medium tracking-[-0.1px] text-muted-light">
            Avg Invoice Value
          </span>
          <span
            className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-subtle text-muted"
            aria-hidden="true">
            <Scale size={16} strokeWidth={2.2} />
          </span>
        </div>

        <div className="mt-4">
          <p className="text-2xl sm:text-[26px] font-bold tracking-[-0.5px] text-ink wrap-break-word">
            <AnimatedAmount
              value={summary.averageInvoiceValue}
              currency={currency}
            />
          </p>
          <p className="mt-1 text-[12px] font-medium text-muted truncate">
            Per issued invoice
          </p>
        </div>
      </div>

      {/* 5. Average Days to Pay */}
      <div className="flex flex-col justify-between rounded-xl border border-transparent bg-surface p-4 sm:p-5 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] transition-colors dark:shadow-none">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12px] font-medium tracking-[-0.1px] text-muted-light">
            Avg Days to Pay
          </span>
          <span
            className="grid size-8 shrink-0 place-items-center rounded-lg bg-surface-subtle text-muted"
            aria-hidden="true">
            <Clock size={16} strokeWidth={2.2} />
          </span>
        </div>

        <div className="mt-4">
          <p className="text-2xl sm:text-[26px] font-bold tracking-[-0.5px] text-ink wrap-break-word">
            {summary.averageDaysToPay}{" "}
            <span className="text-sm font-semibold text-muted">days</span>
          </p>
          <p className="mt-1 text-[12px] font-medium text-muted truncate">
            Payment velocity
          </p>
        </div>
      </div>

      {/* 6. Active MRR */}
      <div className="flex flex-col justify-between rounded-xl border border-transparent bg-surface p-4 sm:p-5 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] transition-colors dark:shadow-none">
        <div className="flex items-center justify-between gap-3">
          <span className="text-[12px] font-medium tracking-[-0.1px] text-muted-light">
            Active MRR
          </span>
          <span
            className="grid size-8 shrink-0 place-items-center rounded-lg bg-purple/10 text-purple"
            aria-hidden="true">
            <Repeat size={16} strokeWidth={2.2} />
          </span>
        </div>

        <div className="mt-4">
          <p className="text-2xl sm:text-[26px] font-bold tracking-[-0.5px] text-purple wrap-break-word">
            <AnimatedAmount value={summary.activeMrr} currency={currency} />
          </p>
          <p className="mt-1 text-[12px] font-medium text-muted truncate">
            Monthly recurring run-rate
          </p>
        </div>
      </div>
    </div>
  );
}
