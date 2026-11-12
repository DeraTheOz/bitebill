import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  setupPasswordSchema,
  type SetupPasswordValues,
} from "../schemas/settings-schema";
import {
  useRequestSetupPasswordOtp,
  useResetPasswordWithOtp,
} from "./use-settings-queries";

const RESEND_COOLDOWN_SECONDS = 45;

/** Manages 6-digit OTP dispatch, resend cooldown, and password setup/reset completion. */
export function useOtpPasswordFlow({
  mode,
  userEmail,
  onSuccess,
}: {
  mode: "setup" | "reset";
  userEmail: string;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [isCodeSent, setIsCodeSent] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const requestOtp = useRequestSetupPasswordOtp();
  const resetPassword = useResetPasswordWithOtp();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = window.setTimeout(
      () => setResendCooldown((seconds) => seconds - 1),
      1000,
    );
    return () => window.clearTimeout(timer);
  }, [resendCooldown]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SetupPasswordValues>({
    resolver: zodResolver(setupPasswordSchema),
    defaultValues: {
      otp: "",
      newPassword: "",
      confirmNewPassword: "",
    },
    mode: "onTouched",
  });

  const isSendingOtp = requestOtp.isPending;
  const isSaving = isSubmitting || resetPassword.isPending;
  const isSetup = mode === "setup";

  async function handleSendCode() {
    try {
      await requestOtp.mutateAsync();
      setIsCodeSent(true);
      setResendCooldown(RESEND_COOLDOWN_SECONDS);
      toast.success(`Verification code sent to ${userEmail}`);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Could not send verification code",
      );
    }
  }

  async function onSubmit(values: SetupPasswordValues) {
    try {
      const result = await resetPassword.mutateAsync({
        email: userEmail,
        otp: values.otp,
        password: values.newPassword,
      });

      reset();
      setIsCodeSent(false);

      if (!result.sessionActive) {
        toast.success("Password reset! Please sign in with your new password.");
        router.replace("/auth/sign-in?reset=1");
        router.refresh();
        return;
      }

      toast.success(
        isSetup
          ? "Password set! You can now sign in with email and password."
          : "Password updated",
      );
      onSuccess?.();
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : isSetup
            ? "Could not set password"
            : "Could not reset password",
      );
    }
  }

  return {
    isSetup,
    isCodeSent,
    resendCooldown,
    isSendingOtp,
    isSaving,
    errors,
    register,
    handleSendCode,
    handleSubmit: handleSubmit(onSubmit),
  };
}

