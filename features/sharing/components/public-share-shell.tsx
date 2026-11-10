"use client";

import Link from "next/link";
import { Clock } from "lucide-react";
import { ErrorState } from "@/components/errors/error-state";
import { NotFoundState } from "@/components/errors/not-found-state";
import { PageLoader } from "@/components/loaders/page-loader";
import { ApiError } from "@/features/invoices/lib/api";
import { usePublicShare } from "../hooks/use-share-queries";
import { PublicShareView } from "./public-share-view";

export function PublicShareShell({ token }: { token: string }) {
  const { data, isPending, isError, error, refetch } = usePublicShare(token);

  if (isPending) {
    return (
      <main className="min-h-screen bg-canvas px-6">
        <PageLoader label="Loading shared invoice…" />
      </main>
    );
  }

  if (isError) {
    if (error instanceof ApiError && error.status === 410) {
      return (
        <main className="flex min-h-screen w-full flex-col items-center justify-center gap-6 bg-canvas px-6 text-center">
          <span className="grid size-16 place-items-center rounded-full bg-status-pending/15 text-status-pending">
            <Clock className="size-8" aria-hidden="true" />
          </span>
          <div className="flex flex-col gap-2">
            <h1 className="text-[24px] font-bold tracking-[-0.5px] text-ink">
              Share link expired
            </h1>
            <p className="max-w-md text-[13px] font-medium leading-5 text-muted-light">
              This invoice link has expired and is no longer active. Please ask
              the sender to generate a new share link.
            </p>
          </div>
          <Link
            href="/"
            className="grid h-12 place-items-center rounded-full bg-purple px-6 text-[15px] font-bold text-white transition-colors hover:bg-purple-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple">
            Go to BiteBill
          </Link>
        </main>
      );
    }

    if (error instanceof ApiError && error.status === 404) {
      return (
        <main className="bg-canvas px-6">
          <NotFoundState
            title="Shared invoice not found"
            description="This share link may have been disabled, replaced, or the invoice is no longer available."
            href="/"
            actionLabel="Go to BiteBill"
          />
        </main>
      );
    }

    return (
      <main className="bg-canvas px-6">
        <ErrorState
          title="Could not load shared invoice"
          className="min-h-screen"
          description="We couldn't fetch this shared invoice. Check your connection and try again."
          onRetry={() => void refetch()}
        />
      </main>
    );
  }

  if (!data) return null;

  return <PublicShareView token={token} data={data} />;
}

