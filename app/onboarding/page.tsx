import { redirect } from "next/navigation";
import { getSessionUser } from "@/features/auth/lib/session";
import { getBrandingSettings } from "@/features/branding/services/branding";
import { OnboardingFlow } from "@/features/onboarding/components/onboarding-flow";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const user = await getSessionUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const branding = await getBrandingSettings(user.id);

  if (branding) {
    redirect("/dashboard");
  }

  return (
    <OnboardingFlow
      user={{
        name: user.name ?? "",
        email: user.email ?? "",
      }}
    />
  );
}
