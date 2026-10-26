import { InvoiceDetailShell } from "@/features/invoices/components/invoice-detail-shell";

export default async function InvoiceDetailPage({
  params,
}: PageProps<"/invoices/[invoiceId]">) {
  const { invoiceId } = await params;

  return <InvoiceDetailShell invoiceId={invoiceId} />;
}
