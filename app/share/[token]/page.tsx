import type { Metadata } from "next";
import { PublicShareShell } from "@/features/sharing/components/public-share-shell";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shared Invoice | BiteBill",
  description: "View shared invoice details and download PDF.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PublicSharePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return <PublicShareShell token={token} />;
}

