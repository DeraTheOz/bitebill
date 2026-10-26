import { getSessionUser } from "@/features/auth/lib/session";
import { markInvoicePaid } from "@/features/invoices/services/invoices";

type RouteContext = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteContext) {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const result = await markInvoicePaid(user.id, id);

    if (!result) {
      return Response.json({ error: "Invoice not found" }, { status: 404 });
    }

    if (result.outcome === "already-paid") {
      return Response.json(
        { error: "Invoice is already paid" },
        { status: 409 },
      );
    }

    return Response.json({ invoice: result.invoice });
  } catch (error) {
    console.error("Failed to mark invoice paid:", error);
    return Response.json(
      { error: "Failed to mark invoice paid" },
      { status: 500 },
    );
  }
}
