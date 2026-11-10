import { BillFromView } from "@/features/branding/components/bill-from";
import type { PublicBranding } from "@/features/branding/types/branding";
import type { ClientAddress } from "@/features/clients/types/client";
import { formatDate, formatMoney } from "@/lib/format";
import type { InvoiceItem } from "../types/invoice";
import { Info } from "./invoice-info";
import { Line } from "./invoice-line";

export type InvoiceDocumentClient = {
  name: string;
  email: string | null;
  address: ClientAddress;
};

export type InvoiceDocumentData = {
  invoiceNumber: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  subtotal: number;
  taxRate: number;
  tax: number;
  discount: number;
  total: number;
  publicNotes: string | null;
  client: InvoiceDocumentClient | null;
  items: InvoiceItem[];
};

type InvoiceDocumentBranding = Pick<
  PublicBranding,
  | "businessName"
  | "businessEmail"
  | "businessPhone"
  | "website"
  | "addressLine1"
  | "addressLine2"
  | "city"
  | "state"
  | "country"
>;

export function InvoiceDocument({
  invoice,
  branding,
  logoUrl,
}: {
  invoice: InvoiceDocumentData;
  branding: InvoiceDocumentBranding;
  logoUrl: string | null;
}) {
  const client = invoice.client;
  const addressLines = client
    ? [
        client.address.addressLine1,
        client.address.addressLine2,
        client.address.city,
        client.address.state,
        client.address.country,
      ].filter((line): line is string => Boolean(line))
    : [];

  return (
    <article className="mt-4 rounded-lg bg-surface px-6 py-7 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] dark:shadow-none md:mt-6 md:px-8 md:py-8 lg:px-12 lg:py-10">
      <div className="flex flex-col gap-7 min-h-34.75 justify-between md:flex-row md:min-h-0">
        <div>
          <h1 className="text-[15px] font-bold">
            <span className="text-muted-light">#</span>
            {invoice.invoiceNumber}
          </h1>
          {invoice.publicNotes && (
            <p className="mt-2 text-[13px] text-muted">{invoice.publicNotes}</p>
          )}
        </div>

        <BillFromView branding={branding} logoUrl={logoUrl} align="right" />
      </div>

      <div className="mt-7 grid grid-cols-2 grid-rows-[48px_48px_48px] gap-y-7.75 md:mt-10 md:grid-cols-3 md:grid-rows-none">
        <div className="flex flex-col gap-7 justify-between">
          <Info label="Invoice Date" value={formatDate(invoice.issueDate)} />
          <Info label="Payment Due" value={formatDate(invoice.dueDate)} />
        </div>

        <Info
          className="col-start-2 row-span-2 row-start-1 md:col-auto md:row-auto"
          label="Bill To"
          value={client?.name ?? "—"}>
          {addressLines.length > 0 && (
            <p className="mt-2 whitespace-pre-line text-[13px] leading-4.5 text-muted">
              {addressLines.join("\n")}
            </p>
          )}
        </Info>

        <Info label="Sent to" value={client?.email ?? "—"} />
      </div>

      <div className="mt-10 overflow-hidden rounded-lg">
        <div className="bg-surface-subtle p-6 md:p-8">
          <div className="hidden grid-cols-[1.4fr_.7fr_1fr_1.1fr] text-[13px] text-muted md:grid">
            <span>Item Name</span>
            <span>Quantity</span>
            <span className="text-right">Price</span>
            <span className="text-right">Total</span>
          </div>

          {invoice.items.map((item) => (
            <Line
              key={item.id}
              name={item.name}
              quantity={String(item.quantity)}
              unitPrice={formatMoney(item.unitPrice, invoice.currency)}
              total={formatMoney(item.total, invoice.currency)}
            />
          ))}

          <div className="mt-8 space-y-2 border-t border-border pt-4 text-[13px] font-medium text-muted md:mt-10">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <span className="shrink-0">Subtotal</span>
              <span className="font-bold text-ink text-right wrap-break-word">
                {formatMoney(invoice.subtotal, invoice.currency)}
              </span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <span className="shrink-0">Discount</span>
                <span className="font-bold text-ink text-right wrap-break-word">
                  −{formatMoney(invoice.discount, invoice.currency)}
                </span>
              </div>
            )}
            {invoice.taxRate > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
                <span className="shrink-0">Tax ({invoice.taxRate}%)</span>
                <span className="font-bold text-ink text-right wrap-break-word">
                  {formatMoney(invoice.tax, invoice.currency)}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1.5 bg-sidebar px-6 py-6 text-white dark:bg-deep md:px-8">
          <span className="text-[13px] text-muted-light sm:text-white shrink-0">
            Amount Due
          </span>
          <strong className="text-[20px] sm:text-[24px] tracking-[-0.5px] wrap-break-word text-right flex-1 sm:flex-initial">
            {formatMoney(invoice.total, invoice.currency)}
          </strong>
        </div>
      </div>
    </article>
  );
}

