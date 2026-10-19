import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { unstable_rethrow } from "next/navigation";
import {
  verifyEmailSchema,
  type VerifyEmailValues,
} from "../schemas/validation";
import {
  sendVerificationOtp,
  verifyEmailWithOtp,
} from "../actions/verify-email";
import { mapOtpError } from "../lib/otp-error";
import { toFormData } from "../lib/form-data";

const RESEND_COOLDOWN_SECONDS = 45;

export function useVerifyEmail({ email }: { email?: string }) {
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

  const form = useForm<VerifyEmailValues>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email: email ?? "", otp: "" },
  });

  const onSubmit = form.handleSubmit((data) => {
    setSubmitError(null);
    startTransition(async () => {
      try {
        const result = await verifyEmailWithOtp(null, toFormData(data));
        if (result?.error) setSubmitError(result.error);
      } catch (e) {
        unstable_rethrow(e);
        setSubmitError(mapOtpError(e));
      }
    });
  });

  const onResend = () => {
    startResendTransition(async () => {
      try {
        const result = await sendVerificationOtp(
          null,
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
