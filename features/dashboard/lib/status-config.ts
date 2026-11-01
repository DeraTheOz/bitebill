// Shared status config for pie chart and legend
import type { InvoiceStatus } from "@/features/invoices/types/invoice";

export const statusConfig: Record<
  InvoiceStatus,
  { label: string; color: string; dot: string }
> = {
  paid: {
    label: "Paid",
    color: "#33d69f",
    dot: "bg-status-paid",
  },
  pending: {
    label: "Pending",
    color: "#ff8f00",
    dot: "bg-status-pending",
  },
  overdue: {
    label: "Overdue",
    color: "#ec5757",
    dot: "bg-danger",
  },
  draft: {
    label: "Draft",
    color: "#7e88c3",
    dot: "bg-status-draft dark:bg-muted-light",
  },
};

