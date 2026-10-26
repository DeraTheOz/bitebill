import z from "zod";
import {
  brandingLogoUrlSchema,
  brandingSettingsSchema,
} from "@/features/branding/schemas/branding-schema";

export const businessSchema = z.object({
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
});

export const addressSchema = z.object({
  addressLine1: z.string().trim().min(3, "Street address is required"),
  addressLine2: z.string().trim(),
  city: z.string().trim().min(1, "City is required"),
  state: z.string().trim().min(1, "State or region is required"),
  country: z.string().trim().min(1, "Country is required"),
});

export const brandingSchema = z.object({
  logoUrl: brandingLogoUrlSchema,
  brandColor: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Pick a color from the list"),
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
