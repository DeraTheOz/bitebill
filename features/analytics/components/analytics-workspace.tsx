"use client";

import { Download } from "lucide-react";
import { ErrorState } from "@/components/errors/error-state";
import { useBranding } from "@/features/branding/components/branding-provider";
import { useAnalyticsWorkspace } from "../hooks/use-analytics-workspace";
import { AnalyticsKpiGrid } from "./analytics-kpi-grid";
import { AnalyticsTrendChart } from "./analytics-trend-chart";
import { AnalyticsAgingCard } from "./analytics-aging-card";
import { ClientInsightsSection } from "./client-insights-section";
import { AnalyticsSkeleton } from "./analytics-skeleton";
import { TimeframeSelect } from "./timeframe-select";

export function AnalyticsWorkspace() {
  const branding = useBranding();
  const {
    range,
    data,
    isPending,
    isError,
    rangeOptions,
    handleRangeChange,
    handleExportCsv,
    refetch,
  } = useAnalyticsWorkspace();

  return (
    <main className="px-4 pb-14 pt-24 sm:px-6 md:px-8 md:pt-28 lg:px-8 lg:pt-14">
      <div className="mx-auto w-full max-w-6xl">
        {/* Header */}
        <header className="mb-6 flex flex-wrap items-end justify-between gap-x-4 gap-y-5 md:mb-8">
          <div>
            <h1 className="text-[32px] font-bold leading-none tracking-[-1.125px] text-ink sm:text-[36px]">
              Analytics
            </h1>
            <p className="mt-2 text-[13px] font-medium tracking-[-0.1px] text-muted-light">
              Financial intelligence & client performance for{" "}
              <span className="font-bold text-ink">
                {branding.businessName || "your business"}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {/* Custom Timeframe Dropdown */}
            <TimeframeSelect
              value={range}
              onChange={handleRangeChange}
              options={rangeOptions}
            />

            {/* Export CSV Button */}
            <button
              type="button"
              onClick={handleExportCsv}
              disabled={isPending || !data}
              className="flex h-11 items-center gap-2 rounded-full border border-border bg-surface px-4 text-[13px] font-bold tracking-[-0.25px] text-ink shadow-xs transition-colors hover:border-purple hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple disabled:cursor-not-allowed disabled:opacity-50 sm:h-12 sm:px-5 sm:text-[14px]">
              <Download size={15} className="text-purple" strokeWidth={2.3} />
              <span className="hidden sm:inline">Export CSV</span>
              <span className="sm:hidden">CSV</span>
            </button>
          </div>
        </header>

        {isPending ? (
          <AnalyticsSkeleton />
        ) : isError ? (
          <ErrorState
            title="Could not load analytics"
            description="We encountered an issue fetching your analytics data. Please try again."
            onRetry={() => void refetch()}
            className="py-16"
          />
        ) : data ? (
          <div className="space-y-6">
            {/* 6 Top KPI Metrics */}
            <AnalyticsKpiGrid
              summary={data.summary}
              currency={data.currency}
            />

            {/* Middle Row: Revenue & Invoicing Trends (2 cols) + AR Aging (1 col) */}
            <div className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-3">
              <div className="flex flex-col lg:col-span-2">
                <AnalyticsTrendChart
                  series={data.monthlySeries}
                  currency={data.currency}
                />
              </div>
              <div className="flex flex-col lg:col-span-1">
                <AnalyticsAgingCard
                  buckets={data.agingBuckets}
                  currency={data.currency}
                />
              </div>
            </div>

            {/* Bottom Row: Client Insights & Leaderboard */}
            <ClientInsightsSection
              clients={data.clientRankings}
              currency={data.currency}
            />
          </div>
        ) : null}
      </div>
    </main>
  );
}

