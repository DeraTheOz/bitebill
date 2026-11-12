import type { BrandingSettings } from "../types/branding";
import type {
  BrandingPatchValues,
  BrandingSettingsValues,
} from "../schemas/branding-schema";

/** Client HTTP error thrown when a branding API call responds with a non-2xx status. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Sends a JSON request to the branding API and unwraps parsed error payloads. */
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

/** Typed client wrapper around the `/api/branding` endpoints. */
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

  patch: async (values: BrandingPatchValues) => {
    const { settings } = await request<{ settings: BrandingSettings }>(
      "/api/branding",
      { method: "PATCH", body: JSON.stringify(values) },
    );
    return settings;
  },
};
