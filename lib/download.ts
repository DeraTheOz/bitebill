import { ApiError } from "@/features/invoices/lib/api";

/**
 * Fetches a binary file endpoint and triggers a browser file download.
 */
export async function downloadFileFromEndpoint(
  endpoint: string,
  filename: string,
  fallbackError = "Failed to download file",
): Promise<void> {
  const response = await fetch(endpoint);
  if (!response.ok) {
    const errorBody = await response.json().catch(() => null);
    throw new ApiError(errorBody?.error ?? fallbackError, response.status);
  }

  const blob = await response.blob();
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

