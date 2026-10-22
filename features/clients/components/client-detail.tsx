"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import {
  ChevronLeft,
  CircleCheck,
  Clock,
  FileText,
  Wallet,
} from "lucide-react";

import { NotFoundState } from "@/components/errors/not-found-state";
import { ErrorState } from "@/components/errors/error-state";
import { PageLoader } from "@/components/loaders/page-loader";
import { EditButton } from "@/components/buttons/edit-button";
import { DeleteButton } from "@/components/buttons/delete-button";

import { ClientFormDrawer } from "./client-form-drawer";
import { DeleteClientDialog } from "./delete-client-dialog";
import { ClientInvoiceSection } from "./client-invoice-section";
import { ClientMetricCard } from "./client-metric-card";
import { ClientInvoiceHealth } from "./client-invoice-health";
import { ClientInfoSection } from "./client-info-section";
import { ClientHeader } from "./client-header";
import { useClient, useDeleteClient } from "../hooks/use-client-queries";

import {
  formatMoney,
  getClientInvoices,
  getInvoiceCounts,
} from "../lib/helpers";
import { ApiError } from "../lib/api";

export function ClientDetail({ clientId }: { clientId: string }) {
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const {
    data: client,
    isPending,
    isError,
    error,
    refetch,
  } = useClient(clientId);

  const deleteClient = useDeleteClient();
  const isDeleting = deleteClient.isPending;

  function handleDelete() {
    if (!client) return;

    deleteClient.mutate(client.id, {
      onSuccess: () => {
        toast.success("Client deleted");
        router.push("/clients");
      },
      onError: (deleteError) => {
        toast.error(deleteError.message);
      },
    });
  }

  if (isPending) {
    return (
      <main className="px-6 md:px-10">
        <PageLoader label="Loading client…" />
      </main>
    );
  }

  if (isError) {
    if (error instanceof ApiError && error.status === 404) {
      return (
        <main className="px-6 md:px-10">
          <NotFoundState
            title="Client not found"
            description="This client may have been deleted or is no longer available."
            href="/clients"
            actionLabel="Back to clients"
          />
        </main>
      );
    }

    return (
      <main className="px-6 md:px-10">
        <ErrorState
          title="Could not load client"
          description="We couldn't fetch this client. Check your connection and try again."
          onRetry={() => void refetch()}
        />
      </main>
    );
  }

  const invoices = getClientInvoices(client.id);
  const counts = getInvoiceCounts(client.id);

  const billed = invoices
    .filter((invoice) => invoice.status !== "draft")
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const paid = invoices
    .filter((invoice) => invoice.status === "paid")
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const outstanding = invoices
    .filter(
      (invoice) => invoice.status === "pending" || invoice.status === "overdue",
    )
    .reduce((sum, invoice) => sum + invoice.amount, 0);
  const outstandingCount = counts.pending + counts.overdue;
  const paidPct = billed > 0 ? Math.round((paid / billed) * 100) : 0;

  return (
    <main className="px-6 pb-26 pt-26 md:pb-14 md:pl-[calc((100%-688px)/2)] md:pr-[calc((100%-688px)/2)] md:pt-27.75 lg:pl-[calc((100%-800px)/2)] lg:pr-[calc((100%-800px)/2)] lg:pt-16.25 max-[970px]:md:px-10">
      <section className="mx-auto w-full max-w-200">
        <Link
          href="/clients"
          className="inline-flex items-center gap-4 text-[15px] font-bold tracking-[-0.25px] text-muted hover:text-purple">
          <ChevronLeft size={16} strokeWidth={2} />
          Go back
        </Link>

        <ClientHeader
          client={client}
          onEdit={() => setIsEditOpen(true)}
          onDelete={() => setIsDeleteOpen(true)}
          isDeletePending={isDeleting}
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <ClientMetricCard
            label="Total Billed"
            value={formatMoney(billed)}
            hint={`${invoices.length} invoices issued`}
            icon={Wallet}
          />
          <ClientMetricCard
            label="Paid"
            value={formatMoney(paid)}
            hint={`${paidPct}% of billed`}
            icon={CircleCheck}
          />
          <ClientMetricCard
            label="Outstanding"
            value={formatMoney(outstanding)}
            hint={
              outstandingCount
                ? `${outstandingCount} awaiting payment`
                : "All caught up"
            }
            icon={Clock}
          />
          <ClientMetricCard
            label="Invoices"
            value={String(invoices.length)}
            hint={`${counts.paid} paid · ${counts.draft} draft`}
            icon={FileText}
          />
        </div>

        {invoices.length > 0 && (
          <ClientInvoiceHealth clientId={clientId} invoices={invoices} />
        )}

        <ClientInfoSection
          client={client}
          outstandingCount={outstandingCount}
        />

        {client.notes && (
          <section
            aria-labelledby="client-notes-heading"
            className="mt-4 rounded-lg bg-surface p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] dark:shadow-none md:p-8">
            <h2
              id="client-notes-heading"
              className="text-[15px] font-bold text-purple">
              Notes
            </h2>
            <p className="mt-4 whitespace-pre-line text-[13px] font-medium leading-5.5 tracking-[-0.1px] text-muted">
              {client.notes}
            </p>
          </section>
        )}

        <div className="mt-10">
          <ClientInvoiceSection clientId={client.id} />
        </div>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-20 bg-surface px-6 py-5 shadow-[0_-10px_20px_rgba(var(--shadow-navy),0.08)] md:hidden">
        <div className="flex justify-center gap">
          <EditButton onClick={() => setIsEditOpen(true)} />
          <DeleteButton
            onClick={() => setIsDeleteOpen(true)}
            disabled={isDeleting}
            className="disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      </div>

      {isEditOpen && (
        <ClientFormDrawer
          mode="edit"
          clientId={client.id}
          onClose={() => setIsEditOpen(false)}
        />
      )}

      {isDeleteOpen && (
        <DeleteClientDialog
          clientName={client.name}
          isDeleting={isDeleting}
          onConfirm={handleDelete}
          onClose={() => setIsDeleteOpen(false)}
        />
      )}
    </main>
  );
}
