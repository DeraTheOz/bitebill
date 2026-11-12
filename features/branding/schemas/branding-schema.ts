import z from "zod";

// 2 MB binary → ~2.67M base64 chars
const MAX_LOGO_CHARS = Math.ceil((2 * 1024 * 1024 * 4) / 3) + 100;

export const brandingLogoUrlSchema = z.union([
  z.literal(""),
  z
    .string()
    .regex(
      /^data:image\/(png|jpe?g|webp|svg\+xml);base64,/,
      "Choose a PNG, JPG, SVG, or WebP image",
    )
    .max(MAX_LOGO_CHARS, "Keep the logo under 2 MB"),
]);

export const businessPhoneSchema = z.union([
  z.literal(""),
  z
    .string()
    .trim()
    .regex(
      /^\+?[0-9\s\-()]+$/,
      "Phone number must contain only numbers and a valid country code",
    )
    .refine(
      (val) => {
        const digits = val.replace(/\D/g, "");
        return digits.length >= 7 && digits.length <= 15;
      },
      { message: "Phone number must be between 7 and 15 digits" },
    ),
]);

export const businessFieldsSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, "Business name must be at least 2 characters")
    .max(120, "Keep business name under 120 characters")
    .refine(
      (val) => /[\p{L}\p{N}]/u.test(val),
      "Business name must include letters or numbers",
    ),
  businessEmail: z.email("Enter a valid email"),
  businessPhone: businessPhoneSchema,
  website: z.union([
    z.literal(""),
    z.url("Enter a valid URL, e.g. https://yoursite.com"),
  ]),
});

export const addressFieldsSchema = z.object({
  addressLine1: z.string().trim().min(3, "Street address is required"),
  addressLine2: z.string().trim(),
  city: z
    .string()
    .trim()
    .min(2, "City is required")
    .max(100, "Keep city under 100 characters")
    .refine((val) => /\p{L}/u.test(val), "Enter a valid city name"),
  state: z
    .string()
    .trim()
    .min(2, "State or region is required")
    .max(100, "Keep state or region under 100 characters")
    .refine((val) => /\p{L}/u.test(val), "Enter a valid state or region"),
  country: z.string().trim().min(1, "Select a country"),
});

export const brandingFieldsSchema = z.object({
  logoUrl: brandingLogoUrlSchema,
  brandColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Enter a valid hex color code (e.g. #7C5DFA)"),
  currency: z.string().regex(/^[A-Z]{3}$/, "Choose a 3-letter currency code"),
  invoicePrefix: z
    .string()
    .regex(/^[A-Za-z0-9]{1,6}$/, "Use 1–6 letters or numbers"),
  pdfTemplate: z.enum(["classic", "modern", "corporate"]),
  defaultTerms: z.string().max(500, "Keep terms under 500 characters"),
});

/**
 * Canonical payload for onboarding and full branding replacement.
 * The form uses the same field names, so client and server validation cannot drift.
 */
export const brandingSettingsSchema = z.object({
  ...businessFieldsSchema.shape,
  ...addressFieldsSchema.shape,
  ...brandingFieldsSchema.shape,
});

/**
 * Partial update payload for settings forms. Omitting `logoUrl` preserves the
 * existing stored logo instead of clearing it.
 */
export const brandingPatchSchema = brandingSettingsSchema
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: "Provide at least one setting to update",
  });

export const businessIdentitySettingsSchema = z.object({
  ...businessFieldsSchema.shape,
  ...addressFieldsSchema.shape,
  brandColor: brandingFieldsSchema.shape.brandColor,
  logoUrl: brandingLogoUrlSchema.optional(),
});

export const pdfDefaultsSettingsSchema = z.object({
  currency: brandingFieldsSchema.shape.currency,
  invoicePrefix: brandingFieldsSchema.shape.invoicePrefix,
  pdfTemplate: brandingFieldsSchema.shape.pdfTemplate,
  defaultTerms: brandingFieldsSchema.shape.defaultTerms,
});

export type BrandingSettingsValues = z.infer<typeof brandingSettingsSchema>;
export type BrandingPatchValues = z.infer<typeof brandingPatchSchema>;
export type BusinessIdentitySettingsValues = z.infer<
  typeof businessIdentitySettingsSchema
>;
export type PdfDefaultsSettingsValues = z.infer<
  typeof pdfDefaultsSettingsSchema
>;
