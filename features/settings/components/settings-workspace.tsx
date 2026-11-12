"use client";

import {
  FileText,
  Palette,
  Shield,
  User,
  type LucideIcon,
} from "lucide-react";
import { useSettingsWorkspace } from "../hooks/use-settings-workspace";
import type { SettingsTab, SettingsUser } from "../types/settings";
import { AccountSecuritySection } from "./account-security-section";
import { BrandingSettingsForm } from "./branding-settings-form";
import { PdfSettingsForm } from "./pdf-settings-form";
import { ProfileSettingsForm } from "./profile-settings-form";

const tabs: ReadonlyArray<{
  id: SettingsTab;
  label: string;
  icon: LucideIcon;
}> = [
  { id: "branding", label: "Business & Branding", icon: Palette },
  { id: "pdf", label: "Invoice & PDF", icon: FileText },
  { id: "profile", label: "Profile", icon: User },
  { id: "account", label: "Account & Security", icon: Shield },
];

export function SettingsWorkspace({
  user,
  initialTab,
}: {
  user: SettingsUser;
  initialTab: SettingsTab;
}) {
  const { branding, activeTab, selectTab } = useSettingsWorkspace(initialTab);

  return (
    <main className="px-4 pb-14 pt-24 sm:px-6 md:px-8 md:pt-28 lg:px-8 lg:pt-14">
      <div className="mx-auto w-full max-w-6xl">
        <header className="mb-6 md:mb-8">
          <h1 className="text-[32px] font-bold leading-none tracking-[-1.125px] text-ink sm:text-[36px]">
            Settings
          </h1>
          <p className="mt-2 text-[13px] font-medium tracking-[-0.1px] text-muted-light">
            Manage workspace preferences for{" "}
            <span className="font-bold text-ink">{branding.businessName}</span>
          </p>
        </header>

        <nav
          aria-label="Settings sections"
          role="tablist"
          className="no-scrollbar mb-8 flex gap-2 overflow-x-auto border-b border-border pb-3">
          {tabs.map(({ id, label, icon: Icon }) => {
            const isSelected = activeTab === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                id={`settings-tab-${id}`}
                aria-selected={isSelected}
                aria-controls={`settings-panel-${id}`}
                onClick={() => selectTab(id)}
                className={`inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-[14px] font-bold tracking-[-0.2px] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple ${
                  isSelected
                    ? "bg-purple text-white"
                    : "border border-border bg-surface text-muted hover:border-purple/50 hover:text-ink"
                }`}>
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {label}
              </button>
            );
          })}
        </nav>

        <section
          id={`settings-panel-${activeTab}`}
          role="tabpanel"
          aria-labelledby={`settings-tab-${activeTab}`}>
          {activeTab === "branding" && (
            <BrandingSettingsForm key={`branding-${branding.updatedAt}`} />
          )}
          {activeTab === "pdf" && (
            <PdfSettingsForm key={`pdf-${branding.updatedAt}`} />
          )}
          {activeTab === "profile" && <ProfileSettingsForm user={user} />}
          {activeTab === "account" && (
            <AccountSecuritySection userEmail={user.email} />
          )}
        </section>
      </div>
    </main>
  );
}

