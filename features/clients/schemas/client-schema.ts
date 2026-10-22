import { z } from "zod";

export const clientFormSchema = z.object({
  name: z.string().trim().min(1, "Can't be empty"),
  email: z.union([z.literal(""), z.email("Enter a valid email")]),
  phone: z.string().trim(),
  company: z.string().trim(),
  addressLine1: z.string().trim(),
  addressLine2: z.string().trim(),
  city: z.string().trim(),
  state: z.string().trim(),
  country: z.string().trim(),
  notes: z.string().trim(),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;
