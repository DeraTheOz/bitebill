import type {
  InvoiceEventType,
  InvoiceListItem,
  InvoiceStatus,
} from "@/features/invoices/types/invoice";

export type DashboardMetrics = {
  totalRevenue: number;
  paidRevenue: number;
  pendingRevenue: number;
  overdueRevenue: number;
  totalInvoices: number;
  paidInvoices: number;
  pendingInvoices: number;
  overdueInvoices: number;
  draftInvoices: number;
  currency: string;
};

export type MonthlyRevenueTrend = {
  month: string;
  year: number;
  paid: number;
  pending: number;
  overdue: number;
  total: number;
};

export type StatusDistributionItem = {
  status: InvoiceStatus;
  count: number;
  total: number;
  percentage: number;
};

export type DashboardActivityItem = {
  id: string;
  eventType: InvoiceEventType;
  description: string;
  createdAt: string;
  invoiceId: string;
  invoiceNumber: string | null;
};

export type DashboardData = {
  metrics: DashboardMetrics;
  monthlyTrends: MonthlyRevenueTrend[];
  statusDistribution: StatusDistributionItem[];
  recentInvoices: InvoiceListItem[];
  recentActivity: DashboardActivityItem[];
};

