import type { Metadata } from "next";
import { MotionProvider } from "@/components/motion-provider";
import { LandingFooter } from "@/features/landing/components/landing-footer";
import { LandingHeader } from "@/features/landing/components/landing-header";
import { getLandingUser } from "@/features/landing/lib/session";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "BiteBill — Beautiful invoicing for freelancers & small businesses",
  description:
    "Create branded PDF invoices, manage clients, share public payment links, automate recurring billing, and track revenue with a fast, type-safe invoicing platform.",
};

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getLandingUser();

  return (
    <MotionProvider>
      <div className="flex min-h-screen flex-col bg-canvas text-ink">
        <LandingHeader user={user} />
        <main className="flex-1">{children}</main>
        <LandingFooter user={user} />
      </div>
    </MotionProvider>
  );
}
