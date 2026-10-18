"use client";

import { useEffect } from "react";
import { ErrorState } from "@/components/errors/error-state";

export default function ProtectedError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return <ErrorState className="pt-18 md:pt-20 lg:pt-0" onRetry={reset} />;
}
