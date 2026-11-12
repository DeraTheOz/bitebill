export type RevenueBar = {
  month: string;
  value: number;
};

export type RevenueCard = {
  label: string;
  value: string;
  accent: string;
};

export type DistributionSlice = {
  label: string;
  share: string;
  dot: string;
};

/** Sample monthly revenue data displayed in the landing page analytics showcase. */
export const revenueByMonth: RevenueBar[] = [
  { month: "Mar", value: 38 },
  { month: "Apr", value: 52 },
  { month: "May", value: 45 },
  { month: "Jun", value: 64 },
  { month: "Jul", value: 58 },
  { month: "Aug", value: 76 },
  { month: "Sep", value: 71 },
  { month: "Oct", value: 94 },
];

/** Summary KPI cards shown in the landing page analytics preview. */
export const revenueCards: RevenueCard[] = [
  { label: "Total revenue", value: "$48,200", accent: "text-ink" },
  { label: "Pending", value: "$12,450", accent: "text-status-pending" },
  { label: "Overdue", value: "$3,100", accent: "text-danger" },
];

/** Sample invoice status percentages shown in the landing analytics section. */
export const distribution: DistributionSlice[] = [
  { label: "Paid", share: "64%", dot: "bg-status-paid" },
  { label: "Pending", share: "24%", dot: "bg-status-pending" },
  { label: "Overdue", share: "12%", dot: "bg-danger" },
];

/** Bullet points describing analytics capabilities on the landing page. */
export const insights = [
  "Revenue cards for total, paid, pending, and overdue",
  "Monthly revenue trends that chart themselves",
  "Status distribution at a glance",
  "Recent activity straight from the timeline",
];
