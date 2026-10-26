/**
 * Formats a numeric amount as currency using the narrow symbol for the
 * given ISO 4217 code (e.g. `$1,000.00` instead of `US$1,000.00`).
 * Invalid or unsupported codes fall back to `"CODE 1000.00"`.
 *
 * @param value - Amount to format.
 * @param currency - ISO 4217 currency code. Defaults to `"GBP"`.
 */
export function formatMoney(value: number, currency = "GBP") {
  try {
    return new Intl.NumberFormat("en-GB", {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

/**
 * Formats a date as a short, human-readable label (e.g. `01 Feb 2026`).
 *
 * Accepts both full ISO timestamps and date-only strings. Values are
 * rendered in UTC so the displayed day never shifts across timezones.
 *
 * @param isoDate - ISO timestamp or `YYYY-MM-DD` date string.
 */
export function formatDate(isoDate: string) {
  const date =
    isoDate.length <= 10 ? new Date(`${isoDate}T00:00:00Z`) : new Date(isoDate);

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Formats an ISO timestamp as a date and 24-hour time in UTC
 * (e.g. `01 Feb 2026, 14:30`).
 *
 * @param isoTimestamp - Full ISO timestamp.
 */
export function formatDateTime(isoTimestamp: string) {
  return new Date(isoTimestamp).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  });
}
