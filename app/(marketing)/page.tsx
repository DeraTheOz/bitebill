import { AnalyticsSection } from "@/features/landing/components/analytics-section";
import { CtaSection } from "@/features/landing/components/cta-section";
import { FeatureGrid } from "@/features/landing/components/feature-grid";
import { Hero } from "@/features/landing/components/hero";
import { HowItWorks } from "@/features/landing/components/how-it-works";
import { PdfSection } from "@/features/landing/components/pdf-section";
import { SharingSection } from "@/features/landing/components/sharing-section";
import { getLandingUser } from "@/features/landing/lib/session";

export const dynamic = "force-dynamic";

export default async function LandingPage() {
  const user = await getLandingUser();

  return (
    <>
      <Hero user={user} />
      <FeatureGrid />
      <PdfSection />
      <AnalyticsSection />
      <SharingSection />
      <HowItWorks />
      <CtaSection user={user} />
    </>
  );
}
