import type { Invoice } from "@/features/invoices/types/invoice";
import type { RecurringTemplateFormValues } from "../schemas/recurring-schema";
import type {
  ProcessDueResult,
  RecurringFrequency,
  RecurringListPagination,
  RecurringStatusFilter,
  RecurringTemplate,
  RecurringTemplateListItem,
} from "../types/recurring";

export type RecurringListRequest = {
  page: number;
  pageSize?: number;
  status?: RecurringStatusFilter[];
  frequency?: RecurringFrequency[];
  q?: string;
};

export type RecurringListResult = {
  templates: RecurringTemplateListItem[];
  pagination: RecurringListPagination;
  dueCount: number;
};

/** Client HTTP error thrown when a recurring invoices API request fails. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Sends a JSON request to the recurring invoices API and unwraps error messages. */
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

/** Typed client wrapper around the `/api/recurring-invoices` endpoints. */
export const recurringApi = {
  list: async ({
    page,
    pageSize = 10,
    status,
    frequency,
    q,
  }: RecurringListRequest) => {
    const search = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    if (status?.length) search.set("status", status.join(","));
    if (frequency?.length) search.set("frequency", frequency.join(","));
    if (q) search.set("q", q);

    return request<RecurringListResult>(
      `/api/recurring-invoices?${search.toString()}`,
    );
  },

  get: async (id: string) => {
    const { template } = await request<{ template: RecurringTemplate }>(
      `/api/recurring-invoices/${id}`,
    );
    return template;
  },

  create: async (values: RecurringTemplateFormValues) => {
    const { template } = await request<{ template: RecurringTemplate }>(
      "/api/recurring-invoices",
      {
        method: "POST",
        body: JSON.stringify(values),
      },
    );
    return template;
  },

  update: async (id: string, values: RecurringTemplateFormValues) => {
    const { template } = await request<{ template: RecurringTemplate }>(
      `/api/recurring-invoices/${id}`,
      {
        method: "PUT",
        body: JSON.stringify(values),
      },
    );
    return template;
  },

  toggle: async (id: string, active: boolean) => {
    const { template } = await request<{ template: RecurringTemplate }>(
      `/api/recurring-invoices/${id}/toggle`,
      {
        method: "POST",
        body: JSON.stringify({ active }),
      },
    );
    return template;
  },

  remove: async (id: string) => {
    await request<{ success: boolean }>(`/api/recurring-invoices/${id}`, {
      method: "DELETE",
    });
  },

  generateNow: async (id: string) => {
    const { invoice } = await request<{ invoice: Invoice }>(
      `/api/recurring-invoices/${id}/generate`,
      { method: "POST" },
    );
    return invoice;
  },

  runDue: async () => {
    return request<ProcessDueResult>("/api/recurring-invoices/run-due", {
      method: "POST",
    });
  },
};

