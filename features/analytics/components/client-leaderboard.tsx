"use client";

import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { CustomSelectField } from "@/components/forms/custom-select-field";
import { formatMoney } from "@/lib/format";
import type { ClientAnalyticsItem } from "../types/analytics";
import type { ClientSortBy } from "../hooks/use-client-insights";
import type { CustomSelectOption } from "@/components/forms/custom-select-field";

export function ClientLeaderboard({
  clients,
  currency,
  searchQuery,
  onSearchChange,
  sortBy,
  onSortChange,
  sortOptions,
}: {
  clients: ClientAnalyticsItem[];
  currency: string;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  sortBy: ClientSortBy;
  onSortChange: (sort: ClientSortBy) => void;
  sortOptions: readonly CustomSelectOption[];
}) {
  return (
    <div className="rounded-xl border border-transparent bg-surface p-4 sm:p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] transition-colors dark:shadow-none">
      {/* Header and Controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-[16px] font-bold tracking-[-0.2px] text-ink sm:text-[18px]">
            Client Performance Leaderboard
          </h2>
          <p className="mt-0.5 text-[12px] font-medium text-muted">
            Lifetime billing, collection efficiency, and payment speed per client
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
          {/* Search box */}
          <div className="relative flex-1 sm:w-64">
            <Search
              size={15}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-light"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search clients..."
              className="h-10 w-full rounded-lg border border-border/80 bg-surface pl-9 pr-3 text-[13px] font-medium text-ink transition-colors placeholder:text-muted-light focus:border-purple focus:outline-none"
            />
          </div>

          {/* Custom Sort Select */}
          <div className="w-full sm:w-48">
            <CustomSelectField
              value={sortBy}
              onChange={(val) => onSortChange(val as ClientSortBy)}
              options={sortOptions}
              size="compact"
              ariaLabel="Sort clients"
            />
          </div>
        </div>
      </div>

      {/* Table for desktop screens */}
      <div className="mt-6 hidden overflow-x-auto lg:block">
        <table className="w-full text-left text-[13px]">
          <thead>
            <tr className="border-b border-border/60 text-[11px] font-bold uppercase tracking-wider text-muted-light">
              <th className="pb-3 pl-2">Client</th>
              <th className="pb-3 text-right">Total Billed</th>
              <th className="pb-3 text-right">Collected</th>
              <th className="pb-3 text-right">Outstanding</th>
              <th className="pb-3 text-center">Avg Days to Pay</th>
              <th className="pb-3 text-right pr-2">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/30">
            {clients.length > 0 ? (
              clients.map((client) => (
                <tr
                  key={client.clientId}
                  className="transition-colors hover:bg-surface-subtle/70">
                  {/* Client info */}
                  <td className="py-3.5 pl-2">
                    <Link
                      href={`/clients/${client.clientId}`}
                      className="flex items-center gap-3 group">
                      <Avatar
                        name={client.clientName}
                        image={client.image}
                        className="size-8 text-[11px]"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-ink group-hover:text-purple transition-colors truncate">
                          {client.clientName}
                        </p>
                        <p className="text-[11px] font-medium text-muted-light truncate">
                          {client.company || client.email || "No company"}
                        </p>
                      </div>
                    </Link>
                  </td>

                  {/* Total Billed */}
                  <td className="py-3.5 text-right font-bold text-ink">
                    <div>{formatMoney(client.totalBilled, currency)}</div>
                    <span className="text-[11px] font-semibold text-muted">
                      {client.revenueSharePercent}% share
                    </span>
                  </td>

                  {/* Collected */}
                  <td className="py-3.5 text-right">
                    <span className="font-bold text-status-paid">
                      {formatMoney(client.paidAmount, currency)}
                    </span>
                    <p className="text-[11px] font-medium text-muted">
                      {client.paidInvoiceCount} of {client.invoiceCount} inv
                    </p>
                  </td>

                  {/* Outstanding */}
                  <td className="py-3.5 text-right">
                    <span
                      className={`font-bold ${
                        client.overdueAmount > 0
                          ? "text-danger"
                          : client.outstandingAmount > 0
                            ? "text-status-pending"
                            : "text-muted"
                      }`}>
                      {formatMoney(client.outstandingAmount, currency)}
                    </span>
                    {client.overdueAmount > 0 && (
                      <p className="text-[11px] font-medium text-danger">
                        {formatMoney(client.overdueAmount, currency)} overdue
                      </p>
                    )}
                  </td>

                  {/* Avg Days to Pay */}
                  <td className="py-3.5 text-center font-medium text-ink">
                    {client.averageDaysToPay !== null ? (
                      <span className="inline-flex items-center rounded-full bg-surface-subtle px-2 py-0.5 text-[12px] font-bold text-ink">
                        {client.averageDaysToPay}d
                      </span>
                    ) : (
                      <span className="text-muted-light">—</span>
                    )}
                  </td>

                  {/* View Client */}
                  <td className="py-3.5 text-right pr-2">
                    <Link
                      href={`/clients/${client.clientId}`}
                      className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-[12px] font-bold text-purple transition-colors hover:bg-purple/10">
                      View
                      <ArrowUpRight size={13} strokeWidth={2.5} />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted">
                  No clients matched your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Responsive Cards Grid for Mobile & Tablet */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
        {clients.length > 0 ? (
          clients.map((client) => (
            <div
              key={client.clientId}
              className="flex flex-col justify-between rounded-xl border border-border/60 bg-surface-subtle/50 p-4 transition-colors hover:border-purple/40">
              <div className="flex items-start justify-between gap-3">
                <Link
                  href={`/clients/${client.clientId}`}
                  className="flex items-center gap-2.5 min-w-0 group">
                  <Avatar
                    name={client.clientName}
                    image={client.image}
                    className="size-8 text-[11px]"
                  />
                  <div className="min-w-0 truncate">
                    <p className="font-bold text-ink truncate text-[14px] group-hover:text-purple transition-colors">
                      {client.clientName}
                    </p>
                    <p className="text-[11px] font-medium text-muted-light truncate">
                      {client.company || client.email || "No company"}
                    </p>
                  </div>
                </Link>

                <Link
                  href={`/clients/${client.clientId}`}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-purple/10 px-3 py-1.5 text-[12px] font-bold text-purple transition-colors hover:bg-purple/15">
                  <span>View</span>
                  <ArrowUpRight size={13} strokeWidth={2.5} />
                </Link>
              </div>

              <div className="mt-3.5 grid grid-cols-2 gap-3 border-t border-border/40 pt-3 text-[12px]">
                <div>
                  <span className="text-muted-light block text-[11px] font-medium">Billed:</span>
                  <span className="font-bold text-ink text-[13px]">
                    {formatMoney(client.totalBilled, currency)}
                  </span>
                  <span className="text-[10px] font-semibold text-muted block">
                    {client.revenueSharePercent}% share
                  </span>
                </div>
                <div>
                  <span className="text-muted-light block text-[11px] font-medium">Collected:</span>
                  <span className="font-bold text-status-paid text-[13px]">
                    {formatMoney(client.paidAmount, currency)}
                  </span>
                  <span className="text-[10px] font-medium text-muted block">
                    {client.paidInvoiceCount} of {client.invoiceCount} inv
                  </span>
                </div>
                <div>
                  <span className="text-muted-light block text-[11px] font-medium">Outstanding:</span>
                  <span
                    className={`font-bold text-[13px] ${
                      client.overdueAmount > 0
                        ? "text-danger"
                        : client.outstandingAmount > 0
                          ? "text-status-pending"
                          : "text-muted"
                    }`}>
                    {formatMoney(client.outstandingAmount, currency)}
                  </span>
                  {client.overdueAmount > 0 && (
                    <span className="text-[10px] font-medium text-danger block">
                      {formatMoney(client.overdueAmount, currency)} overdue
                    </span>
                  )}
                </div>
                <div>
                  <span className="text-muted-light block text-[11px] font-medium">Avg Speed:</span>
                  <span className="font-bold text-ink text-[13px]">
                    {client.averageDaysToPay !== null
                      ? `${client.averageDaysToPay} days`
                      : "—"}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-8 text-center text-muted text-sm">
            No clients matched your criteria.
          </div>
        )}
      </div>
    </div>
  );
}
