import Link from "next/link";
import { AlertTriangle, ChevronRight } from "lucide-react";
import { formatDate, formatMoney } from "@/lib/format";
import type { RecurringTemplateListItem } from "../types/recurring";
import {
  RecurringFrequencyBadge,
  RecurringStatusBadge,
} from "./recurring-status";

export function RecurringList({
  templates,
}: {
  templates: RecurringTemplateListItem[];
}) {
  return (
    <div className="space-y-4">
      {templates.map((template) => (
        <Link
          key={template.id}
          href={`/recurring-invoices/${template.id}`}
          aria-label={`Open recurring invoice ${template.title}`}
          className="grid w-full grid-cols-[minmax(140px,1.4fr)_minmax(120px,1.1fr)_minmax(110px,1.1fr)_minmax(96px,0.9fr)_104px_14px] items-center gap-4 rounded-lg border border-transparent bg-surface px-6 py-6 text-left shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] transition-[border-color,transform] hover:-translate-y-0.5 hover:border-purple focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple dark:shadow-none max-[720px]:relative max-[720px]:block max-[720px]:h-38 max-[720px]:px-6 max-[720px]:py-0">
          <span className="min-w-0 max-[720px]:absolute max-[720px]:left-6 max-[720px]:top-5 max-[720px]:max-w-[calc(100%-8.5rem)]">
            <span className="flex items-center gap-2">
              <span className="truncate text-[15px] font-bold tracking-[-0.25px] text-ink">
                {template.title}
              </span>
              {template.clientDeleted && (
                <AlertTriangle
                  className="size-4 shrink-0 text-danger"
                  aria-label="Client deleted"
                />
              )}
            </span>
            <span className="mt-1 inline-flex items-center gap-2">
              <RecurringFrequencyBadge frequency={template.frequency} />
            </span>
          </span>

          <span className="text-[13px] font-medium tracking-[-0.1px] text-muted-light max-[720px]:absolute max-[720px]:left-6 max-[720px]:top-20">
            Next{" "}
            <span className="text-muted">
              {formatDate(template.nextRunDate)}
            </span>
          </span>

          <span className="truncate text-[13px] font-medium tracking-[-0.1px] text-muted-light max-[720px]:hidden">
            {template.clientName ?? "—"}
          </span>

          <span className="text-right text-[15px] font-bold tracking-[-0.25px] text-ink max-[720px]:absolute max-[720px]:left-6 max-[720px]:top-27.5">
            {formatMoney(template.total, template.currency)}
          </span>

          <span className="max-[720px]:absolute max-[720px]:right-6 max-[720px]:top-17.5">
            <RecurringStatusBadge active={template.active} />
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

