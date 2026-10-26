import { getSessionUser } from "@/features/auth/lib/session";
import { updateInvoiceInputSchema } from "@/features/invoices/schemas/invoice-schema";
import {
  deleteInvoice,
  getInvoice,
  updateInvoice,
} from "@/features/invoices/services/invoices";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const invoice = await getInvoice(user.id, id);
    if (!invoice) {
      return Response.json({ error: "Invoice not found" }, { status: 404 });
    }
    return Response.json({ invoice });
  } catch (error) {
    console.error("Failed to load invoice:", error);
    return Response.json({ error: "Failed to load invoice" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: RouteContext) {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateInvoiceInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid invoice data" }, { status: 400 });
  }

  const { status, ...values } = parsed.data;

  try {
    const invoice = await updateInvoice(user.id, id, { status, values });
    if (!invoice) {
      return Response.json({ error: "Invoice not found" }, { status: 404 });
    }
    return Response.json({ invoice });
  } catch (error) {
    console.error("Failed to update invoice:", error);
    return Response.json(
      { error: "Failed to update invoice" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const deleted = await deleteInvoice(user.id, id);
    if (!deleted) {
      return Response.json({ error: "Invoice not found" }, { status: 404 });
    }
    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete invoice:", error);
    return Response.json(
      { error: "Failed to delete invoice" },
      { status: 500 },
    );
  }
}
