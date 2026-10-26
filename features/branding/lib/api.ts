import type { BrandingSettings } from "../types/branding";
import type { BrandingSettingsValues } from "../schemas/branding-schema";

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

export const brandingApi = {
  get: async () => {
    const { settings } = await request<{
      settings: BrandingSettings | null;
    }>("/api/branding");
    return settings;
  },

  save: async (values: BrandingSettingsValues) => {
    const { settings } = await request<{ settings: BrandingSettings }>(
      "/api/branding",
      { method: "PUT", body: JSON.stringify(values) },
    );
    return settings;
  },
};
