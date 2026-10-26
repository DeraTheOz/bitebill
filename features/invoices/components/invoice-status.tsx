import type { InvoiceStatus } from "../types/invoice";

const statusStyles: Record<
  InvoiceStatus,
  { label: string; className: string }
> = {
  paid: {
    label: "Paid",
    className: "bg-status-paid/[0.06] text-status-paid",
  },
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
    className: "bg-status-draft/[0.06] text-status-draft",
  },
};

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  const style = statusStyles[status];

  return (
    <span
      className={`flex h-10 w-26 items-center justify-center gap-2 rounded-md text-[15px] font-bold tracking-[-0.25px] ${style.className}`}>
      <span className="size-2 rounded-full bg-current" />
      {style.label}
    </span>
  );
}
