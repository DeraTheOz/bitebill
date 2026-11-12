import { getSessionUser } from "@/features/auth/lib/session";
import {
  generateInvoiceNow,
  RecurringServiceError,
} from "@/features/recurring-invoices/services/recurring";

type RouteContext = { params: Promise<{ id: string }> };

/** Generates an immediate ad-hoc invoice from an owned recurring schedule. */
export async function POST(_request: Request, { params }: RouteContext) {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const invoice = await generateInvoiceNow(user.id, id);
    if (!invoice) {
      return Response.json(
        { error: "Recurring invoice not found" },
        { status: 404 },
      );
    }
    return Response.json({ invoice }, { status: 201 });
  } catch (error) {
    if (error instanceof RecurringServiceError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to generate invoice from template:", error);
    return Response.json(
      { error: "Failed to generate invoice" },
      { status: 500 },
    );
  }
}

