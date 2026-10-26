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

/**
 * Canonical payload for onboarding and settings. The form uses
 * the same field names, so client and server validation cannot drift.
 */
export const brandingSettingsSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, "Business name must be at least 2 characters"),
  businessEmail: z.email("Enter a valid email"),
  businessPhone: z.string().trim().min(7, "Enter a valid phone number"),
  website: z.union([
    z.literal(""),
    z.url("Enter a valid URL, e.g. https://yoursite.com"),
  ]),
  addressLine1: z.string().trim().min(3, "Street address is required"),
  addressLine2: z.string().trim(),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State or region is required"),
  country: z.string().trim().min(1, "Country is required"),
  logoUrl: brandingLogoUrlSchema,
  brandColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Pick a color from the list"),
  currency: z.string().regex(/^[A-Z]{3}$/, "Choose a 3-letter currency code"),
  invoicePrefix: z
    .string()
    .regex(/^[A-Za-z0-9]{1,6}$/, "Use 1–6 letters or numbers"),
  pdfTemplate: z.enum(["classic", "modern", "corporate"]),
  defaultTerms: z.string().max(500, "Keep terms under 500 characters"),
});

export type BrandingSettingsValues = z.infer<typeof brandingSettingsSchema>;
