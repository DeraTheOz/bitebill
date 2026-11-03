"use client";

import Link from "next/link";
import { ArrowRight, ChevronRight, FileText, Plus } from "lucide-react";
import { formatDate, formatMoney } from "@/lib/format";
import { InvoiceStatusBadge } from "@/features/invoices/components/invoice-status";
import type { InvoiceListItem } from "@/features/invoices/types/invoice";

export function RecentInvoicesCard({
  invoices,
  onCreateClick,
}: {
  invoices: InvoiceListItem[];
  onCreateClick: () => void;
}) {
  return (
    <div className="flex flex-col justify-between rounded-xl border border-transparent bg-surface p-4 sm:p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] transition-colors dark:shadow-none">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h2 className="text-[16px] font-bold tracking-[-0.2px] text-ink">
            Recent Invoices
          </h2>
          <FileText size={16} className="text-purple" />
        </div>
        <Link
          href="/invoices"
          className="inline-flex items-center gap-1 text-[13px] font-bold text-purple hover:text-purple-light">
          View all
          <ArrowRight size={14} />
        </Link>
      </div>

      <div className="mt-6 flex-1">
        {invoices.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <span className="grid size-12 place-items-center rounded-full bg-purple/10 text-purple">
              <FileText size={22} />
            </span>
            <p className="mt-3 text-[15px] font-bold text-ink">
              No invoices yet
            </p>
            <p className="mt-1 text-[13px] text-muted-light">
              Create your first invoice to begin tracking payments.
            </p>
            <button
              type="button"
              onClick={onCreateClick}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-purple px-4 py-2 text-[13px] font-bold text-white transition-colors hover:bg-purple-light">
              <Plus size={14} strokeWidth={2.5} />
              Create Invoice
            </button>
          </div>
        ) : (
          <div className="divide-y divide-border/60">
            {invoices.map((inv) => (
              <Link
                key={inv.id}
                href={`/invoices/${inv.id}`}
                className="group -mx-3 flex items-center justify-between rounded-lg px-3 py-3 transition-colors hover:bg-surface-subtle">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold tracking-[-0.2px] text-ink group-hover:text-purple">
                      #{inv.invoiceNumber}
                    </span>
                    {inv.clientName && (
                      <span className="hidden truncate text-[13px] font-medium text-muted-light sm:inline">
                        • {inv.clientName}
                      </span>
                    )}
                  </div>
                  {inv.clientName && (
                    <p className="mt-0.5 truncate text-[13px] font-medium text-muted-light sm:hidden">
                      {inv.clientName}
                    </p>
                  )}
                  <p className="mt-0.5 text-[12px] text-muted">
                    Due {formatDate(inv.dueDate)}
                  </p>
                </div>

                <div className="flex flex-col items-end gap-1.5 sm:flex-row sm:items-center sm:gap-4">
                  <span className="text-right text-[14px] font-bold text-ink">
                    {formatMoney(inv.total, inv.currency)}
                  </span>
                  <div className="scale-90 origin-right">
                    <InvoiceStatusBadge status={inv.status} />
                  </div>
                  <ChevronRight
                    size={16}
                    className="hidden text-muted-light group-hover:text-purple group-hover:translate-x-0.5 transition-all sm:block"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

