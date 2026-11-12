import { getSessionUser } from "@/features/auth/lib/session";
import { processDueRecurringTemplates } from "@/features/recurring-invoices/services/recurring";

/** Processes all active due recurring invoices for the authenticated user. */
export async function POST() {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await processDueRecurringTemplates({ userId: user.id });
    return Response.json(result);
  } catch (error) {
    console.error("Failed to process due recurring invoices:", error);
    return Response.json(
      { error: "Failed to run due recurring invoices" },
      { status: 500 },
    );
  }
}

