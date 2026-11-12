"use client";

import { ErrorState } from "@/components/errors/error-state";
import { NotFoundState } from "@/components/errors/not-found-state";
import { PageLoader } from "@/components/loaders/page-loader";
import { useRecurringTemplate } from "../hooks/use-recurring-queries";
import { ApiError } from "../lib/api";
import { RecurringDetail } from "./recurring-detail";

export function RecurringDetailShell({ templateId }: { templateId: string }) {
  const {
    data: template,
    isPending,
    isError,
    error,
    refetch,
  } = useRecurringTemplate(templateId);

  if (isPending) {
    return (
      <main className="px-6 md:px-10">
        <PageLoader label="Loading recurring invoice…" />
      </main>
    );
  }

  if (isError) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <main className="px-6 md:px-10">
          <NotFoundState
            title="Recurring invoice not found"
            description="This recurring invoice may have been deleted or is no longer available."
            href="/recurring-invoices"
            actionLabel="Back to recurring"
          />
        </main>
      );
    }

    return (
      <main className="px-6 md:px-10">
        <ErrorState
          title="Could not load recurring invoice"
          className="min-h-screen"
          description="We couldn't fetch this recurring invoice. Check your connection and try again."
          onRetry={() => void refetch()}
        />
      </main>
    );
  }

  return <RecurringDetail template={template} />;
}

