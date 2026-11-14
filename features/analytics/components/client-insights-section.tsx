"use client";

import type { ClientAnalyticsItem } from "../types/analytics";
import { useClientInsights } from "../hooks/use-client-insights";
import { ClientHorizontalChart } from "./client-horizontal-chart";
import { ClientLeaderboard } from "./client-leaderboard";

export function ClientInsightsSection({
  clients,
  currency,
}: {
  clients: ClientAnalyticsItem[];
  currency: string;
}) {
  const {
    searchQuery,
    setSearchQuery,
    sortBy,
    setSortBy,
    sortOptions,
    filteredClients,
    topClients,
  } = useClientInsights(clients);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {/* Horizontal Top Clients Chart */}
        {topClients.length > 0 && (
          <ClientHorizontalChart
            topClients={topClients}
            currency={currency}
          />
        )}

        {/* Client Leaderboard & Directory */}
        <ClientLeaderboard
          clients={filteredClients}
          currency={currency}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          sortOptions={sortOptions}
        />
      </div>
    </div>
  );
}

