import { AppSidebar } from "@/components/layout/app-sidebar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-canvas text-ink transition-colors lg:pl-64">
      <AppSidebar />
      {children}
    </div>
  );
}
