import z from "zod";
import {
  addressFieldsSchema,
  brandingFieldsSchema,
  brandingSettingsSchema,
  businessFieldsSchema,
} from "@/features/branding/schemas/branding-schema";

export const businessSchema = businessFieldsSchema;
export const addressSchema = addressFieldsSchema;
export const brandingSchema = brandingFieldsSchema;

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
