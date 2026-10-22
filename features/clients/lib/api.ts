import type { Client, ClientListPagination } from "../types/client";
import type { ClientFormValues } from "../schemas/client-schema";

export type ClientListRequest = {
  page: number;
  pageSize?: number;
  q?: string;
};

export type ClientListResult = {
  clients: Client[];
  pagination: ClientListPagination;
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

export const clientsApi = {
  list: async ({ page, pageSize = 10, q }: ClientListRequest) => {
    const search = new URLSearchParams({
      page: String(page),
      pageSize: String(pageSize),
    });
    if (q) search.set("q", q);

    return request<ClientListResult>(`/api/clients?${search.toString()}`);
  },

  get: async (id: string) => {
    const { client } = await request<{ client: Client }>(`/api/clients/${id}`);
    return client;
  },

  create: async (values: ClientFormValues) => {
    const { client } = await request<{ client: Client }>("/api/clients", {
      method: "POST",
      body: JSON.stringify(values),
    });
    return client;
  },

  update: async (id: string, values: ClientFormValues) => {
    const { client } = await request<{ client: Client }>(`/api/clients/${id}`, {
      method: "PUT",
      body: JSON.stringify(values),
    });
    return client;
  },

  remove: async (id: string) => {
    await request<{ success: boolean }>(`/api/clients/${id}`, {
      method: "DELETE",
    });
  },
};
