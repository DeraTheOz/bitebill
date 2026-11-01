"use client";

import Link from "next/link";
import { Activity } from "lucide-react";
import { formatDateTime } from "@/lib/format";
import type { InvoiceEventType } from "@/features/invoices/types/invoice";
import type { DashboardActivityItem } from "../types/dashboard";

const dotStyles: Record<InvoiceEventType, string> = {
  created: "bg-purple",
  updated: "bg-status-pending",
  sent: "bg-status-pending",
  paid: "bg-status-paid",
  deleted: "bg-danger",
  shared: "bg-status-draft",
  downloaded: "bg-status-draft",
};

export function DashboardActivity({
  activities,
}: {
  activities: DashboardActivityItem[];
}) {
  return (
    <div className="flex flex-col rounded-xl border border-transparent bg-surface p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] transition-colors dark:shadow-none">
      <div className="flex items-center gap-2">
        <h2 className="text-[16px] font-bold tracking-[-0.2px] text-ink">
          Recent Activity
        </h2>
        <Activity size={16} className="text-purple" />
      </div>

      <div className="mt-6 flex-1">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-purple/10 text-purple">
              <Activity size={22} />
            </span>
            <p className="mt-3 text-[15px] font-bold text-ink">
              No activity yet
            </p>
            <p className="mt-1 text-[13px] text-muted-light">
              Actions taken on your invoices will appear here.
            </p>
          </div>
        ) : (
          <ol className="space-y-4">
            {activities.map((item) => (
              <li key={item.id} className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className={`mt-1.5 size-2 shrink-0 rounded-full ${dotStyles[item.eventType]}`}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2">
                    <p className="text-[13px] font-bold text-ink">
                      {item.description}
                    </p>
                    {item.invoiceNumber && (
                      <Link
                        href={`/invoices/${item.invoiceId}`}
                        className="text-[12px] font-bold text-purple hover:underline">
                        #{item.invoiceNumber}
                      </Link>
                    )}
                  </div>
                  <p className="mt-0.5 text-[12px] font-medium text-muted-light">
                    {formatDateTime(item.createdAt)}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

