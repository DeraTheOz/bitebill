import type { ClientInvoiceStatus } from "../types/client-invoice";

const statusStyles: Record<
  ClientInvoiceStatus,
  { label: string; className: string }
> = {
  paid: { label: "Paid", className: "bg-status-paid/[0.06] text-status-paid" },
  pending: {
    label: "Pending",
    className: "bg-status-pending/[0.06] text-status-pending",
  },
  overdue: {
    label: "Overdue",
    className: "bg-danger/[0.06] text-danger",
  },
  draft: {
    label: "Draft",
    className: "bg-status-draft/[0.06] text-status-draft dark:bg-white/5 dark:text-muted",
  },
};

export function ClientInvoiceStatusBadge({
  status,
  className = "",
}: {
  status: ClientInvoiceStatus;
  className?: string;
}) {
  const style = statusStyles[status];

  return (
    <span
      className={`flex h-8 w-24 shrink-0 items-center justify-center gap-2 rounded-md text-[13px] font-bold tracking-[-0.1px] ${style.className} ${className}`}>
      <span className="size-2 rounded-full bg-current" />
      {style.label}
    </span>
  );
}
