import { z } from "zod";

export const analyticsRangeSchema = z
  .string()
  .trim()
  .refine(
    (val) =>
      ["3m", "6m", "12m", "ytd", "all"].includes(val) ||
      /^(?:20\d{2}|2100)$/.test(val),
    {
      message: "Invalid range. Expected 3m, 6m, 12m, ytd, all, or a 4-digit year.",
    },
  )
  .default("6m");

export const analyticsQuerySchema = z.object({
  range: analyticsRangeSchema,
});

export type AnalyticsRange = z.infer<typeof analyticsRangeSchema>;
export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;

