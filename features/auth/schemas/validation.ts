import z from "zod";

/** Email/password credentials used to sign in. */
export const signInSchema = z.object({
  email: z.email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

/** Details required to register a new email/password account. */
export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/** Inferred form values for {@link signInSchema}. */
export type SignInValues = z.infer<typeof signInSchema>;
/** Inferred form values for {@link signUpSchema}. */
export type SignUpValues = z.infer<typeof signUpSchema>;

/** A six-digit numeric one-time passcode. */
const otpSchema = z
  .string()
  .regex(/^\d{6}$/, "Enter the 6-digit code");

/** Payload for requesting an OTP (email verification or password reset). */
export const sendOtpSchema = z.object({
  email: z.email("Enter a valid email"),
});

/** Payload for verifying an email address with a one-time passcode. */
export const verifyEmailSchema = z.object({
  email: z.email("Enter a valid email"),
  otp: otpSchema,
});

/** Payload for resetting a password, including confirmation of the new password. */
export const resetPasswordSchema = z
  .object({
    email: z.email("Enter a valid email"),
    otp: otpSchema,
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

/** Inferred form values for {@link sendOtpSchema}. */
export type SendOtpValues = z.infer<typeof sendOtpSchema>;
/** Inferred form values for {@link verifyEmailSchema}. */
export type VerifyEmailValues = z.infer<typeof verifyEmailSchema>;
/** Inferred form values for {@link resetPasswordSchema}. */
export type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;
