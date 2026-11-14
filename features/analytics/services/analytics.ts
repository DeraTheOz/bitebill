import "server-only";

import { and, eq, inArray, isNull } from "drizzle-orm";
import { db } from "@/db/client";
import {
  clients,
  invoices,
  recurringInvoiceItems,
  recurringInvoiceTemplates,
} from "@/db/schema";
import { getBrandingSettings } from "@/features/branding/services/branding";
import type { InvoiceStatus } from "@/features/invoices/types/invoice";
import type {
  AgingBucket,
  AgingBucketKey,
  AnalyticsData,
  AnalyticsMonthlyPoint,
  AnalyticsSummary,
  ClientAnalyticsItem,
} from "../types/analytics";

/**
 * Rounds a numeric currency value to 2 decimal places using epsilon adjustment.
 *
 * @param value - Raw numeric value.
 * @returns Value rounded to two decimal places.
 */
const round2 = (value: number): number =>
  Math.round((value + Number.EPSILON) * 100) / 100;

/**
 * Returns today's UTC calendar date as a `YYYY-MM-DD` string.
 *
 * @returns Current UTC date string.
 */
const today = (): string => new Date().toISOString().slice(0, 10);

/**
 * Derives the effective invoice status, treating non-paid invoices past due date as overdue.
 *
 * @param rowStatus - Database invoice status.
 * @param dueDate - Due date string formatted as `YYYY-MM-DD`.
 * @returns Computed effective invoice status.
 */
function computeStatus(
  rowStatus: "draft" | "pending" | "paid",
  dueDate: string,
): InvoiceStatus {
  if (rowStatus !== "paid" && dueDate < today()) {
    return "overdue";
  }
  return rowStatus;
}

/**
 * Calculates the number of days elapsed between two dates.
 *
 * @param startDate - Starting ISO date or date string.
 * @param endDate - Ending ISO date or date string.
 * @returns Clamped non-negative days count.
 */
function daysBetween(startDate: string, endDate: string | Date): number {
  const start = new Date(
    startDate.length <= 10 ? `${startDate}T00:00:00Z` : startDate,
  );
  const end = typeof endDate === "string" ? new Date(endDate) : endDate;
  const diffMs = end.getTime() - start.getTime();
  return Math.max(0, Math.round(diffMs / 86400000));
}

/**
 * Builds the list of month metadata for the requested analytics range.
 *
 * @param range - Selected range keyword or 4-digit calendar year.
 * @param earliestIssueDate - Earliest recorded invoice date in user history.
 * @returns Array of month objects with labels and year-month strings.
 */
function resolveMonthBuckets(
  range: string,
  earliestIssueDate?: string,
): { label: string; year: number; yearMonth: string }[] {
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const currentMonth = now.getUTCMonth();

  const parsedYear = Number(range);
  const isYearMode =
    !Number.isNaN(parsedYear) && parsedYear >= 2000 && parsedYear <= 2100;

  if (isYearMode) {
    const list: { label: string; year: number; yearMonth: string }[] = [];
    for (let m = 0; m < 12; m++) {
      const d = new Date(Date.UTC(parsedYear, m, 1));
      const label = d.toLocaleDateString("en-US", {
        month: "short",
        timeZone: "UTC",
      });
      const yearMonth = `${parsedYear}-${String(m + 1).padStart(2, "0")}`;
      list.push({ label, year: parsedYear, yearMonth });
    }
    return list;
  }

  if (range === "ytd") {
    const list: { label: string; year: number; yearMonth: string }[] = [];
    for (let m = 0; m <= currentMonth; m++) {
      const d = new Date(Date.UTC(currentYear, m, 1));
      const label = d.toLocaleDateString("en-US", {
        month: "short",
        timeZone: "UTC",
      });
      const yearMonth = `${currentYear}-${String(m + 1).padStart(2, "0")}`;
      list.push({ label, year: currentYear, yearMonth });
    }
    return list;
  }

  if (range === "all" && earliestIssueDate) {
    const earliest = new Date(`${earliestIssueDate.slice(0, 7)}-01T00:00:00Z`);
    const startYear = earliest.getUTCFullYear();
    const startMonth = earliest.getUTCMonth();

    const monthCount = Math.min(
      36,
      Math.max(
        1,
        (currentYear - startYear) * 12 + (currentMonth - startMonth) + 1,
      ),
    );

    const list: { label: string; year: number; yearMonth: string }[] = [];
    for (let i = monthCount - 1; i >= 0; i--) {
      const d = new Date(Date.UTC(currentYear, currentMonth - i, 1));
      const label = d.toLocaleDateString("en-US", {
        month: "short",
        timeZone: "UTC",
      });
      const year = d.getUTCFullYear();
      const yearMonth = `${year}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      list.push({ label, year, yearMonth });
    }
    return list;
  }

  let spanMonths = 6;
  if (range === "3m") spanMonths = 3;
  if (range === "12m") spanMonths = 12;

  const list: { label: string; year: number; yearMonth: string }[] = [];
  for (let i = spanMonths - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(currentYear, currentMonth - i, 1));
    const label = d.toLocaleDateString("en-US", {
      month: "short",
      timeZone: "UTC",
    });
    const year = d.getUTCFullYear();
    const yearMonth = `${year}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
    list.push({ label, year, yearMonth });
  }
  return list;
}

/**
 * Calculates normalized Monthly Recurring Revenue (MRR) from active templates and their line items.
 *
 * @param userId - Unique identifier of the authenticated user.
 * @returns Total estimated MRR in account currency.
 */
async function computeActiveMrr(userId: string): Promise<number> {
  const activeTemplates = await db
    .select({
      id: recurringInvoiceTemplates.id,
      frequency: recurringInvoiceTemplates.frequency,
      taxRate: recurringInvoiceTemplates.taxRate,
    })
    .from(recurringInvoiceTemplates)
    .where(
      and(
        eq(recurringInvoiceTemplates.userId, userId),
        eq(recurringInvoiceTemplates.active, true),
      ),
    );

  if (activeTemplates.length === 0) return 0;

  const templateIds = activeTemplates.map((t) => t.id);

  const items = await db
    .select({
      templateId: recurringInvoiceItems.templateId,
      quantity: recurringInvoiceItems.quantity,
      unitPrice: recurringInvoiceItems.unitPrice,
    })
    .from(recurringInvoiceItems)
    .where(
      and(
        eq(recurringInvoiceItems.createdBy, userId),
        inArray(recurringInvoiceItems.templateId, templateIds),
      ),
    );

  let totalMrr = 0;

  for (const template of activeTemplates) {
    const templateItems = items.filter(
      (item) => item.templateId === template.id,
    );
    const subtotal = templateItems.reduce(
      (sum, item) => sum + Number(item.quantity) * Number(item.unitPrice),
      0,
    );
    const taxRate = Number(template.taxRate) || 0;
    const tax = (subtotal * taxRate) / 100;
    const templateTotal = subtotal + tax;

    if (template.frequency === "monthly") {
      totalMrr += templateTotal;
    } else if (template.frequency === "quarterly") {
      totalMrr += templateTotal / 3;
    } else if (template.frequency === "yearly") {
      totalMrr += templateTotal / 12;
    }
  }

  return round2(totalMrr);
}

/**
 * Computes Accounts Receivable (AR) aging buckets for all unpaid invoices.
 *
 * @param unpaidInvoices - List of unpaid invoice records with due date and total.
 * @returns Array of 5 standardized AR aging buckets with counts, amounts, and percentages.
 */
function computeAgingBuckets(
  unpaidInvoices: { dueDate: string; total: number }[],
): AgingBucket[] {
  const todayStr = today();
  const buckets: Record<
    AgingBucketKey,
    { label: string; amount: number; count: number }
  > = {
    current: { label: "Current (Not Due)", amount: 0, count: 0 },
    "1-30": { label: "1–30 Days Overdue", amount: 0, count: 0 },
    "31-60": { label: "31–60 Days Overdue", amount: 0, count: 0 },
    "61-90": { label: "61–90 Days Overdue", amount: 0, count: 0 },
    "90+": { label: "90+ Days Overdue", amount: 0, count: 0 },
  };

  for (const inv of unpaidInvoices) {
    if (inv.dueDate >= todayStr) {
      buckets.current.amount += inv.total;
      buckets.current.count++;
    } else {
      const daysOverdue = daysBetween(inv.dueDate, todayStr);
      if (daysOverdue <= 30) {
        buckets["1-30"].amount += inv.total;
        buckets["1-30"].count++;
      } else if (daysOverdue <= 60) {
        buckets["31-60"].amount += inv.total;
        buckets["31-60"].count++;
      } else if (daysOverdue <= 90) {
        buckets["61-90"].amount += inv.total;
        buckets["61-90"].count++;
      } else {
        buckets["90+"].amount += inv.total;
        buckets["90+"].count++;
      }
    }
  }

  const totalUnpaid = Object.values(buckets).reduce(
    (sum, b) => sum + b.amount,
    0,
  );

  const keys: AgingBucketKey[] = ["current", "1-30", "31-60", "61-90", "90+"];

  return keys.map((key) => {
    const item = buckets[key];
    const amount = round2(item.amount);
    return {
      key,
      label: item.label,
      amount,
      count: item.count,
      percentage:
        totalUnpaid > 0 ? Math.round((amount / totalUnpaid) * 100) : 0,
    };
  });
}

/**
 * Aggregates business intelligence metrics, trend series, client rankings, and aging metrics for `userId`.
 *
 * @param userId - Unique identifier of the authenticated user.
 * @param range - Selected reporting range (e.g. `3m`, `6m`, `12m`, `ytd`, `all`, or year).
 * @returns Comprehensive analytics payload.
 */
export async function getAnalyticsData(
  userId: string,
  range = "6m",
): Promise<AnalyticsData> {
  const branding = await getBrandingSettings(userId);
  const currency = branding?.currency ?? "USD";

  // 1. Fetch all active, non-deleted invoices with client relationship
  const allInvoices = await db
    .select({
      id: invoices.id,
      clientId: invoices.clientId,
      invoiceNumber: invoices.invoiceNumber,
      status: invoices.status,
      dueDate: invoices.dueDate,
      issueDate: invoices.issueDate,
      total: invoices.total,
      currency: invoices.currency,
      paidAt: invoices.paidAt,
      createdAt: invoices.createdAt,
      clientName: clients.name,
      clientCompany: clients.company,
      clientEmail: clients.email,
      clientImage: clients.image,
    })
    .from(invoices)
    .leftJoin(clients, eq(invoices.clientId, clients.id))
    .where(and(eq(invoices.userId, userId), isNull(invoices.deletedAt)));

  // Available calendar years from invoice issue dates
  const now = new Date();
  const currentYear = now.getUTCFullYear();
  const invoiceYears = allInvoices
    .map((inv) => new Date(inv.issueDate).getUTCFullYear())
    .filter((y) => !Number.isNaN(y));
  const availableYears = Array.from(
    new Set([currentYear, ...invoiceYears]),
  ).sort((a, b) => b - a);

  // 2. Earliest invoice date for 'all' range
  const sortedDates = allInvoices
    .map((inv) => inv.issueDate)
    .filter(Boolean)
    .sort();
  const earliestIssueDate = sortedDates[0];

  // 3. Resolve target month buckets
  const monthBuckets = resolveMonthBuckets(range, earliestIssueDate);
  const inRangeYearMonths = new Set(monthBuckets.map((m) => m.yearMonth));

  // Determine prior period window for period-over-period delta
  const spanMonths = monthBuckets.length;
  const firstBucket = monthBuckets[0];
  const priorPeriodYearMonths = new Set<string>();

  if (firstBucket) {
    const priorFirstDate = new Date(
      Date.UTC(
        firstBucket.year,
        parseInt(firstBucket.yearMonth.slice(5, 7), 10) - 1 - spanMonths,
        1,
      ),
    );
    for (let i = 0; i < spanMonths; i++) {
      const d = new Date(
        Date.UTC(
          priorFirstDate.getUTCFullYear(),
          priorFirstDate.getUTCMonth() + i,
          1,
        ),
      );
      const ym = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`;
      priorPeriodYearMonths.add(ym);
    }
  }

  // 4. Monthly series calculation
  const monthlySeries: AnalyticsMonthlyPoint[] = monthBuckets.map(
    ({ label, year, yearMonth }) => {
      let mPaid = 0;
      let mPending = 0;
      let mOverdue = 0;
      let invoiceCount = 0;

      for (const inv of allInvoices) {
        if (inv.issueDate.startsWith(yearMonth)) {
          invoiceCount++;
          const amount = Number(inv.total);
          const effectiveStatus = computeStatus(inv.status, inv.dueDate);
          if (effectiveStatus === "paid") mPaid += amount;
          else if (effectiveStatus === "pending") mPending += amount;
          else if (effectiveStatus === "overdue") mOverdue += amount;
        }
      }

      mPaid = round2(mPaid);
      mPending = round2(mPending);
      mOverdue = round2(mOverdue);

      return {
        month: label,
        year,
        yearMonth,
        paid: mPaid,
        pending: mPending,
        overdue: mOverdue,
        total: round2(mPaid + mPending + mOverdue),
        invoiceCount,
      };
    },
  );

  // 5. In-range and prior-period invoice aggregation
  let inRangePaid = 0;
  let inRangePending = 0;
  let inRangeOverdue = 0;

  let paidInvoicesCount = 0;
  let pendingInvoicesCount = 0;
  let overdueInvoicesCount = 0;
  let draftInvoicesCount = 0;

  let priorPeriodBilled = 0;
  let totalDaysToPay = 0;
  let paidWithDaysCount = 0;

  // Unpaid invoices across entire user dataset for AR aging
  const unpaidForAging: { dueDate: string; total: number }[] = [];

  // Client rankings accumulator
  type ClientStat = {
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
    daysToPayTotal: number;
  };

  const clientMap = new Map<string, ClientStat>();

  for (const inv of allInvoices) {
    const amount = Number(inv.total);
    const effectiveStatus = computeStatus(inv.status, inv.dueDate);
    const invoiceYm = inv.issueDate.slice(0, 7);

    // Track unpaid invoices for AR aging
    if (inv.status !== "paid" && inv.status !== "draft") {
      unpaidForAging.push({ dueDate: inv.dueDate, total: amount });
    }

    // Check prior period for growth
    if (priorPeriodYearMonths.has(invoiceYm) && inv.status !== "draft") {
      priorPeriodBilled += amount;
    }

    // Check in-range status
    if (inRangeYearMonths.has(invoiceYm)) {
      switch (effectiveStatus) {
        case "paid":
          inRangePaid += amount;
          paidInvoicesCount++;
          if (inv.paidAt) {
            const days = daysBetween(inv.issueDate, inv.paidAt);
            totalDaysToPay += days;
            paidWithDaysCount++;
          }
          break;
        case "pending":
          inRangePending += amount;
          pendingInvoicesCount++;
          break;
        case "overdue":
          inRangeOverdue += amount;
          overdueInvoicesCount++;
          break;
        case "draft":
          draftInvoicesCount++;
          break;
      }

      // Aggregate client insights for in-range activity
      const cId = inv.clientId;
      const existing = clientMap.get(cId) ?? {
        clientId: cId,
        clientName: inv.clientName || "Unknown Client",
        company: inv.clientCompany,
        email: inv.clientEmail,
        image: inv.clientImage,
        totalBilled: 0,
        paidAmount: 0,
        outstandingAmount: 0,
        overdueAmount: 0,
        invoiceCount: 0,
        paidInvoiceCount: 0,
        daysToPayTotal: 0,
      };

      existing.invoiceCount++;

      if (effectiveStatus !== "draft") {
        existing.totalBilled += amount;
      }

      if (effectiveStatus === "paid") {
        existing.paidAmount += amount;
        existing.paidInvoiceCount++;
        if (inv.paidAt) {
          existing.daysToPayTotal += daysBetween(inv.issueDate, inv.paidAt);
        }
      } else if (effectiveStatus === "pending") {
        existing.outstandingAmount += amount;
      } else if (effectiveStatus === "overdue") {
        existing.outstandingAmount += amount;
        existing.overdueAmount += amount;
      }

      clientMap.set(cId, existing);
    }
  }

  inRangePaid = round2(inRangePaid);
  inRangePending = round2(inRangePending);
  inRangeOverdue = round2(inRangeOverdue);
  priorPeriodBilled = round2(priorPeriodBilled);

  const totalBilled = round2(inRangePaid + inRangePending + inRangeOverdue);
  const activeInvoicesCount =
    paidInvoicesCount + pendingInvoicesCount + overdueInvoicesCount;

  const collectionRate =
    totalBilled > 0 ? Math.round((inRangePaid / totalBilled) * 100) : 0;
  const averageInvoiceValue =
    activeInvoicesCount > 0 ? round2(totalBilled / activeInvoicesCount) : 0;
  const averageDaysToPay =
    paidWithDaysCount > 0 ? Math.round(totalDaysToPay / paidWithDaysCount) : 0;

  const growthPercent =
    priorPeriodBilled > 0
      ? Math.round(
          ((totalBilled - priorPeriodBilled) / priorPeriodBilled) * 100,
        )
      : 0;

  // 6. Active MRR from recurring templates
  const activeMrr = await computeActiveMrr(userId);

  // 7. AR Aging buckets
  const agingBuckets = computeAgingBuckets(unpaidForAging);

  // 8. Client rankings
  const clientRankings: ClientAnalyticsItem[] = Array.from(clientMap.values())
    .map((c) => {
      const cTotal = round2(c.totalBilled);
      return {
        clientId: c.clientId,
        clientName: c.clientName,
        company: c.company,
        email: c.email,
        image: c.image,
        totalBilled: cTotal,
        paidAmount: round2(c.paidAmount),
        outstandingAmount: round2(c.outstandingAmount),
        overdueAmount: round2(c.overdueAmount),
        invoiceCount: c.invoiceCount,
        paidInvoiceCount: c.paidInvoiceCount,
        averageDaysToPay:
          c.paidInvoiceCount > 0
            ? Math.round(c.daysToPayTotal / c.paidInvoiceCount)
            : null,
        revenueSharePercent:
          totalBilled > 0 ? Math.round((cTotal / totalBilled) * 100) : 0,
      };
    })
    .sort((a, b) => b.totalBilled - a.totalBilled);

  const summary: AnalyticsSummary = {
    totalBilled,
    collectedRevenue: inRangePaid,
    pendingRevenue: inRangePending,
    overdueRevenue: inRangeOverdue,
    collectionRate,
    averageInvoiceValue,
    averageDaysToPay,
    activeMrr,
    totalInvoices: activeInvoicesCount + draftInvoicesCount,
    paidInvoices: paidInvoicesCount,
    pendingInvoices: pendingInvoicesCount,
    overdueInvoices: overdueInvoicesCount,
    draftInvoices: draftInvoicesCount,
    previousPeriodBilled: priorPeriodBilled,
    growthPercent,
  };

  return {
    range,
    currency,
    availableYears,
    summary,
    monthlySeries,
    clientRankings,
    agingBuckets,
  };
}
