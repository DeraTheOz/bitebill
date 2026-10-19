import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { unstable_rethrow } from "next/navigation";
import { sendOtpSchema, type SendOtpValues } from "../schemas/validation";
import { sendPasswordResetOtp } from "../actions/forgot-password";
import { mapOtpError } from "../lib/otp-error";
import { toFormData } from "../lib/form-data";

export function useForgotPassword() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<SendOtpValues>({
    resolver: zodResolver(sendOtpSchema),
    defaultValues: { email: "" },
  });

  const onSubmit = form.handleSubmit((data) => {
    setSubmitError(null);
    startTransition(async () => {
      try {
        const result = await sendPasswordResetOtp(null, toFormData(data));
        if (result?.error) setSubmitError(result.error);
      } catch (e) {
        unstable_rethrow(e);
        setSubmitError(mapOtpError(e));
      }
    });
  });

  return { form, onSubmit, submitError, isPending };
}
