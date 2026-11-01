"use client";

import { AlertCircle, CheckCircle2, Clock, Wallet } from "lucide-react";
import type { DashboardMetrics } from "../types/dashboard";
import { AnimatedAmount } from "./animated-amount";

export function MetricCards({ metrics }: { metrics: DashboardMetrics }) {
  const cards = [
    {
      label: "Total Revenue",
      value: metrics.totalRevenue,
      countLabel: `${metrics.totalInvoices} ${metrics.totalInvoices === 1 ? "invoice" : "invoices"}`,
      icon: Wallet,
      accentColor: "text-purple",
      iconBg: "bg-purple/10 text-purple",
    },
    {
      label: "Paid Revenue",
      value: metrics.paidRevenue,
      countLabel: `${metrics.paidInvoices} paid`,
      icon: CheckCircle2,
      accentColor: "text-status-paid",
      iconBg: "bg-status-paid/10 text-status-paid",
    },
    {
      label: "Pending Revenue",
      value: metrics.pendingRevenue,
      countLabel: `${metrics.pendingInvoices} pending`,
      icon: Clock,
      accentColor: "text-status-pending",
      iconBg: "bg-status-pending/10 text-status-pending",
    },
    {
      label: "Overdue Revenue",
      value: metrics.overdueRevenue,
      countLabel: `${metrics.overdueInvoices} overdue`,
      icon: AlertCircle,
      accentColor: metrics.overdueRevenue > 0 ? "text-danger" : "text-muted-light",
      iconBg: metrics.overdueRevenue > 0 ? "bg-danger/10 text-danger" : "bg-muted/10 text-muted-light",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.label}
            className="flex flex-col justify-between rounded-xl border border-transparent bg-surface p-5 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] transition-colors dark:shadow-none">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] font-medium tracking-[-0.1px] text-muted-light">
                {card.label}
              </span>
              <span
                className={`grid size-9 shrink-0 place-items-center rounded-lg ${card.iconBg}`}
                aria-hidden="true">
                <Icon size={18} strokeWidth={2.2} />
              </span>
            </div>

            <div className="mt-4">
              <p className={`text-2xl font-bold tracking-[-0.5px] ${card.accentColor}`}>
                <AnimatedAmount value={card.value} currency={metrics.currency} />
              </p>
              <p className="mt-1 text-[13px] font-medium text-muted">
                {card.countLabel}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
