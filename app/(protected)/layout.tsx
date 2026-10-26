import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/layout/app-sidebar";
import { getSessionUser } from "@/features/auth/lib/session";
import { BrandingProvider } from "@/features/branding/components/branding-provider";
import { getBrandingSettings } from "@/features/branding/services/branding";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getSessionUser();

  if (!user) {
    redirect("/auth/sign-in");
  }

  const branding = await getBrandingSettings(user.id);

  // A branding row is the onboarding-complete marker.
  if (!branding) {
    redirect("/onboarding");
  }

  return (
    <BrandingProvider settings={branding}>
      <div className="min-h-screen bg-canvas text-ink transition-colors lg:pl-64">
        <AppSidebar
          user={{
            name: user.name,
            email: user.email,
            image: user.image,
          }}
        />
        {children}
      </div>
    </BrandingProvider>
  );
}
