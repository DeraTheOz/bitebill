"use client";

import {
  brandingLogoUrl,
  useBranding,
} from "@/features/branding/components/branding-provider";
import { BillFromView } from "./bill-from-view";

export function BillFrom({
  align = "left",
  className = "",
}: {
  align?: "left" | "right";
  className?: string;
}) {
  const branding = useBranding();
  const logoUrl = brandingLogoUrl(branding);

  return (
    <BillFromView
      branding={branding}
      logoUrl={logoUrl}
      align={align}
      className={className}
    />
  );
}
