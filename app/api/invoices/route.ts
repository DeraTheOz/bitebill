import { z } from "zod";
import { getSessionUser } from "@/features/auth/lib/session";
import { createInvoiceInputSchema } from "@/features/invoices/schemas/invoice-schema";
import {
  createInvoice,
  listInvoices,
} from "@/features/invoices/services/invoices";

const listInvoicesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  status: z.string().trim().optional(),
  clientId: z.uuid().optional(),
  q: z.string().trim().optional(),
});

const statusTokenSchema = z.enum(["draft", "pending", "paid", "overdue"]);

export async function GET(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = listInvoicesQuerySchema.safeParse(query);

  if (!parsed.success) {
    return Response.json({ error: "Invalid query" }, { status: 400 });
  }

  const tokens = parsed.data.status
    ? parsed.data.status.split(",").filter(Boolean)
    : [];
  const status = z.array(statusTokenSchema).safeParse(tokens);

  if (!status.success) {
    return Response.json({ error: "Invalid status filter" }, { status: 400 });
  }

  try {
    const result = await listInvoices(user.id, {
      page: parsed.data.page,
      pageSize: parsed.data.pageSize,
      status: status.data.length ? status.data : undefined,
      clientId: parsed.data.clientId,
      q: parsed.data.q,
    });
    return Response.json(result);
  } catch (error) {
    console.error("Failed to list invoices:", error);
    return Response.json({ error: "Failed to load invoices" }, { status: 500 });
  }
}

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

  const parsed = createInvoiceInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid invoice data" }, { status: 400 });
  }

  const { status, ...values } = parsed.data;

  try {
    const invoice = await createInvoice(user.id, { status, values });
    return Response.json({ invoice }, { status: 201 });
  } catch (error) {
    console.error("Failed to create invoice:", error);
    return Response.json(
      { error: "Failed to create invoice" },
      { status: 500 },
    );
  }
}
