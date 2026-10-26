import { formatDateTime } from "@/lib/format";
import type { InvoiceEvent, InvoiceEventType } from "../types/invoice";

const dotStyles: Record<InvoiceEventType, string> = {
  created: "bg-purple",
  updated: "bg-status-pending",
  sent: "bg-status-pending",
  paid: "bg-status-paid",
  deleted: "bg-danger",
  shared: "bg-status-draft",
  downloaded: "bg-status-draft",
};

export function InvoiceActivity({ events }: { events: InvoiceEvent[] }) {
  if (!events.length) return null;

  return (
    <section
      aria-labelledby="invoice-activity-heading"
      className="mt-10 rounded-lg bg-surface p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] dark:shadow-none md:p-8">
      <h2
        id="invoice-activity-heading"
        className="text-[15px] font-bold text-purple">
        Activity
      </h2>

      <ol className="mt-5 space-y-4">
        {events.map((event) => (
          <li key={event.id} className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className={`mt-1.5 size-2 shrink-0 rounded-full ${dotStyles[event.eventType]}`}
            />
            <div>
              <p className="text-[13px] font-bold leading-5 tracking-[-0.1px] text-ink">
                {event.description}
              </p>
              <p className="mt-0.5 text-[13px] font-medium text-muted-light">
                {formatDateTime(event.createdAt)}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
