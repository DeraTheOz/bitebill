import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, unstable_rethrow } from "next/navigation";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "../schemas/validation";
import { authClient } from "../lib/client";
import { mapOtpError } from "../lib/otp-error";
import { resendPasswordResetOtp } from "../actions/forgot-password";
import { toFormData } from "../lib/form-data";

const RESEND_COOLDOWN_SECONDS = 45;

export function useResetPassword({ email }: { email?: string }) {
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [sendError, setSendError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [isResending, startResendTransition] = useTransition();
  const [cooldown, setCooldown] = useState(0);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: email ?? "",
      otp: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = form.handleSubmit((data) => {
    setSubmitError(null);
    startTransition(async () => {
      try {
        const { error } = await authClient.emailOtp.resetPassword({
          email: data.email,
          otp: data.otp,
          password: data.password,
        });
        if (error) {
          setSubmitError(mapOtpError(error));
          return;
        }
        router.push("/auth/sign-in?reset=1");
      } catch (e) {
        unstable_rethrow(e);
        setSubmitError(mapOtpError(e));
      }
    });
  });

  const onResend = () => {
    startResendTransition(async () => {
      try {
        const result = await resendPasswordResetOtp(
          toFormData({ email: form.getValues("email") }),
        );
        setSendError(result?.error ?? null);
        if (!result?.error) setCooldown(RESEND_COOLDOWN_SECONDS);
      } catch (e) {
        unstable_rethrow(e);
        setSendError(mapOtpError(e));
      }
    });
  };

  return {
    form,
    email,
    onSubmit,
    submitError,
    isPending,
    sendError,
    isResending,
    cooldown,
    onResend,
  };
}
