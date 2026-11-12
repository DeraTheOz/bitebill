import { z } from "zod";
import { getSessionUser } from "@/features/auth/lib/session";
import { recurringTemplateFormSchema } from "@/features/recurring-invoices/schemas/recurring-schema";
import {
  createRecurringTemplate,
  listRecurringTemplates,
  RecurringServiceError,
} from "@/features/recurring-invoices/services/recurring";

const listQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  status: z.string().trim().optional(),
  frequency: z.string().trim().optional(),
  q: z.string().trim().optional(),
});

const statusTokenSchema = z.enum(["active", "paused"]);
const frequencyTokenSchema = z.enum(["monthly", "quarterly", "yearly"]);

/** Lists paginated recurring invoices with status, frequency, and search filters. */
export async function GET(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = listQuerySchema.safeParse(query);

  if (!parsed.success) {
    return Response.json({ error: "Invalid query" }, { status: 400 });
  }

  const statusTokens = parsed.data.status
    ? parsed.data.status.split(",").filter(Boolean)
    : [];
  const status = z.array(statusTokenSchema).safeParse(statusTokens);
  if (!status.success) {
    return Response.json({ error: "Invalid status filter" }, { status: 400 });
  }

  const freqTokens = parsed.data.frequency
    ? parsed.data.frequency.split(",").filter(Boolean)
    : [];
  const frequency = z.array(frequencyTokenSchema).safeParse(freqTokens);
  if (!frequency.success) {
    return Response.json(
      { error: "Invalid frequency filter" },
      { status: 400 },
    );
  }

  try {
    const result = await listRecurringTemplates(user.id, {
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
      status: status.data.length ? status.data : undefined,
      frequency: frequency.data.length ? frequency.data : undefined,
      q: parsed.data.q,
    });
    return Response.json(result);
  } catch (error) {
    console.error("Failed to list recurring invoices:", error);
    return Response.json(
      { error: "Failed to load recurring invoices" },
      { status: 500 },
    );
  }
}

/** Creates a new recurring invoice schedule owned by the authenticated user. */
export async function POST(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = recurringTemplateFormSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error:
          parsed.error.issues[0]?.message ?? "Invalid recurring invoice data",
      },
      { status: 400 },
    );
  }

  try {
    const template = await createRecurringTemplate(user.id, parsed.data);
    return Response.json({ template }, { status: 201 });
  } catch (error) {
    if (error instanceof RecurringServiceError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to create recurring invoice:", error);
    return Response.json(
      { error: "Failed to create recurring invoice" },
      { status: 500 },
    );
  }
}

