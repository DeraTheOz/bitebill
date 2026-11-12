import type { DashboardData } from "../types/dashboard";

/** Client HTTP error thrown when a dashboard API request fails. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Sends a JSON request to the dashboard API and unwraps parsed error payloads. */
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

/** Typed client wrapper around the `/api/dashboard` endpoint. */
export const dashboardApi = {
  get: (period = "6m") =>
    request<DashboardData>(`/api/dashboard?period=${encodeURIComponent(period)}`),
};

