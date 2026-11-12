import type {
  InvoiceClient,
  InvoiceListItem,
} from "@/features/invoices/types/invoice";

export type RecurringFrequency = "monthly" | "quarterly" | "yearly";

export type RecurringStatusFilter = "active" | "paused";

export type RecurringTemplateItem = {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
  position: number;
};

export type RecurringTemplateListItem = {
  id: string;
  title: string;
  frequency: RecurringFrequency;
  startDate: string;
  nextRunDate: string;
  lastRunAt: string | null;
  runCount: number;
  active: boolean;
  autoSend: boolean;
  clientName: string | null;
  clientDeleted: boolean;
  currency: string;
  total: number;
};

export type RecurringTemplate = {
  id: string;
  title: string;
  frequency: RecurringFrequency;
  startDate: string;
  nextRunDate: string;
  lastRunAt: string | null;
  runCount: number;
  paymentTermsDays: number;
  taxRate: number;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  publicNotes: string | null;
  internalNotes: string | null;
  autoSend: boolean;
  active: boolean;
  createdAt: string;
  updatedAt: string;
  client: (InvoiceClient & { isDeleted: boolean }) | null;
  items: RecurringTemplateItem[];
  generatedInvoices: InvoiceListItem[];
};

export type RecurringListPagination = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export type ProcessDueResult = {
  processed: number;
  generated: number;
  paused: number;
  failed: number;
};

