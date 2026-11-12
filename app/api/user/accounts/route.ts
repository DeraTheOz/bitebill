import { getSessionUser } from "@/features/auth/lib/session";
import {
  AccountServiceError,
  getUserAccountsInfo,
} from "@/features/settings/services/account";

/** Lists connected authentication providers and credential password availability for the signed-in user. */
export async function GET() {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const accounts = await getUserAccountsInfo();
    return Response.json(accounts);
  } catch (error) {
    if (error instanceof AccountServiceError) {
      return Response.json({ error: error.message }, { status: error.status });
    }
    console.error("Failed to load user accounts:", error);
    return Response.json(
      { error: "Failed to load connected accounts" },
      { status: 500 },
    );
  }
}

