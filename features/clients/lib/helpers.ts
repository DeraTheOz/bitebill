import { clientInvoiceData } from "../data/client-invoices";
import { ClientInvoice } from "../types/client-invoice";

export function getClientInvoices(clientId: string): ClientInvoice[] {
  return clientInvoiceData
    .filter((invoice) => invoice.clientId === clientId)
    .sort((a, b) => b.issuedAt.localeCompare(a.issuedAt));
}

export function getInvoiceCounts(clientId: string) {
  const invoices = getClientInvoices(clientId);

  return {
    all: invoices.length,
    paid: invoices.filter((invoice) => invoice.status === "paid").length,
    pending: invoices.filter((invoice) => invoice.status === "pending").length,
    overdue: invoices.filter((invoice) => invoice.status === "overdue").length,
    draft: invoices.filter((invoice) => invoice.status === "draft").length,
  };
}

export function formatMoney(value: number) {
  return `£ ${value.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDate(isoDate: string) {
  // Accepts both full ISO timestamps and date-only strings; rendered in
  // UTC so display never shifts across timezones.
  const date =
    isoDate.length <= 10 ? new Date(`${isoDate}T00:00:00Z`) : new Date(isoDate);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export function shortClientId(clientId: string) {
  return clientId.slice(0, 8);
}
