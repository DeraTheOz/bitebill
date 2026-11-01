// Shared metric config for revenue trend chart tabs
export type MetricKey = "total" | "paid" | "pending" | "overdue";

export const metricConfig: Record<
  MetricKey,
  { label: string; color: string; gradientId: string }
> = {
  total: {
    label: "Total Revenue",
    color: "#7c5dfa",
    gradientId: "totalFxGrad",
  },
  paid: {
    label: "Paid",
    color: "#33d69f",
    gradientId: "paidFxGrad",
  },
  pending: {
    label: "Pending",
    color: "#ff8f00",
    gradientId: "pendingFxGrad",
  },
  overdue: {
    label: "Overdue",
    color: "#ec5757",
    gradientId: "overdueFxGrad",
  },
};
