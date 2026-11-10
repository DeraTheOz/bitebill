"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { DownloadPdfButton } from "@/components/buttons/download-pdf-button";
import { InvoiceDocument } from "@/features/invoices/components/invoice-document";
import { InvoiceStatusBadge } from "@/features/invoices/components/invoice-status";
import { BrandLockup } from "@/features/landing/components/brand-lockup";
import { ThemeToggle } from "@/features/theme/components/theme-toggle";
import { formatDate } from "@/lib/format";
import { usePublicShareView } from "../hooks/use-public-share-view";
import type { PublicSharedInvoice } from "../types/share";

export function PublicShareView({
  token,
  data,
}: {
  token: string;
  data: PublicSharedInvoice;
}) {
  const {
    invoice,
    branding,
    share,
    logoUrl,
    isDownloadingPdf,
    handleDownloadPdf,
  } = usePublicShareView({ token, data });

  return (
    <div className="min-h-screen bg-canvas text-ink transition-colors">
      <header className="border-b border-border/70 bg-surface/80 px-4 backdrop-blur-sm sm:px-6 md:px-10">
        <div className="mx-auto flex h-16 max-w-205 items-center justify-between">
          <BrandLockup />
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-1.5 rounded-full bg-surface-subtle px-3 py-1 text-[12px] font-bold text-muted sm:inline-flex">
              <Lock className="size-3 shrink-0 text-purple" aria-hidden="true" />
              <span className="translate-y-[1.5px]">Read-only invoice</span>
            </span>
            <ThemeToggle className="grid size-9 place-items-center rounded-lg hover:bg-surface-subtle" />
          </div>
        </div>
      </header>

      <main className="px-4 py-8 sm:px-6 md:px-10 md:py-12">
        <section className="mx-auto w-full max-w-205">
          <div className="flex min-h-22 flex-wrap items-center justify-between gap-4 rounded-lg bg-surface px-6 py-4 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] dark:shadow-none md:px-8">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-4">
                <span className="text-[13px] text-muted-light">Status</span>
                <InvoiceStatusBadge status={invoice.status} />
              </div>

              {share.expiresAt && (
                <span className="text-[12px] font-medium text-muted-light">
                  Link expires {formatDate(share.expiresAt.slice(0, 10))}
                </span>
              )}
            </div>

            <DownloadPdfButton
              onClick={handleDownloadPdf}
              isDownloading={isDownloadingPdf}
              className="w-full sm:w-auto">
              Download PDF
            </DownloadPdfButton>
          </div>

          <InvoiceDocument
            invoice={invoice}
            branding={branding}
            logoUrl={logoUrl}
          />

          <footer className="mt-8 flex flex-wrap items-center justify-between gap-2 text-[12px] font-medium text-muted-light">
            <span>
              Sent by{" "}
              <strong className="font-bold text-ink">
                {branding.businessName}
              </strong>
            </span>
            <Link
              href="/"
              className="font-bold text-muted transition-colors hover:text-purple">
              Powered by BiteBill
            </Link>
          </footer>
        </section>
      </main>
    </div>
  );
}
