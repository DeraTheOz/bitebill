/** Generic message used when an error cannot be classified. */
const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

/**
 * Minimal shape of the error values surfaced by the auth SDK and its proxy.
 * All fields are optional because the source varies (a thrown `AuthApiError`
 * versus an action/proxy `{ error }` object).
 */
type ErrorLike = { message?: unknown; code?: unknown; status?: unknown };

/**
 * Maps an unknown auth error to a user-facing message.
 *
 * Detects rate-limiting, expired and invalid OTP errors by error code, HTTP
 * status and message text. Falls back to the raw message when an HTTP status is
 * present, otherwise to a generic message.
 *
 * @param error - The thrown error or `{ error }` value from an auth call.
 * @returns A message safe to display in the UI.
 */
export function mapOtpError(error: unknown): string {
  const record: ErrorLike | null =
    typeof error === "object" && error !== null ? error : null;

  const message = typeof record?.message === "string" ? record.message : "";
  const code = typeof record?.code === "string" ? record.code : "";
  const status = typeof record?.status === "number" ? record.status : null;

  if (
    code === "TOO_MANY_ATTEMPTS" ||
    status === 429 ||
    /too many (attempts|requests)/i.test(message)
  ) {
    return "Too many attempts. Please wait a few minutes and try again.";
  }

  if (code === "OTP_EXPIRED" || /\bexpired\b/i.test(message)) {
    return "The code has expired. Request a new one.";
  }

  if (code === "INVALID_OTP" || /invalid otp/i.test(message)) {
    return "The code is invalid. Check your email and try again.";
  }

  if (status === null) return FALLBACK_MESSAGE;

  return message || FALLBACK_MESSAGE;
}
