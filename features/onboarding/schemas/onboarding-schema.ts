import z from "zod";
import {
  brandingLogoUrlSchema,
  brandingSettingsSchema,
  businessPhoneSchema,
} from "@/features/branding/schemas/branding-schema";

export const businessSchema = z.object({
  businessName: z
    .string()
    .trim()
    .min(2, "Business name must be at least 2 characters")
    .regex(/^[\p{L}\s]+$/u, "Business name must contain only letters"),
  businessEmail: z.email("Enter a valid email"),
  businessPhone: businessPhoneSchema,
  website: z.union([
    z.literal(""),
    z.url("Enter a valid URL, e.g. https://yoursite.com"),
  ]),
});

export const addressSchema = z.object({
  addressLine1: z.string().trim().min(3, "Street address is required"),
  addressLine2: z.string().trim(),
  city: z
    .string()
    .trim()
    .min(2, "City is required")
    .regex(
      /^[\p{L}]{2,}(?:[\s\-][\p{L}]{2,})*$/u,
      "Enter a valid city name (letters only)",
    ),
  state: z
    .string()
    .trim()
    .min(2, "State or region is required")
    .regex(
      /^[\p{L}]{2,}(?:[\s\-][\p{L}]{2,})*$/u,
      "Enter a valid state or region (letters only)",
    ),
  country: z.string().trim().min(1, "Select a country"),
});

export const brandingSchema = z.object({
  logoUrl: brandingLogoUrlSchema,
  brandColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Enter a valid hex color code (e.g. #7C5DFA)"),
  currency: z
    .string()
    .regex(/^[A-Z]{3}$/, "Choose a 3-letter currency code"),
  invoicePrefix: z
    .string()
    .regex(/^[A-Za-z0-9]{1,6}$/, "Use 1–6 letters or numbers"),
  pdfTemplate: z.enum(["classic", "modern", "corporate"]),
  defaultTerms: z.string().max(500, "Keep terms under 500 characters"),
});

// The final save reuses the canonical payload schema so the API and the
// form accept exactly the same values.
export const onboardingSchema = brandingSettingsSchema;

export const stepSchemas = [
  businessSchema,
  addressSchema,
  brandingSchema,
] as const;

export type BusinessValues = z.infer<typeof businessSchema>;
export type AddressValues = z.infer<typeof addressSchema>;
export type BrandingValues = z.infer<typeof brandingSchema>;
export type OnboardingValues = z.infer<typeof onboardingSchema>;
