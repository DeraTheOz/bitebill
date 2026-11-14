import type { Metadata } from "next";
import Link from "next/link";
import { WifiOff, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "Offline | BiteBill",
  description: "You are currently offline.",
};

export default function OfflinePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-canvas px-6 py-12 text-center">
      <div className="flex size-20 items-center justify-center rounded-full bg-purple/10 text-purple ring-8 ring-purple/5">
        <WifiOff className="size-9" aria-hidden="true" />
      </div>

      <h1 className="mt-6 text-2xl font-bold tracking-tight text-ink sm:text-3xl">
        You are currently offline
      </h1>

      <p className="mt-3 max-w-md text-[14px] font-medium leading-relaxed text-muted-light">
        BiteBill requires an active internet connection to load live invoice data,
        clients, and analytics. Please check your network connection and retry.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-purple px-6 py-3 text-[14px] font-bold text-white transition-colors hover:bg-purple-light focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple">
          <RefreshCw className="size-4" aria-hidden="true" />
          <span>Retry Connection</span>
        </Link>
      </div>
    </main>
  );
}
