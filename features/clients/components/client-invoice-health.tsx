import { getInvoiceCounts } from "../lib/helpers";
import { ClientInvoice } from "../types/client-invoice";

interface ClientInvoiceHealthProps {
  clientId: string;
  invoices: ClientInvoice[];
}

export function ClientInvoiceHealth({
  clientId,
  invoices,
}: ClientInvoiceHealthProps) {
  const counts = getInvoiceCounts(clientId);

  const healthSegments = [
    { label: "Paid", count: counts.paid, className: "bg-status-paid" },
    {
      label: "Pending",
      count: counts.pending,
      className: "bg-status-pending",
    },
    { label: "Overdue", count: counts.overdue, className: "bg-danger" },
    { label: "Draft", count: counts.draft, className: "bg-status-draft" },
  ].filter((segment) => segment.count > 0);

  return (
    <div className="mt-4 rounded-lg bg-surface p-5 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] dark:shadow-none md:p-6">
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="text-[15px] font-bold tracking-[-0.25px] text-ink">
          Invoice health
        </p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          {healthSegments.map((segment) => (
            <span
              key={segment.label}
              className="flex items-center gap-2 text-[13px] font-medium tracking-[-0.1px] text-muted-light">
              <span className={`size-2.5 rounded-full ${segment.className}`} />
              {segment.label}{" "}
              <span className="font-bold text-muted">{segment.count}</span>
            </span>
          ))}
        </div>
      </div>
      <div
        role="img"
        aria-label={healthSegments
          .map((segment) => `${segment.count} ${segment.label}`)
          .join(", ")}
        className="mt-4 flex h-3 w-full gap-0.5 overflow-hidden rounded-full bg-surface-subtle">
        {healthSegments.map((segment) => (
          <span
            key={segment.label}
            style={{
              width: `${(segment.count / invoices.length) * 100}%`,
            }}
            className={segment.className}
          />
        ))}
      </div>
    </div>
  );
}
