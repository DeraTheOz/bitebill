export type ClientInvoiceStatus = "paid" | "pending" | "overdue" | "draft";

export type ClientInvoice = {
  id: string;
  clientId: string;
  description: string;
  amount: number;
  status: ClientInvoiceStatus;
  issuedAt: string;
  dueAt: string;
};

export type InvoiceStatusFilter = "all" | "paid" | "pending" | "overdue";
