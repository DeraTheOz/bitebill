"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { authClient } from "../lib/client";
import Image from "next/image";
import GoogleIcon from "@/public/google.svg";

export function GoogleButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogle = async () => {
    setIsLoading(true);
    try {
      const { error } = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/dashboard",
        newUserCallbackURL: "/onboarding",
      });
      if (error) toast.error(error.message || "Google sign-in failed");
    } catch (e) {
      toast.error(
        e instanceof Error && e.message
          ? e.message
          : "Google sign-in failed",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleGoogle}
      disabled={isLoading}
      className="flex h-12 w-full items-center justify-center gap-2.5 rounded-full border border-border bg-surface px-4 text-[15px] font-bold text-ink transition-colors hover:bg-surface-subtle focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple disabled:cursor-not-allowed disabled:opacity-60">
      <Image src={GoogleIcon} alt="" width={20} height={20} />
      {isLoading ? "Redirecting..." : "Continue with Google"}
    </button>
  );
}
