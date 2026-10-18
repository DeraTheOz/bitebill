import { PageLoader } from "@/components/loaders/page-loader";

export default function InvoiceLoading() {
  return (
    <PageLoader
      className="pt-30 md:pt-32 lg:pt-19.25"
      label="Loading invoice…"
    />
  );
}
