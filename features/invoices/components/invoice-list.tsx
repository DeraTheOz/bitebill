import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { InvoiceStatusBadge } from "./invoice-status";
import { formatDate, formatMoney } from "@/lib/format";
import type { InvoiceListItem } from "../types/invoice";

export function InvoiceList({ invoices }: { invoices: InvoiceListItem[] }) {
  return (
    <div className="space-y-4">
      {invoices.map((invoice) => (
        <Link
          key={invoice.id}
          href={`/invoices/${invoice.id}`}
          className="grid w-full grid-cols-[minmax(92px,1.1fr)_minmax(120px,1.25fr)_minmax(120px,1.2fr)_minmax(88px,1fr)_104px_14px] items-center gap-4 rounded-lg border border-transparent bg-surface px-6 py-6.25 text-left shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] transition-[border-color,transform] hover:-translate-y-0.5 hover:border-purple focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple dark:shadow-none max-[720px]:relative max-[720px]:block max-[720px]:h-33.5 max-[720px]:px-6 max-[720px]:py-0"
          aria-label={`Open invoice ${invoice.invoiceNumber}`}>
          <span className="text-[15px] font-bold tracking-[-0.25px] text-ink max-[720px]:absolute max-[720px]:left-6 max-[720px]:top-6">
            <span className="text-muted">#</span>
            {invoice.invoiceNumber}
          </span>

          <span className="text-[13px] font-medium tracking-[-0.1px] text-muted-light max-[720px]:absolute max-[720px]:left-6 max-[720px]:top-17.5">
            Due <span className="text-muted">{formatDate(invoice.dueDate)}</span>
          </span>

          <span className="text-[13px] font-medium tracking-[-0.1px] text-muted-light max-[720px]:absolute max-[720px]:right-6 max-[720px]:top-6 max-[720px]:text-right dark:max-[720px]:text-ink">
            {invoice.clientName ?? "—"}
          </span>

          <span className="text-right text-[15px] font-bold tracking-[-0.25px] text-ink max-[720px]:absolute max-[720px]:left-6 max-[720px]:top-22.5">
            {formatMoney(invoice.total, invoice.currency)}
          </span>

          <span className="max-[720px]:absolute max-[720px]:right-6 max-[720px]:top-17.5">
            <InvoiceStatusBadge status={invoice.status} />
          </span>

          <ChevronRight
            size={18}
            strokeWidth={2}
            className="text-purple max-[720px]:hidden"
          />
        </Link>
      ))}
    </div>
  );
}
