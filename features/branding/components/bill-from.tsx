"use client";

import { Fragment } from "react";
import {
  brandingLogoUrl,
  useBranding,
} from "@/features/branding/components/branding-provider";

export function BillFrom({
  align = "left",
  className = "",
}: {
  align?: "left" | "right";
  className?: string;
}) {
  const branding = useBranding();
  const logoUrl = brandingLogoUrl(branding);

  const cityState = [branding.city, branding.state]
    .filter(Boolean)
    .join(", ");

  const lines = [
    branding.businessEmail,
    branding.businessPhone,
    branding.website,
    branding.addressLine1,
    branding.addressLine2,
    cityState || null,
    branding.country,
  ].filter((line): line is string => Boolean(line));

  return (
    <div
      className={`flex flex-col gap-3 ${
        align === "right" ? "items-end text-right" : ""
      } ${className}`}>
      {logoUrl && (
        // Plain img: the route is already cached and versioned, and
        // data-URL sources do not benefit from the image optimizer.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={logoUrl}
          alt={`${branding.businessName} logo`}
          className="h-10 w-auto max-w-40 object-contain"
        />
      )}

      <div>
        <p className="text-[15px] font-bold text-ink">
          {branding.businessName}
        </p>
        <address className="mt-1 text-[13px] leading-4.5 not-italic text-muted">
          {lines.map((line, index) => (
            <Fragment key={`${line}-${index}`}>
              {line}
              {index < lines.length - 1 && <br />}
            </Fragment>
          ))}
        </address>
      </div>
    </div>
  );
}
