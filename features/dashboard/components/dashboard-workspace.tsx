"use client";

import { useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { AnimatePresence } from "motion/react";
import { useBranding } from "@/features/branding/components/branding-provider";
import { InvoiceFormDrawer } from "@/features/invoices/components/invoice-form-drawer";
import { ClientFormDrawer } from "@/features/clients/components/client-form-drawer";
import { ErrorState } from "@/components/errors/error-state";
import { useDashboard } from "../hooks/use-dashboard-queries";
import { MetricCards } from "./metric-cards";
import { RevenueTrendChart } from "./revenue-trend-chart";
import { StatusDistribution } from "./status-distribution";
import { RecentInvoicesCard } from "./recent-invoices-card";
import { DashboardActivity } from "./dashboard-activity";
import { DashboardSkeleton } from "./dashboard-skeleton";

export function DashboardWorkspace() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isCreateClientOpen, setIsCreateClientOpen] = useState(false);
  const branding = useBranding();
  const { data, isPending, isError, refetch } = useDashboard();

  return (
    <main className="px-6 pb-14 pt-26 md:px-10 md:pt-30 lg:px-12 lg:pt-16">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <header className="mb-8 flex flex-wrap items-end justify-between gap-x-4 gap-y-6 md:mb-10">
          <div>
            <h1 className="text-[32px] font-bold leading-none tracking-[-1.125px] text-ink sm:text-[36px]">
              Dashboard
            </h1>
            <p className="mt-2 text-[13px] font-medium tracking-[-0.1px] text-muted-light">
              Overview for{" "}
              <span className="font-bold text-ink">
                {branding.businessName || "your business"}
              </span>
            </p>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            <button
              type="button"
              onClick={() => setIsCreateClientOpen(true)}
              className="flex h-12 items-center gap-2 rounded-full border border-border bg-surface px-4 text-[14px] font-bold tracking-[-0.25px] text-ink shadow-xs transition-all hover:border-purple/50 hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple sm:px-5 sm:text-[15px]">
              <UserPlus size={16} className="text-purple" strokeWidth={2.5} />
              <span className="hidden sm:inline">New Client</span>
              <span className="sm:hidden">Client</span>
            </button>

            <button
              type="button"
              onClick={() => setIsCreateOpen(true)}
              className="flex h-12 items-center gap-2 rounded-full bg-purple py-2 pl-2 pr-4 text-[14px] font-bold tracking-[-0.25px] text-white transition-colors hover:bg-purple-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple sm:pr-5 sm:text-[15px]">
              <span className="grid size-8 place-items-center rounded-full bg-white text-purple">
                <Plus size={16} strokeWidth={2.5} />
              </span>
              <span className="hidden sm:inline">New Invoice</span>
              <span className="sm:hidden">Invoice</span>
            </button>
          </div>
        </header>

        {isPending ? (
          <DashboardSkeleton />
        ) : isError ? (
          <ErrorState
            title="Could not load dashboard"
            description="We encountered an issue fetching your dashboard metrics. Please try again."
            onRetry={() => void refetch()}
            className="py-16"
          />
        ) : data ? (
          <div className="space-y-6">
            {/* Top row: 4 Metric Cards */}
            <MetricCards metrics={data.metrics} />

            {/* Middle row: Revenue Trends + Status Breakdown */}
            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
              <div className="flex flex-col lg:col-span-2">
                <RevenueTrendChart
                  trends={data.monthlyTrends}
                  currency={data.metrics.currency}
                />
              </div>
              <div className="flex flex-col lg:col-span-1">
                <StatusDistribution
                  items={data.statusDistribution}
                  totalInvoices={data.metrics.totalInvoices}
                  currency={data.metrics.currency}
                />
              </div>
            </div>

            {/* Bottom row: Recent Invoices + Recent Activity */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <RecentInvoicesCard
                invoices={data.recentInvoices}
                onCreateClick={() => setIsCreateOpen(true)}
              />
              <DashboardActivity activities={data.recentActivity} />
            </div>
          </div>
        ) : null}
      </div>

      <AnimatePresence>
        {isCreateOpen && (
          <InvoiceFormDrawer
            mode="create"
            onClose={() => setIsCreateOpen(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isCreateClientOpen && (
          <ClientFormDrawer
            mode="create"
            onClose={() => setIsCreateClientOpen(false)}
          />
        )}
      </AnimatePresence>
    </main>
  );
}
