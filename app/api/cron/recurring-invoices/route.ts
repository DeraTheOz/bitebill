import { timingSafeEqual } from "node:crypto";
import { processDueRecurringTemplates } from "@/features/recurring-invoices/services/recurring";

/** Verifies the incoming cron request Bearer token using constant-time comparison. */
function isAuthorizedCronRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return false;

  const provided = Buffer.from(header.slice("Bearer ".length));
  const expected = Buffer.from(secret);

  if (provided.length !== expected.length) return false;
  return timingSafeEqual(provided, expected);
}

/** Authorizes and runs scheduled recurring invoice generation across all users. */
async function handleCron(request: Request) {
  if (!process.env.CRON_SECRET) {
    return Response.json(
      { error: "CRON_SECRET is not configured" },
      { status: 500 },
    );
  }

  if (!isAuthorizedCronRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processDueRecurringTemplates();
    return Response.json(result);
  } catch (error) {
    console.error("Recurring invoice cron failed:", error);
    return Response.json(
      { error: "Failed to process due recurring invoices" },
      { status: 500 },
    );
  }
}

/** Triggers due recurring invoice processing for HTTP GET cron callers. */
export async function GET(request: Request) {
  return handleCron(request);
}

/** Triggers due recurring invoice processing for HTTP POST cron callers. */
export async function POST(request: Request) {
  return handleCron(request);
}

