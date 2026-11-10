import { ApiError } from "@/features/invoices/lib/api";
import { downloadFileFromEndpoint } from "@/lib/download";
import type { CreateShareInput } from "../schemas/share-schema";
import type { InvoiceShare, PublicSharedInvoice } from "../types/share";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      body?.error ?? "Something went wrong. Please try again.",
      response.status,
    );
  }

  return body as T;
}

export const sharingApi = {
  getForInvoice: async (invoiceId: string) => {
    const { share } = await request<{ share: InvoiceShare | null }>(
      `/api/invoices/${invoiceId}/share`,
    );
    return share;
  },

  createOrRegenerate: async (
    invoiceId: string,
    input: CreateShareInput = {},
  ) => {
    const { share } = await request<{ share: InvoiceShare }>(
      `/api/invoices/${invoiceId}/share`,
      {
        method: "POST",
        body: JSON.stringify(input),
      },
    );
    return share;
  },

  updateExpiration: async (invoiceId: string, expiresAt: string | null) => {
    const { share } = await request<{ share: InvoiceShare }>(
      `/api/invoices/${invoiceId}/share`,
      {
        method: "PATCH",
        body: JSON.stringify({ expiresAt }),
      },
    );
    return share;
  },

  revoke: async (invoiceId: string) => {
    await request<{ success: boolean }>(`/api/invoices/${invoiceId}/share`, {
      method: "DELETE",
    });
  },

  getPublic: async (token: string) => {
    return request<PublicSharedInvoice>(`/api/share/${token}`);
  },

  downloadPublicPdf: async (token: string, invoiceNumber: string) => {
    await downloadFileFromEndpoint(
      `/api/share/${token}/pdf`,
      `${invoiceNumber}.pdf`,
      "Failed to download PDF",
    );
  },
};
