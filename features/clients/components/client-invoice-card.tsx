import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { ClientInvoiceStatusBadge } from "./client-invoice-status";
import type { InvoiceListItem } from "@/features/invoices/types/invoice";
import { formatDate, formatMoney } from "@/lib/format";

export function ClientInvoiceCard({ invoice }: { invoice: InvoiceListItem }) {
  return (
    <Link
      href={`/invoices/${invoice.id}`}
      aria-label={`Open invoice ${invoice.invoiceNumber}`}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-lg border border-border bg-surface p-5 transition-all hover:-translate-y-0.5 hover:border-purple focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="block text-[15px] font-bold tracking-[-0.25px] text-ink">
            <span className="text-muted-light">#</span>
            {invoice.invoiceNumber}
          </span>
          <span className="mt-1 block wrap-anywhere text-[13px] font-medium tracking-[-0.1px] text-muted">
            {invoice.clientName}
          </span>
        </div>
        <ClientInvoiceStatusBadge status={invoice.status} />
      </div>

      <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-4">
        <div className="text-[13px] leading-4.5 text-muted-light">
          <p>
            Issued{" "}
            <span className="text-muted">{formatDate(invoice.issueDate)}</span>
          </p>
          <p className="mt-1">
            Due <span className="text-muted">{formatDate(invoice.dueDate)}</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <strong className="text-[17px] font-bold tracking-[-0.25px] text-ink">
            {formatMoney(invoice.total, invoice.currency)}
          </strong>
          <ArrowUpRight
            size={16}
            strokeWidth={2}
            className="text-purple transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
          />
        </div>
      </div>
    </Link>
  );
}
