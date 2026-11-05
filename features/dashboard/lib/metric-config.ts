// Shared metric config for revenue trend chart tabs
export type MetricKey = "total" | "paid" | "pending" | "overdue";

export const metricConfig: Record<
  MetricKey,
  { label: string; tabLabel: string; color: string; gradientId: string }
> = {
  total: {
    label: "Total Revenue",
    tabLabel: "All",
    color: "#7c5dfa",
    gradientId: "totalFxGrad",
  },
  paid: {
    label: "Paid Revenue",
    tabLabel: "Paid",
    color: "#33d69f",
    gradientId: "paidFxGrad",
  },
  pending: {
    label: "Pending Revenue",
    tabLabel: "Pending",
    color: "#ff8f00",
    gradientId: "pendingFxGrad",
  },
  overdue: {
    label: "Overdue Revenue",
    tabLabel: "Overdue",
    color: "#ec5757",
    gradientId: "overdueFxGrad",
  },
};
