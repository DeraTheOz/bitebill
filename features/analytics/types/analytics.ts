import type { AnalyticsRange } from "../schemas/analytics-schema";

export type { AnalyticsRange };

export type AnalyticsSummary = {
  totalBilled: number;
  collectedRevenue: number;
  pendingRevenue: number;
  overdueRevenue: number;
  collectionRate: number;
  averageInvoiceValue: number;
  averageDaysToPay: number;
  activeMrr: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  draftInvoices: number;
  previousPeriodBilled: number;
  growthPercent: number;
};

export type AnalyticsMonthlyPoint = {
  month: string;
  year: number;
  yearMonth: string;
  paid: number;
  pending: number;
  overdue: number;
  total: number;
  invoiceCount: number;
};

export type ClientAnalyticsItem = {
  clientId: string;
  clientName: string;
  company: string | null;
  email: string | null;
  image: string | null;
  totalBilled: number;
  paidAmount: number;
  outstandingAmount: number;
  overdueAmount: number;
  invoiceCount: number;
  paidInvoiceCount: number;
  averageDaysToPay: number | null;
  revenueSharePercent: number;
};

export type AgingBucketKey = "current" | "1-30" | "31-60" | "61-90" | "90+";

export type AgingBucket = {
  key: AgingBucketKey;
  label: string;
  amount: number;
  count: number;
  percentage: number;
};

export type AnalyticsData = {
  range: string;
  currency: string;
  availableYears: number[];
  summary: AnalyticsSummary;
  monthlySeries: AnalyticsMonthlyPoint[];
  clientRankings: ClientAnalyticsItem[];
  agingBuckets: AgingBucket[];
};

