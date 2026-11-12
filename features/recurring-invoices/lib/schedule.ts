import { addDays, addMonths, addQuarters, addYears, format } from "date-fns";
import type { RecurringFrequency } from "../types/recurring";

/** Parses a `YYYY-MM-DD` string into a UTC midnight `Date`. */
function parseUtcDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day));
}

/** Formats a UTC `Date` back into a `YYYY-MM-DD` calendar string. */
function formatUtcDate(date: Date): string {
  const local = new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
  );
  return format(local, "yyyy-MM-dd");
}

/** Computes a billing cycle date by adding `cycleIndex` frequency intervals to `startDate`. */
function advanceFromStart(
  startDate: string,
  frequency: RecurringFrequency,
  cycleIndex: number,
): string {
  const [year, month, day] = startDate.split("-").map(Number);
  const base = new Date(year, month - 1, day);

  if (frequency === "monthly") {
    return format(addMonths(base, cycleIndex), "yyyy-MM-dd");
  }
  if (frequency === "quarterly") {
    return format(addQuarters(base, cycleIndex), "yyyy-MM-dd");
  }
  return format(addYears(base, cycleIndex), "yyyy-MM-dd");
}

/**
 * Computes the next scheduled run date anchored to `startDate` and `cycleIndex`
 * so end-of-month dates (e.g. Jan 31 -> Feb 28 -> Mar 31) do not permanently drift.
 */
export function computeNextRunDate(
  startDate: string,
  frequency: RecurringFrequency,
  nextCycleIndex: number,
): string {
  return advanceFromStart(startDate, frequency, Math.max(0, nextCycleIndex));
}

/**
 * Determines the first `nextRunDate` when creating or resuming a template.
 * If `startDate` is today or in the future, it runs on `startDate`.
 * If `startDate` is in the past, schedules for `today` (initial) or advances
 * to the next future cycle from `startDate` (resume).
 */
export function resolveUpcomingRunDate(
  startDate: string,
  frequency: RecurringFrequency,
  today: string,
  mode: "create" | "resume",
): string {
  if (startDate >= today) return startDate;
  if (mode === "create") return today;

  let cycle = 1;
  let candidate = advanceFromStart(startDate, frequency, cycle);
  while (candidate < today && cycle < 1200) {
    cycle += 1;
    candidate = advanceFromStart(startDate, frequency, cycle);
  }
  return candidate;
}

/** Adds `paymentTermsDays` calendar days to `issueDate` and returns a `YYYY-MM-DD` due date. */
export function computeDueDate(
  issueDate: string,
  paymentTermsDays: number,
): string {
  const [year, month, day] = issueDate.split("-").map(Number);
  const base = new Date(year, month - 1, day);
  return format(addDays(base, paymentTermsDays), "yyyy-MM-dd");
}

/** Returns `true` when `isoDate` represents an exact valid calendar date in `YYYY-MM-DD` format. */
export function isDateValid(isoDate: string): boolean {
  const parsed = parseUtcDate(isoDate);
  return !Number.isNaN(parsed.getTime()) && formatUtcDate(parsed) === isoDate;
}
