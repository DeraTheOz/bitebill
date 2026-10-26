import { z } from "zod";
import { getSessionUser } from "@/features/auth/lib/session";
import { clientFormSchema } from "@/features/clients/schemas/client-schema";
import { createClient, listClients } from "@/features/clients/services/clients";

const listClientsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(50).default(10),
  q: z.string().trim().max(100).optional(),
  activity: z.enum(["with", "without"]).optional(),
});

export async function GET(request: Request) {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const query = Object.fromEntries(new URL(request.url).searchParams);
  const parsed = listClientsQuerySchema.safeParse(query);

  if (!parsed.success) {
    return Response.json({ error: "Invalid pagination" }, { status: 400 });
  }

  try {
    const result = await listClients(user.id, parsed.data);
    return Response.json(result);
  } catch (error) {
    console.error("Failed to list clients:", error);
    return Response.json({ error: "Failed to load clients" }, { status: 500 });
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

  const parsed = clientFormSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid client data" }, { status: 400 });
  }

  try {
    const client = await createClient(user.id, parsed.data);
    return Response.json({ client }, { status: 201 });
  } catch (error) {
    console.error("Failed to create client:", error);
    return Response.json(
      { error: "Failed to create client" },
      { status: 500 },
    );
  }
}
