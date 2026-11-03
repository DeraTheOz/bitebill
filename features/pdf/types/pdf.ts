import type { Invoice } from "@/features/invoices/types/invoice";
import type {
  BrandingSettings,
  PdfTemplate,
} from "@/features/branding/types/branding";

export interface LogoData {
  bytes: Uint8Array;
  type: "png" | "jpeg";
}

export interface GeneratePdfOptions {
  invoice: Invoice;
  branding: BrandingSettings;
  logo?: LogoData | null;
  template?: PdfTemplate;
}

export interface TemplateRenderContext {
  invoice: Invoice;
  branding: BrandingSettings;
  logo?: LogoData | null;
}

