import type { AnalyticsData } from "../types/analytics";

/**
 * Client HTTP error thrown when an analytics API request fails.
 */
export class ApiError extends Error {
  /**
   * Initializes a new ApiError instance.
   *
   * @param message - Human-readable error message.
   * @param status - HTTP response status code.
   */
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Sends a JSON request to the analytics API and unwraps parsed error payloads.
 *
 * @template T - Expected JSON response shape.
 * @param path - URL or path to request.
 * @param init - Optional RequestInit configuration.
 * @returns Parsed JSON body.
 * @throws {ApiError} When response status is not 2xx.
 */
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

/**
 * Typed client API wrapper for the `/api/analytics` endpoint.
 */
export const analyticsApi = {
  /**
   * Fetches the analytics dataset for the specified timeframe range.
   *
   * @param range - Timeframe range identifier or 4-digit calendar year.
   * @returns Complete analytics dataset.
   */
  get: (range = "6m"): Promise<AnalyticsData> =>
    request<AnalyticsData>(`/api/analytics?range=${encodeURIComponent(range)}`),
};

