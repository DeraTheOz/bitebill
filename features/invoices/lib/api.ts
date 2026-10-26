import type {
  Invoice,
  InvoiceListItem,
  InvoiceListPagination,
  InvoiceStatus,
  InvoiceSummary,
} from "../types/invoice";
import type {
  InvoiceFormValues,
  InvoiceStatusIntent,
} from "../schemas/invoice-schema";

export type InvoiceListRequest = {
  page: number;
  pageSize?: number;
  status?: InvoiceStatus[];
  clientId?: string;
  q?: string;
};

export type InvoiceListResult = {
  invoices: InvoiceListItem[];
  pagination: InvoiceListPagination;
  summary?: InvoiceSummary;
};

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

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

export const invoicesApi = {
  list: async ({
    page,
    pageSize = 10,
    status,
    clientId,
    q,
  }: InvoiceListRequest) => {
    const search = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    if (status?.length) search.set("status", status.join(","));
    if (clientId) search.set("clientId", clientId);
    if (q) search.set("q", q);

    return request<InvoiceListResult>(`/api/invoices?${search.toString()}`);
  },

  get: async (id: string) => {
    const { invoice } = await request<{ invoice: Invoice }>(
      `/api/invoices/${id}`,
    );
    return invoice;
  },

  create: async (values: InvoiceFormValues, status: InvoiceStatusIntent) => {
    const { invoice } = await request<{ invoice: Invoice }>("/api/invoices", {
      method: "POST",
      body: JSON.stringify({ ...values, status }),
    });
    return invoice;
  },

  update: async (
    id: string,
    values: InvoiceFormValues,
    status?: InvoiceStatusIntent,
  ) => {
    const { invoice } = await request<{ invoice: Invoice }>(
      `/api/invoices/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(status ? { ...values, status } : values),
      },
    );
    return invoice;
  },

  remove: async (id: string) => {
    await request<{ success: boolean }>(`/api/invoices/${id}`, {
      method: "DELETE",
    });
  },

  markPaid: async (id: string) => {
    const { invoice } = await request<{ invoice: Invoice }>(
      `/api/invoices/${id}/mark-paid`,
      { method: "POST" },
    );
    return invoice;
  },
};
