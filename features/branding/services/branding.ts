import "server-only";

import { cache } from "react";
import { eq, sql } from "drizzle-orm";
import { db } from "@/db/client";
import { brandingSettings } from "@/db/schema";
import type {
  BrandingLogo,
  BrandingSettings,
  PdfTemplate,
} from "../types/branding";
import type { BrandingSettingsValues } from "../schemas/branding-schema";

type BrandingSettingsRow = typeof brandingSettings.$inferSelect;

type SettingsRow = Omit<BrandingSettingsRow, "logoUrl"> & {
  hasLogo: boolean;
};

const fields = {
  id: brandingSettings.id,
  userId: brandingSettings.userId,
  businessName: brandingSettings.businessName,
  businessEmail: brandingSettings.businessEmail,
  businessPhone: brandingSettings.businessPhone,
  website: brandingSettings.website,
  addressLine1: brandingSettings.addressLine1,
  addressLine2: brandingSettings.addressLine2,
  city: brandingSettings.city,
  state: brandingSettings.state,
  country: brandingSettings.country,
  currency: brandingSettings.currency,
  invoicePrefix: brandingSettings.invoicePrefix,
  defaultTerms: brandingSettings.defaultTerms,
  defaultPdfTemplate: brandingSettings.defaultPdfTemplate,
  brandColor: brandingSettings.brandColor,
  // Never select logo_url here: it can be megabytes. The image is
  // served separately through /api/branding/logo.
  hasLogo: sql<boolean>`(${brandingSettings.logoUrl} is not null)`.as(
    "has_logo",
  ),
  createdBy: brandingSettings.createdBy,
  updatedBy: brandingSettings.updatedBy,
  createdAt: brandingSettings.createdAt,
  updatedAt: brandingSettings.updatedAt,
};

function toDto(row: SettingsRow): BrandingSettings {
  return {
    id: row.id,
    businessName: row.businessName,
    businessEmail: row.businessEmail,
    businessPhone: row.businessPhone,
    website: row.website,
    addressLine1: row.addressLine1,
    addressLine2: row.addressLine2,
    city: row.city,
    state: row.state,
    country: row.country,
    currency: row.currency,
    invoicePrefix: row.invoicePrefix,
    defaultTerms: row.defaultTerms,
    defaultPdfTemplate: row.defaultPdfTemplate as PdfTemplate,
    brandColor: row.brandColor,
    hasLogo: Boolean(row.hasLogo),
    logoUpdatedAt: row.hasLogo ? row.updatedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function toNull(value: string) {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

/**
 * Light settings read used by the protected layout and invoice pages.
 * Cached per request so a layout + page render never queries twice.
 */
export const getBrandingSettings = cache(
  async (userId: string): Promise<BrandingSettings | null> => {
    const [row] = await db
      .select(fields)
      .from(brandingSettings)
      .where(eq(brandingSettings.userId, userId))
      .limit(1);

    return row ? toDto(row) : null;
  },
);

/** Logo bytes are loaded only for the image route / PDF service. */
export async function getBrandingLogo(
  userId: string,
): Promise<BrandingLogo | null> {
  const [row] = await db
    .select({
      logoUrl: brandingSettings.logoUrl,
      updatedAt: brandingSettings.updatedAt,
    })
    .from(brandingSettings)
    .where(eq(brandingSettings.userId, userId))
    .limit(1);

  if (!row?.logoUrl) return null;

  return {
    dataUrl: row.logoUrl,
    updatedAt: row.updatedAt.toISOString(),
  };
}

export async function saveBrandingSettings(
  userId: string,
  input: BrandingSettingsValues,
): Promise<BrandingSettings> {
  const values = {
    userId,
    businessName: input.businessName.trim(),
    businessEmail: input.businessEmail.trim(),
    businessPhone: toNull(input.businessPhone),
    website: toNull(input.website),
    addressLine1: toNull(input.addressLine1),
    addressLine2: toNull(input.addressLine2),
    city: toNull(input.city),
    state: toNull(input.state),
    country: toNull(input.country),
    currency: input.currency,
    logoUrl: toNull(input.logoUrl),
    invoicePrefix: input.invoicePrefix.toUpperCase(),
    defaultTerms: toNull(input.defaultTerms),
    defaultPdfTemplate: input.pdfTemplate,
    brandColor: input.brandColor,
  };

  const [row] = await db
    .insert(brandingSettings)
    .values({ ...values, createdBy: userId, updatedBy: userId })
    .onConflictDoUpdate({
      target: brandingSettings.userId,
      set: {
        ...values,
        updatedBy: userId,
        updatedAt: new Date(),
      },
    })
    .returning(fields);

  return toDto(row);
}
