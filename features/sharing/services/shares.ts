import "server-only";

import { randomBytes } from "node:crypto";
import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  brandingSettings,
  clients,
  invoiceEvents,
  invoiceItems,
  invoiceShares,
  invoices,
} from "@/db/schema";
import { toPdfLogoData } from "@/features/branding/lib/logo";
import {
  getBrandingLogo,
  getBrandingSettings,
} from "@/features/branding/services/branding";
import type {
  BrandingLogo,
  PdfTemplate,
  PublicBranding,
} from "@/features/branding/types/branding";
import {
  computeInvoiceStatus,
  toInvoiceItemDto,
} from "@/features/invoices/services/invoices";
import type { Invoice } from "@/features/invoices/types/invoice";
import { generateInvoicePdf } from "@/features/pdf/services/pdf-generator";
import type { CreateShareInput } from "../schemas/share-schema";
import type { InvoiceShare, PublicSharedInvoice } from "../types/share";

type InvoiceShareRow = typeof invoiceShares.$inferSelect;

type PublicResolveOutcome =
  | { outcome: "not-found" }
  | { outcome: "expired" };

export type PublicSharedInvoiceResult =
  | PublicResolveOutcome
  | { outcome: "ok"; data: PublicSharedInvoice };

export type PublicSharedPdfResult =
  | PublicResolveOutcome
  | { outcome: "ok"; invoiceNumber: string; pdfBytes: Uint8Array };

export type PublicSharedLogoResult =
  | PublicResolveOutcome
  | { outcome: "no-logo" }
  | { outcome: "ok"; logo: BrandingLogo };

function generateShareToken(): string {
  return randomBytes(16).toString("base64url");
}

function isShareExpired(expiresAt: Date | null): boolean {
  return expiresAt !== null && expiresAt.getTime() <= Date.now();
}

function toShareDto(row: InvoiceShareRow): InvoiceShare {
  return {
    id: row.id,
    invoiceId: row.invoiceId,
    token: row.token,
    sharePath: `/share/${row.token}`,
    viewCount: row.viewCount,
    lastViewedAt: row.lastViewedAt?.toISOString() ?? null,
    expiresAt: row.expiresAt?.toISOString() ?? null,
    isExpired: isShareExpired(row.expiresAt),
    createdAt: row.createdAt.toISOString(),
  };
}

async function findOwnedInvoice(userId: string, invoiceId: string) {
  const [row] = await db
    .select({
      id: invoices.id,
      invoiceNumber: invoices.invoiceNumber,
    })
    .from(invoices)
    .where(
      and(
        eq(invoices.id, invoiceId),
        eq(invoices.userId, userId),
        isNull(invoices.deletedAt),
      ),
    )
    .limit(1);

  return row ?? null;
}

export async function getInvoiceShare(
  userId: string,
  invoiceId: string,
): Promise<{ share: InvoiceShare | null } | "not-found"> {
  const owned = await findOwnedInvoice(userId, invoiceId);
  if (!owned) return "not-found";

  const [row] = await db
    .select()
    .from(invoiceShares)
    .where(eq(invoiceShares.invoiceId, invoiceId))
    .limit(1);

  return { share: row ? toShareDto(row) : null };
}

export async function createOrRegenerateInvoiceShare(
  userId: string,
  invoiceId: string,
  input: CreateShareInput,
): Promise<{ share: InvoiceShare; created: boolean } | null> {
  const owned = await findOwnedInvoice(userId, invoiceId);
  if (!owned) return null;

  const [existing] = await db
    .select()
    .from(invoiceShares)
    .where(eq(invoiceShares.invoiceId, invoiceId))
    .limit(1);

  // Idempotent create when a link already exists and regenerate wasn't asked.
  if (existing && !input.regenerate) {
    return { share: toShareDto(existing), created: false };
  }

  const token = generateShareToken();
  const expiresAt =
    input.expiresAt !== undefined
      ? input.expiresAt
        ? new Date(input.expiresAt)
        : null
      : existing?.expiresAt ?? null;

  const eventDescription = existing
    ? `Share link regenerated for invoice ${owned.invoiceNumber}`
    : `Invoice ${owned.invoiceNumber} share link created`;

  const [, insertedRows] = await db.batch([
    db.delete(invoiceShares).where(eq(invoiceShares.invoiceId, invoiceId)),
    db
      .insert(invoiceShares)
      .values({
        invoiceId,
        token,
        expiresAt,
      })
      .returning(),
    db.insert(invoiceEvents).values({
      invoiceId,
      userId,
      eventType: "shared",
      description: eventDescription,
    }),
  ]);

  const created = insertedRows[0];
  if (!created) {
    throw new Error("Failed to create share link");
  }

  return { share: toShareDto(created), created: true };
}

export async function updateInvoiceShareExpiration(
  userId: string,
  invoiceId: string,
  expiresAt: string | null,
): Promise<
  | { outcome: "ok"; share: InvoiceShare }
  | { outcome: "invoice-not-found" }
  | { outcome: "share-not-found" }
> {
  const owned = await findOwnedInvoice(userId, invoiceId);
  if (!owned) return { outcome: "invoice-not-found" };

  const [updated] = await db
    .update(invoiceShares)
    .set({
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    })
    .where(eq(invoiceShares.invoiceId, invoiceId))
    .returning();

  if (!updated) return { outcome: "share-not-found" };

  return { outcome: "ok", share: toShareDto(updated) };
}

export async function revokeInvoiceShare(
  userId: string,
  invoiceId: string,
): Promise<"revoked" | "invoice-not-found" | "share-not-found"> {
  const owned = await findOwnedInvoice(userId, invoiceId);
  if (!owned) return "invoice-not-found";

  const [deleted] = await db
    .delete(invoiceShares)
    .where(eq(invoiceShares.invoiceId, invoiceId))
    .returning({ id: invoiceShares.id });

  if (!deleted) return "share-not-found";

  await db.insert(invoiceEvents).values({
    invoiceId,
    userId,
    eventType: "updated",
    description: `Share link disabled for invoice ${owned.invoiceNumber}`,
  });

  return "revoked";
}

async function resolveValidShare(token: string) {
  const [row] = await db
    .select({
      shareId: invoiceShares.id,
      expiresAt: invoiceShares.expiresAt,
      invoice: {
        id: invoices.id,
        userId: invoices.userId,
        invoiceNumber: invoices.invoiceNumber,
        status: invoices.status,
        issueDate: invoices.issueDate,
        dueDate: invoices.dueDate,
        currency: invoices.currency,
        subtotal: invoices.subtotal,
        taxRate: invoices.taxRate,
        tax: invoices.tax,
        discount: invoices.discount,
        total: invoices.total,
        publicNotes: invoices.publicNotes,
        pdfTemplate: invoices.pdfTemplate,
        paidAt: invoices.paidAt,
        createdAt: invoices.createdAt,
        updatedAt: invoices.updatedAt,
      },
      client: {
        id: clients.id,
        name: clients.name,
        email: clients.email,
        company: clients.company,
        addressLine1: clients.addressLine1,
        addressLine2: clients.addressLine2,
        city: clients.city,
        state: clients.state,
        country: clients.country,
      },
      branding: {
        businessName: brandingSettings.businessName,
        businessEmail: brandingSettings.businessEmail,
        businessPhone: brandingSettings.businessPhone,
        website: brandingSettings.website,
        addressLine1: brandingSettings.addressLine1,
        addressLine2: brandingSettings.addressLine2,
        city: brandingSettings.city,
        state: brandingSettings.state,
        country: brandingSettings.country,
        defaultTerms: brandingSettings.defaultTerms,
        brandColor: brandingSettings.brandColor,
        hasLogo: sql<boolean>`(${brandingSettings.logoUrl} is not null)`,
        logoUpdatedAt: brandingSettings.updatedAt,
      },
    })
    .from(invoiceShares)
    .innerJoin(
      invoices,
      and(eq(invoices.id, invoiceShares.invoiceId), isNull(invoices.deletedAt)),
    )
    .leftJoin(clients, eq(clients.id, invoices.clientId))
    .innerJoin(brandingSettings, eq(brandingSettings.userId, invoices.userId))
    .where(eq(invoiceShares.token, token))
    .limit(1);

  if (!row) return { outcome: "not-found" as const };
  if (isShareExpired(row.expiresAt)) return { outcome: "expired" as const };

  return { outcome: "ok" as const, row };
}

export async function getPublicSharedInvoice(
  token: string,
  viewerUserId?: string | null,
): Promise<PublicSharedInvoiceResult> {
  const resolved = await resolveValidShare(token);
  if (resolved.outcome !== "ok") return resolved;

  const { row } = resolved;
  const itemRows = await db
    .select()
    .from(invoiceItems)
    .where(eq(invoiceItems.invoiceId, row.invoice.id))
    .orderBy(invoiceItems.position);

  // Don't inflate client view metrics when the owner previews their own link.
  if (viewerUserId !== row.invoice.userId) {
    await db
      .update(invoiceShares)
      .set({
        viewCount: sql`${invoiceShares.viewCount} + 1`,
        lastViewedAt: new Date(),
      })
      .where(eq(invoiceShares.id, row.shareId));
  }

  const branding: PublicBranding = {
    businessName: row.branding.businessName,
    businessEmail: row.branding.businessEmail,
    businessPhone: row.branding.businessPhone,
    website: row.branding.website,
    addressLine1: row.branding.addressLine1,
    addressLine2: row.branding.addressLine2,
    city: row.branding.city,
    state: row.branding.state,
    country: row.branding.country,
    defaultTerms: row.branding.defaultTerms,
    brandColor: row.branding.brandColor,
    hasLogo: Boolean(row.branding.hasLogo),
    logoUpdatedAt: row.branding.hasLogo
      ? row.branding.logoUpdatedAt.toISOString()
      : null,
  };

  return {
    outcome: "ok",
    data: {
      invoice: {
        invoiceNumber: row.invoice.invoiceNumber,
        status: computeInvoiceStatus(row.invoice.status, row.invoice.dueDate),
        issueDate: row.invoice.issueDate,
        dueDate: row.invoice.dueDate,
        currency: row.invoice.currency,
        subtotal: Number(row.invoice.subtotal),
        taxRate: Number(row.invoice.taxRate),
        tax: Number(row.invoice.tax),
        discount: Number(row.invoice.discount),
        total: Number(row.invoice.total),
        publicNotes: row.invoice.publicNotes,
        paidAt: row.invoice.paidAt?.toISOString() ?? null,
        client: row.client
          ? {
              name: row.client.name,
              email: row.client.email,
              company: row.client.company,
              address: {
                addressLine1: row.client.addressLine1,
                addressLine2: row.client.addressLine2,
                city: row.client.city,
                state: row.client.state,
                country: row.client.country,
              },
            }
          : null,
        items: itemRows.map(toInvoiceItemDto),
      },
      branding,
      share: {
        expiresAt: row.expiresAt?.toISOString() ?? null,
      },
    },
  };
}

export async function getPublicSharedInvoicePdf(
  token: string,
): Promise<PublicSharedPdfResult> {
  const resolved = await resolveValidShare(token);
  if (resolved.outcome !== "ok") return resolved;

  const { row } = resolved;
  const ownerUserId = row.invoice.userId;

  const [itemRows, branding, rawLogo] = await Promise.all([
    db
      .select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, row.invoice.id))
      .orderBy(invoiceItems.position),
    getBrandingSettings(ownerUserId),
    getBrandingLogo(ownerUserId),
  ]);

  if (!branding) return { outcome: "not-found" };

  // Build a sanitized Invoice DTO explicitly excluding internalNotes and events.
  const invoiceForPdf: Invoice = {
    id: row.invoice.id,
    invoiceNumber: row.invoice.invoiceNumber,
    status: computeInvoiceStatus(row.invoice.status, row.invoice.dueDate),
    issueDate: row.invoice.issueDate,
    dueDate: row.invoice.dueDate,
    currency: row.invoice.currency,
    subtotal: Number(row.invoice.subtotal),
    taxRate: Number(row.invoice.taxRate),
    tax: Number(row.invoice.tax),
    discount: Number(row.invoice.discount),
    total: Number(row.invoice.total),
    publicNotes: row.invoice.publicNotes,
    internalNotes: null,
    pdfTemplate: (row.invoice.pdfTemplate as PdfTemplate) ?? "classic",
    paidAt: row.invoice.paidAt?.toISOString() ?? null,
    createdAt: row.invoice.createdAt.toISOString(),
    updatedAt: row.invoice.updatedAt.toISOString(),
    client: row.client
      ? {
          id: row.client.id,
          name: row.client.name,
          email: row.client.email,
          company: row.client.company,
          address: {
            addressLine1: row.client.addressLine1,
            addressLine2: row.client.addressLine2,
            city: row.client.city,
            state: row.client.state,
            country: row.client.country,
          },
        }
      : null,
    items: itemRows.map(toInvoiceItemDto),
    events: [],
  };

  const pdfBytes = await generateInvoicePdf({
    invoice: invoiceForPdf,
    branding,
    logo: toPdfLogoData(rawLogo),
    template: invoiceForPdf.pdfTemplate,
  });

  await db.insert(invoiceEvents).values({
    invoiceId: row.invoice.id,
    userId: ownerUserId,
    eventType: "downloaded",
    description: `Invoice ${row.invoice.invoiceNumber} PDF downloaded via share link`,
  });

  return {
    outcome: "ok",
    invoiceNumber: row.invoice.invoiceNumber,
    pdfBytes,
  };
}

export async function getPublicSharedInvoiceLogo(
  token: string,
): Promise<PublicSharedLogoResult> {
  const resolved = await resolveValidShare(token);
  if (resolved.outcome !== "ok") return resolved;

  const logo = await getBrandingLogo(resolved.row.invoice.userId);
  if (!logo) return { outcome: "no-logo" };

  return { outcome: "ok", logo };
}

