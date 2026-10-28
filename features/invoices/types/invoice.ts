import type { ClientAddress } from "@/features/clients/types/client";

export type StoredInvoiceStatus = "draft" | "pending" | "paid";

// `overdue` exists only at the edges. The database stores the three
// above and the API computes overdue from dueDate/status.
export type InvoiceStatus = StoredInvoiceStatus | "overdue";

export type InvoiceStatusFilter = "all" | InvoiceStatus;

export type InvoiceItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  position: number;
};

export type InvoiceEventType =
  "created" | "updated" | "sent" | "paid" | "deleted" | "shared" | "downloaded";

export type InvoiceEvent = {
  id: string;
  eventType: InvoiceEventType;
  description: string;
  createdAt: string;
};

export type InvoiceClient = {
  id: string;
  name: string;
  email: string | null;
  company: string | null;
  address: ClientAddress;
};

export type InvoiceListItem = {
  id: string;
  invoiceNumber: string;
  clientName: string | null;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  currency: string;
  total: number;
};

export type Invoice = {
  id: string;
  invoiceNumber: string;
  status: InvoiceStatus;
  issueDate: string;
  dueDate: string;
  currency: string;
  subtotal: number;
  taxRate: number;
  tax: number;
  discount: number;
  total: number;
  publicNotes: string | null;
  paidAt: string | null;
  createdAt: string;
  updatedAt: string;
  client: InvoiceClient | null;
  items: InvoiceItem[];
  events: InvoiceEvent[];
};

export type InvoiceListPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type InvoiceSummary = {
  counts: {
    all: number;
    draft: number;
    pending: number;
    paid: number;
    overdue: number;
  };
  billed: number;
  paidTotal: number;
  outstanding: number;
};
