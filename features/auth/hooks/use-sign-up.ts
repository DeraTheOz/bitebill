import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { unstable_rethrow } from "next/navigation";
import { signUpSchema, type SignUpValues } from "../schemas/validation";
import { signUpWithEmail } from "../actions/sign-up";
import { toFormData } from "../lib/form-data";

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

export function useSignUp() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignUpValues>({
    resolver: zodResolver(signUpSchema),
    defaultValues: { name: "", email: "", password: "" },
  });

  const onSubmit = form.handleSubmit((data) => {
    setSubmitError(null);
    startTransition(async () => {
      try {
        const result = await signUpWithEmail(null, toFormData(data));
        if (result?.error) setSubmitError(result.error);
      } catch (e) {
        unstable_rethrow(e);
        setSubmitError(FALLBACK_MESSAGE);
      }
    });
  });

  return { form, onSubmit, submitError, isPending };
}
