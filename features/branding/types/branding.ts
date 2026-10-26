export type PdfTemplate = "classic" | "modern" | "corporate";

export type BrandingSettings = {
  id: string;
  businessName: string;
  businessEmail: string;
  businessPhone: string | null;
  website: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  currency: string;
  invoicePrefix: string;
  defaultTerms: string | null;
  defaultPdfTemplate: PdfTemplate;
  brandColor: string;
  hasLogo: boolean;
  logoUpdatedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Logo bytes are only ever loaded server-side (route handler / PDF). */
export type BrandingLogo = {
  dataUrl: string;
  updatedAt: string;
};
