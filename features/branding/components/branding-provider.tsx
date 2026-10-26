"use client";

import { createContext, useContext } from "react";
import type { BrandingSettings } from "../types/branding";

const BrandingContext = createContext<BrandingSettings | null>(null);

export function BrandingProvider({
  settings,
  children,
}: {
  settings: BrandingSettings;
  children: React.ReactNode;
}) {
  return (
    <BrandingContext.Provider value={settings}>
      {children}
    </BrandingContext.Provider>
  );
}

export function useBranding() {
  const settings = useContext(BrandingContext);

  if (!settings) {
    throw new Error("useBranding must be used within a BrandingProvider");
  }

  return settings;
}

/** Versioned logo URL; the route sets long-lived private caching. */
export function brandingLogoUrl(settings: BrandingSettings) {
  if (!settings.hasLogo) return null;

  return `/api/branding/logo?v=${encodeURIComponent(
    settings.logoUpdatedAt ?? settings.updatedAt,
  )}`;
}
