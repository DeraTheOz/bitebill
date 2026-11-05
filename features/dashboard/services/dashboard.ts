import "server-only";

import { and, desc, eq, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import { clients, invoiceEvents, invoices } from "@/db/schema";
import { getBrandingSettings } from "@/features/branding/services/branding";
import type {
  InvoiceListItem,
  InvoiceStatus,
} from "@/features/invoices/types/invoice";
import type {
  DashboardActivityItem,
  DashboardData,
  DashboardMetrics,
  MonthlyRevenueTrend,
  StatusDistributionItem,
} from "../types/dashboard";

const round2 = (value: number) =>
  Math.round((value + Number.EPSILON) * 100) / 100;

const today = () => new Date().toISOString().slice(0, 10);

function computeStatus(
  rowStatus: "draft" | "pending" | "paid",
  dueDate: string,
): InvoiceStatus {
  if (rowStatus !== "paid" && dueDate < today()) {
    return "overdue";
  }
  return rowStatus;
}

export async function getDashboardData(
  userId: string,
  period = "6m",
): Promise<DashboardData> {
  const branding = await getBrandingSettings(userId);
  const currency = branding?.currency ?? "USD";

  // 1. Fetch all active invoices for metric calculation
  const allInvoices = await db
    .select({
      id: invoices.id,
      status: invoices.status,
      dueDate: invoices.dueDate,
      issueDate: invoices.issueDate,
      total: invoices.total,
      currency: invoices.currency,
    })
    .from(invoices)
    .where(and(eq(invoices.userId, userId), isNull(invoices.deletedAt)));

  let paidRevenue = 0;
  let pendingRevenue = 0;
  let overdueRevenue = 0;
  let draftRevenue = 0;

  let paidCount = 0;
  let pendingCount = 0;
  let overdueCount = 0;
  let draftCount = 0;

  for (const inv of allInvoices) {
    const amount = Number(inv.total);
    const effectiveStatus = computeStatus(inv.status, inv.dueDate);

    switch (effectiveStatus) {
      case "paid":
        paidRevenue += amount;
        paidCount++;
        break;
      case "pending":
        pendingRevenue += amount;
        pendingCount++;
        break;
      case "overdue":
        overdueRevenue += amount;
        overdueCount++;
        break;
      case "draft":
        draftRevenue += amount;
        draftCount++;
        break;
    }
  }

  paidRevenue = round2(paidRevenue);
  pendingRevenue = round2(pendingRevenue);
  overdueRevenue = round2(overdueRevenue);
  draftRevenue = round2(draftRevenue);
  const totalRevenue = round2(paidRevenue + pendingRevenue + overdueRevenue);
  const totalInvoices = allInvoices.length;

  const metrics: DashboardMetrics = {
    totalRevenue,
    paidRevenue,
    pendingRevenue,
    overdueRevenue,
    totalInvoices,
    paidInvoices: paidCount,
    pendingInvoices: pendingCount,
    overdueInvoices: overdueCount,
    draftInvoices: draftCount,
    currency,
  };

  // 3. Status Distribution breakdown
  const statuses: { status: InvoiceStatus; count: number; total: number }[] = [
    { status: "paid", count: paidCount, total: paidRevenue },
    { status: "pending", count: pendingCount, total: pendingRevenue },
    { status: "overdue", count: overdueCount, total: overdueRevenue },
    { status: "draft", count: draftCount, total: draftRevenue },
  ];

  const statusDistribution: StatusDistributionItem[] = statuses.map((item) => ({
    status: item.status,
    count: item.count,
    total: item.total,
    percentage:
      totalInvoices > 0 ? Math.round((item.count / totalInvoices) * 100) : 0,
  }));

  // 4. Monthly Revenue Trends
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const invoiceYears = allInvoices
    .map((inv) => new Date(inv.issueDate).getUTCFullYear())
    .filter((y) => !Number.isNaN(y));
  const availableYears = Array.from(
    new Set([currentYear, ...invoiceYears]),
  ).sort((a, b) => b - a);

  const parsedYear = Number(period);
  const isYearMode =
    !Number.isNaN(parsedYear) && parsedYear >= 2000 && parsedYear <= 2100;

  const months: { label: string; year: number; yearMonth: string }[] = [];

  if (isYearMode) {
    // Generate all 12 calendar months for the selected year (Jan - Dec)
    for (let m = 0; m < 12; m++) {
      const d = new Date(Date.UTC(parsedYear, m, 1));
      const label = d.toLocaleDateString("en-US", {
        month: "short",
        timeZone: "UTC",
      });
      const yearMonth = `${parsedYear}-${String(m + 1).padStart(2, "0")}`;
      months.push({ label, year: parsedYear, yearMonth });
    }
  } else {
    // Default: Rolling 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(
        Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1),
      );
      const label = d.toLocaleDateString("en-US", {
        month: "short",
        timeZone: "UTC",
      });
      const year = d.getUTCFullYear();
      const yearMonth = `${year}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      months.push({ label, year, yearMonth });
    }
  }

  const monthlyTrends: MonthlyRevenueTrend[] = months.map(
    ({ label, year, yearMonth }) => {
      let mPaid = 0;
      let mPending = 0;
      let mOverdue = 0;

      for (const inv of allInvoices) {
        if (inv.issueDate.startsWith(yearMonth)) {
          const amt = Number(inv.total);
          const st = computeStatus(inv.status, inv.dueDate);
          if (st === "paid") mPaid += amt;
          else if (st === "pending") mPending += amt;
          else if (st === "overdue") mOverdue += amt;
        }
      }

      mPaid = round2(mPaid);
      mPending = round2(mPending);
      mOverdue = round2(mOverdue);

      return {
        month: label,
        year,
        paid: mPaid,
        pending: mPending,
        overdue: mOverdue,
        total: round2(mPaid + mPending + mOverdue),
      };
    },
  );

  // 5. Recent Invoices (Latest 8)
  const recentInvoiceRows = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      issueDate: invoices.issueDate,
      dueDate: invoices.dueDate,
      currency: invoices.currency,
      total: invoices.total,
      clientName: clients.name,
      createdAt: invoices.createdAt,
    })
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .where(and(eq(invoices.userId, userId), isNull(invoices.deletedAt)))
    .orderBy(desc(invoices.createdAt))
    .limit(8);

  const recentInvoices: InvoiceListItem[] = recentInvoiceRows.map((row) => ({
    id: row.id,
    invoiceNumber: row.invoiceNumber,
    clientName: row.clientName,
    status: computeStatus(row.status, row.dueDate),
    issueDate: row.issueDate,
    dueDate: row.dueDate,
    currency: row.currency,
    total: Number(row.total),
  }));

  // 6. Recent Activity (Latest 10 events)
  const activityRows = await db
    .select({
      id: invoiceEvents.id,
      eventType: invoiceEvents.eventType,
      description: invoiceEvents.description,
      createdAt: invoiceEvents.createdAt,
      invoiceId: invoiceEvents.invoiceId,
      invoiceNumber: invoices.invoiceNumber,
    })
    .from(invoiceEvents)
    .leftJoin(invoices, eq(invoiceEvents.invoiceId, invoices.id))
    .where(eq(invoiceEvents.userId, userId))
    .orderBy(desc(invoiceEvents.createdAt))
    .limit(10);

  const recentActivity: DashboardActivityItem[] = activityRows.map((row) => ({
    id: row.id,
    eventType: row.eventType,
    description: row.description,
    createdAt: row.createdAt.toISOString(),
    invoiceId: row.invoiceId,
    invoiceNumber: row.invoiceNumber ?? null,
  }));

  return {
    metrics,
    monthlyTrends,
    statusDistribution,
    recentInvoices,
    recentActivity,
    availableYears,
    period: isYearMode ? String(parsedYear) : "6m",
  };
}
