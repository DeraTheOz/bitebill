import type { PublicBranding } from "@/features/branding/types/branding";
import type { ClientAddress } from "@/features/clients/types/client";
import type {
  InvoiceItem,
  InvoiceStatus,
} from "@/features/invoices/types/invoice";

export type InvoiceShare = {
  id: string;
  invoiceId: string;
  token: string;
  sharePath: string;
  viewCount: number;
  lastViewedAt: string | null;
  expiresAt: string | null;
  isExpired: boolean;
  createdAt: string;
};

export type PublicSharedClient = {
  name: string;
  email: string | null;
  company: string | null;
  address: ClientAddress;
};

export type PublicSharedInvoice = {
  invoice: {
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
    client: PublicSharedClient | null;
    items: InvoiceItem[];
  };
  branding: PublicBranding;
  share: {
    expiresAt: string | null;
  };
};

