import { useState } from "react";
import { useRouter } from "next/navigation";
import { useBranding } from "@/features/branding/components/branding-provider";
import type { SettingsTab } from "../types/settings";

/** Manages active settings tab state, URL synchronization, and workspace branding context. */
export function useSettingsWorkspace(initialTab: SettingsTab) {
  const router = useRouter();
  const branding = useBranding();
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab);

  function selectTab(tab: SettingsTab) {
    setActiveTab(tab);
    router.replace(`/settings?tab=${tab}`, { scroll: false });
  }

  return {
    branding,
    activeTab,
    selectTab,
  };
}

