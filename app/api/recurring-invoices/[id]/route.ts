import { getSessionUser } from "@/features/auth/lib/session";
import { recurringTemplateFormSchema } from "@/features/recurring-invoices/schemas/recurring-schema";
import {
  deleteRecurringTemplate,
  getRecurringTemplate,
  RecurringServiceError,
  updateRecurringTemplate,
} from "@/features/recurring-invoices/services/recurring";

type RouteContext = { params: Promise<{ id: string }> };

/** Fetches an owned recurring invoice schedule with its line items and generated invoices. */
export async function GET(_request: Request, { params }: RouteContext) {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const template = await getRecurringTemplate(user.id, id);
    if (!template) {
      return Response.json(
        { error: "Recurring invoice not found" },
        { status: 404 },
      );
    }
    return Response.json({ template });
  } catch (error) {
    console.error("Failed to load recurring invoice:", error);
    return Response.json(
      { error: "Failed to load recurring invoice" },
      { status: 500 },
    );
  }
}

/** Updates an owned recurring invoice schedule and recalculates its next run date if needed. */
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
    const template = await updateRecurringTemplate(user.id, id, parsed.data);
    if (!template) {
      return Response.json(
        { error: "Recurring invoice not found" },
        { status: 404 },
      );
    }
    return Response.json({ template });
  } catch (error) {
    if (error instanceof RecurringServiceError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to update recurring invoice:", error);
    return Response.json(
      { error: "Failed to update recurring invoice" },
      { status: 500 },
    );
  }
}

/** Deletes an owned recurring invoice schedule while keeping previously generated invoices. */
export async function DELETE(_request: Request, { params }: RouteContext) {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const deleted = await deleteRecurringTemplate(user.id, id);
    if (!deleted) {
      return Response.json(
        { error: "Recurring invoice not found" },
        { status: 404 },
      );
    }
    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete recurring invoice:", error);
    return Response.json(
      { error: "Failed to delete recurring invoice" },
      { status: 500 },
    );
  }
}

