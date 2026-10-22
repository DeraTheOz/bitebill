import { getSessionUser } from "@/features/auth/lib/session";
import { clientFormSchema } from "@/features/clients/schemas/client-schema";
import {
  deleteClient,
  getClient,
  updateClient,
} from "@/features/clients/services/clients";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: RouteContext) {
  const user = await getSessionUser();

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  try {
    const client = await getClient(user.id, id);

    if (!client) {
      return Response.json({ error: "Client not found" }, { status: 404 });
    }

    return Response.json({ client });
  } catch (error) {
    console.error("Failed to load client:", error);
    return Response.json({ error: "Failed to load client" }, { status: 500 });
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

  const parsed = clientFormSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ error: "Invalid client data" }, { status: 400 });
  }

  try {
    const client = await updateClient(user.id, id, parsed.data);

    if (!client) {
      return Response.json({ error: "Client not found" }, { status: 404 });
    }

    return Response.json({ client });
  } catch (error) {
    console.error("Failed to update client:", error);
    return Response.json(
      { error: "Failed to update client" },
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
    const deleted = await deleteClient(user.id, id);

    if (!deleted) {
      return Response.json({ error: "Client not found" }, { status: 404 });
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to delete client:", error);
    return Response.json(
      { error: "Failed to delete client" },
      { status: 500 },
    );
  }
}
