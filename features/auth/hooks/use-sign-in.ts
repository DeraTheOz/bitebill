import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { unstable_rethrow } from "next/navigation";
import { signInSchema, type SignInValues } from "../schemas/validation";
import { signInWithEmail } from "../actions/sign-in";
import { toFormData } from "../lib/form-data";

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

export function useSignIn() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<SignInValues>({
    resolver: zodResolver(signInSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit((data) => {
    setSubmitError(null);
    startTransition(async () => {
      try {
        const result = await signInWithEmail(null, toFormData(data));
        if (result?.error) setSubmitError(result.error);
      } catch (e) {
        unstable_rethrow(e);
        setSubmitError(FALLBACK_MESSAGE);
      }
    });
  });

  return { form, onSubmit, submitError, isPending };
}
