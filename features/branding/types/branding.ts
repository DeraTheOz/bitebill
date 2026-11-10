export type PdfTemplate = "classic" | "modern" | "corporate";

export type PublicBranding = {
  businessName: string;
  businessEmail: string;
  businessPhone: string | null;
  website: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  defaultTerms: string | null;
  brandColor: string;
  hasLogo: boolean;
  logoUpdatedAt: string | null;
};

export type BrandingSettings = PublicBranding & {
  id: string;
  currency: string;
  invoicePrefix: string;
  defaultPdfTemplate: PdfTemplate;
  createdAt: string;
  updatedAt: string;
};

/** Logo bytes are only ever loaded server-side (route handler / PDF). */
export type BrandingLogo = {
  dataUrl: string;
  updatedAt: string;
};
