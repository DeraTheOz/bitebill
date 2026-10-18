"use client";

import { AlertTriangle } from "lucide-react";

type ErrorStateProps = {
  title?: string;
  description?: string;
  onRetry: () => void;
  className?: string;
};

export function ErrorState({
  title = "Something went wrong",
  description = "An unexpected error occurred. Please try again, and if the problem continues, contact support.",
  onRetry,
  className = "",
}: ErrorStateProps) {
  return (
    <div
      className={`flex min-h-screen w-full flex-col items-center justify-center gap-6 px-6 text-center ${className}`}>
      <span className="grid size-16 place-items-center rounded-full bg-danger/10 text-danger">
        <AlertTriangle className="size-8" aria-hidden="true" />
      </span>
      <div className="flex flex-col gap-2">
        <h1 className="text-[24px] font-bold tracking-[-0.5px] text-ink">
          {title}
        </h1>
        <p className="max-w-md text-[13px] font-medium leading-5 text-muted-light">
          {description}
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="h-12 rounded-full bg-purple px-6 text-[15px] font-bold text-white transition-colors hover:bg-purple-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple">
        Try again
      </button>
    </div>
  );
}
