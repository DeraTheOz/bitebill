import { NotFoundState } from "@/components/errors/not-found-state";

export default function InvoiceNotFound() {
  return (
    <NotFoundState
      title="Invoice not found"
      description="This invoice may have been deleted or is no longer available."
      href="/invoices"
      actionLabel="Back to invoices"
    />
  );
}
