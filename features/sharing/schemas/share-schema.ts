import { z } from "zod";

const expiresAtSchema = z.iso
  .datetime({ message: "Select a valid expiration date" })
  .refine(
    (value) => new Date(value).getTime() > Date.now(),
    "Expiration must be in the future",
  )
  .nullable();

export const shareTokenSchema = z
  .string()
  .trim()
  .min(10, "Invalid share token")
  .max(128, "Invalid share token")
  .regex(/^[A-Za-z0-9_-]+$/, "Invalid share token");

export const createShareInputSchema = z.object({
  regenerate: z.boolean().optional(),
  expiresAt: expiresAtSchema.optional(),
});

export const updateShareInputSchema = z.object({
  expiresAt: expiresAtSchema,
});

export type CreateSharePayload = z.input<typeof createShareInputSchema>;
export type CreateShareInput = z.infer<typeof createShareInputSchema>;
export type UpdateShareInput = z.infer<typeof updateShareInputSchema>;

