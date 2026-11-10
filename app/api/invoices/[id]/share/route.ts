import { z } from "zod";
import { getSessionUser } from "@/features/auth/lib/session";
import {
  createShareInputSchema,
  updateShareInputSchema,
} from "@/features/sharing/schemas/share-schema";
import {
  createOrRegenerateInvoiceShare,
  getInvoiceShare,
  revokeInvoiceShare,
  updateInvoiceShareExpiration,
} from "@/features/sharing/services/shares";

type RouteContext = { params: Promise<{ id: string }> };

async function resolveOwnerAndInvoiceId(params: RouteContext["params"]) {
  const user = await getSessionUser();
  if (!user) {
    return {
      error: Response.json({ error: "Unauthorized" }, { status: 401 }),
    };
  }

  const { id } = await params;
  if (!z.uuid().safeParse(id).success) {
    return {
      error: Response.json({ error: "Invoice not found" }, { status: 404 }),
    };
  }

  return { userId: user.id, invoiceId: id };
}

export async function GET(_request: Request, { params }: RouteContext) {
  const ctx = await resolveOwnerAndInvoiceId(params);
  if ("error" in ctx) return ctx.error;

  try {
    const result = await getInvoiceShare(ctx.userId, ctx.invoiceId);
    if (result === "not-found") {
      return Response.json({ error: "Invoice not found" }, { status: 404 });
    }

    return Response.json(result);
  } catch (error) {
    console.error("Failed to load invoice share:", error);
    return Response.json(
      { error: "Failed to load invoice share" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request, { params }: RouteContext) {
  const ctx = await resolveOwnerAndInvoiceId(params);
  if ("error" in ctx) return ctx.error;

  let body: unknown = {};
  const text = await request.text();
  if (text.trim()) {
    try {
      body = JSON.parse(text);
    } catch {
      return Response.json({ error: "Invalid JSON body" }, { status: 400 });
    }
  }

  const parsed = createShareInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid share options" },
      { status: 400 },
    );
  }

  try {
    const result = await createOrRegenerateInvoiceShare(
      ctx.userId,
      ctx.invoiceId,
      parsed.data,
    );
    if (!result) {
      return Response.json({ error: "Invoice not found" }, { status: 404 });
    }

    return Response.json(
      { share: result.share },
      { status: result.created ? 201 : 200 },
    );
  } catch (error) {
    console.error("Failed to create invoice share:", error);
    return Response.json(
      { error: "Failed to create share link" },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const ctx = await resolveOwnerAndInvoiceId(params);
  if ("error" in ctx) return ctx.error;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const parsed = updateShareInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid expiration date" },
      { status: 400 },
    );
  }

  try {
    const result = await updateInvoiceShareExpiration(
      ctx.userId,
      ctx.invoiceId,
      parsed.data.expiresAt,
    );

    if (result.outcome === "invoice-not-found") {
      return Response.json({ error: "Invoice not found" }, { status: 404 });
    }
    if (result.outcome === "share-not-found") {
      return Response.json(
        { error: "Share link not found for this invoice" },
        { status: 404 },
      );
    }

    return Response.json({ share: result.share });
  } catch (error) {
    console.error("Failed to update invoice share:", error);
    return Response.json(
      { error: "Failed to update share link" },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, { params }: RouteContext) {
  const ctx = await resolveOwnerAndInvoiceId(params);
  if ("error" in ctx) return ctx.error;

  try {
    const outcome = await revokeInvoiceShare(ctx.userId, ctx.invoiceId);

    if (outcome === "invoice-not-found") {
      return Response.json({ error: "Invoice not found" }, { status: 404 });
    }
    if (outcome === "share-not-found") {
      return Response.json(
        { error: "Share link not found for this invoice" },
        { status: 404 },
      );
    }

    return Response.json({ success: true });
  } catch (error) {
    console.error("Failed to revoke invoice share:", error);
    return Response.json(
      { error: "Failed to disable share link" },
      { status: 500 },
    );
  }
}
