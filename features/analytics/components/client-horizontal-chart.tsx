"use client";

import Link from "next/link";
import { Users } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { formatMoney } from "@/lib/format";
import type { ClientAnalyticsItem } from "../types/analytics";

export function ClientHorizontalChart({
  topClients,
  currency,
  className = "",
}: {
  topClients: ClientAnalyticsItem[];
  currency: string;
  className?: string;
}) {
  const maxBilled = topClients.length > 0 ? topClients[0].totalBilled : 1;

  return (
    <div
      className={`flex flex-col justify-between rounded-xl border border-transparent bg-surface p-4 sm:p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] transition-colors dark:shadow-none ${className}`}>
      {/* Header */}
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-[15px] font-bold tracking-[-0.2px] text-ink sm:text-[16px]">
              Top Clients by Revenue
            </h2>
            <Users size={16} className="text-purple" />
          </div>
          <span className="text-[12px] font-bold text-muted-light">
            Top {topClients.length}
          </span>
        </div>
        <p className="mt-1 text-[12px] font-medium text-muted">
          Client revenue concentration and volume
        </p>
      </div>

      {/* Bars List */}
      <div className="mt-5 space-y-2">
        {topClients.length > 0 ? (
          topClients.map((client) => {
            const barWidthPercent =
              maxBilled > 0
                ? Math.max(4, Math.round((client.totalBilled / maxBilled) * 100))
                : 0;

            return (
              <Link
                key={client.clientId}
                href={`/clients/${client.clientId}`}
                className="group block rounded-xl p-2.5 -mx-2.5 transition-all hover:bg-surface-subtle/80 cursor-pointer focus-visible:outline-2 focus-visible:outline-purple">
                <div className="flex items-center justify-between gap-2 text-[13px]">
                  <div className="flex min-w-0 items-center gap-2.5">
                    <Avatar
                      name={client.clientName}
                      image={client.image}
                      className="size-6 text-[10px]"
                    />
                    <div className="min-w-0 truncate">
                      <span className="font-bold text-ink group-hover:text-purple transition-colors truncate block">
                        {client.clientName}
                      </span>
                      {client.company && (
                        <span className="text-[11px] font-medium text-muted-light truncate block">
                          {client.company}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-baseline gap-2 text-right">
                    <span className="font-bold text-ink group-hover:text-purple transition-colors">
                      {formatMoney(client.totalBilled, currency)}
                    </span>
                    <span className="text-[11px] font-semibold text-muted">
                      {client.revenueSharePercent}%
                    </span>
                  </div>
                </div>

                {/* Bar */}
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-surface-subtle">
                  <div
                    style={{ width: `${barWidthPercent}%` }}
                    className="h-full rounded-full bg-purple transition-all duration-500 group-hover:bg-purple-light"
                  />
                </div>
              </Link>
            );
          })
        ) : (
          <div className="py-8 text-center text-sm font-medium text-muted">
            No billed client revenue recorded for this period.
          </div>
        )}
      </div>
    </div>
  );
}

