import type { AnalyticsData } from "../types/analytics";

/**
 * Escapes a string cell value according to RFC-4180 CSV specifications.
 *
 * @param value - Raw cell value to escape.
 * @returns Safely quoted CSV cell representation.
 */
function escapeCell(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return '""';
  const str = String(value);
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return `"${str}"`;
}

/**
 * Builds an RFC-4180 formatted CSV string from the analytics dataset.
 *
 * @param data - Populated analytics dataset.
 * @returns Fully formatted CSV document string.
 */
export function buildAnalyticsCsv(data: AnalyticsData): string {
  const lines: string[] = [];

  // Section 1: Report Metadata & Summary KPIs
  lines.push("BiteBill Analytics Report");
  lines.push(`Timeframe,${escapeCell(data.range)},Currency,${escapeCell(data.currency)}`);
  lines.push(`Exported At,${escapeCell(new Date().toISOString())}`);
  lines.push("");

  lines.push("--- SUMMARY KPIS ---");
  lines.push("Metric,Value");
  lines.push(`Total Billed,${data.summary.totalBilled}`);
  lines.push(`Collected Revenue,${data.summary.collectedRevenue}`);
  lines.push(`Pending Revenue,${data.summary.pendingRevenue}`);
  lines.push(`Overdue Revenue,${data.summary.overdueRevenue}`);
  lines.push(`Collection Rate (%),${data.summary.collectionRate}%`);
  lines.push(`Average Invoice Value,${data.summary.averageInvoiceValue}`);
  lines.push(`Average Days to Pay,${data.summary.averageDaysToPay} days`);
  lines.push(`Active Normalized MRR,${data.summary.activeMrr}`);
  lines.push(`Total Invoices,${data.summary.totalInvoices}`);
  lines.push(`Paid Invoices,${data.summary.paidInvoices}`);
  lines.push(`Pending Invoices,${data.summary.pendingInvoices}`);
  lines.push(`Overdue Invoices,${data.summary.overdueInvoices}`);
  lines.push(`Draft Invoices,${data.summary.draftInvoices}`);
  lines.push(`Period Growth vs Prior (%),${data.summary.growthPercent}%`);
  lines.push("");

  // Section 2: Monthly Trends
  lines.push("--- MONTHLY REVENUE & INVOICE VOLUME ---");
  lines.push("Month,Year,YearMonth,Paid,Pending,Overdue,Total,Invoices");
  for (const row of data.monthlySeries) {
    lines.push(
      [
        escapeCell(row.month),
        row.year,
        escapeCell(row.yearMonth),
        row.paid,
        row.pending,
        row.overdue,
        row.total,
        row.invoiceCount,
      ].join(","),
    );
  }
  lines.push("");

  // Section 3: Client Breakdown
  lines.push("--- CLIENT BREAKDOWN ---");
  lines.push(
    "Client Name,Company,Total Billed,Paid Amount,Outstanding,Overdue,Invoices,Paid Invoices,Avg Days to Pay,Revenue Share (%)",
  );
  for (const client of data.clientRankings) {
    lines.push(
      [
        escapeCell(client.clientName),
        escapeCell(client.company ?? ""),
        client.totalBilled,
        client.paidAmount,
        client.outstandingAmount,
        client.overdueAmount,
        client.invoiceCount,
        client.paidInvoiceCount,
        client.averageDaysToPay !== null ? client.averageDaysToPay : "N/A",
        `${client.revenueSharePercent}%`,
      ].join(","),
    );
  }
  lines.push("");

  // Section 4: AR Aging Breakdown
  lines.push("--- ACCOUNTS RECEIVABLE AGING ---");
  lines.push("Aging Bucket,Amount,Invoice Count,Share of Unpaid (%)");
  for (const bucket of data.agingBuckets) {
    lines.push(
      [
        escapeCell(bucket.label),
        bucket.amount,
        bucket.count,
        `${bucket.percentage}%`,
      ].join(","),
    );
  }

  return lines.join("\r\n");
}

/**
 * Triggers a client-side download of the analytics CSV report.
 *
 * @param data - Analytics data payload to export.
 */
export function exportAnalyticsToCsv(data: AnalyticsData): void {
  const csvContent = buildAnalyticsCsv(data);
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");

  const safeRange = data.range.replace(/[^a-zA-Z0-9_-]/g, "_");
  const timestamp = new Date().toISOString().slice(0, 10);
  link.href = url;
  link.download = `bitebill-analytics-${safeRange}-${timestamp}.csv`;

  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

