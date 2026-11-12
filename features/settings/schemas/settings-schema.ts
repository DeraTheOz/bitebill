import { z } from "zod";

export const profileSettingsSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Keep name under 100 characters"),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Enter your current password"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters")
      .max(128, "Keep password under 128 characters"),
    confirmNewPassword: z.string().min(1, "Confirm your new password"),
    revokeOtherSessions: z.boolean().default(true),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.newPassword !== data.currentPassword, {
    message: "New password must be different from your current password",
    path: ["newPassword"],
  });

export const changePasswordInputSchema = z.object({
  currentPassword: z.string().min(1, "Enter your current password"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(128, "Keep password under 128 characters"),
  revokeOtherSessions: z.boolean().default(true),
});

export const setupPasswordSchema = z
  .object({
    otp: z.string().regex(/^\d{6}$/, "Enter the 6-digit code"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(128, "Keep password under 128 characters"),
    confirmNewPassword: z.string().min(1, "Confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export const deleteAccountSchema = z.object({
  confirmation: z
    .string()
    .trim()
    .refine((val) => val === "DELETE", {
      message: 'Type "DELETE" to confirm account deletion',
    }),
  password: z.string().optional(),
});

export type ProfileSettingsValues = z.infer<typeof profileSettingsSchema>;
export type ChangePasswordInput = z.input<typeof changePasswordSchema>;
export type ChangePasswordValues = z.infer<typeof changePasswordSchema>;
export type SetupPasswordValues = z.infer<typeof setupPasswordSchema>;
export type DeleteAccountInput = z.input<typeof deleteAccountSchema>;
export type DeleteAccountValues = z.infer<typeof deleteAccountSchema>;
