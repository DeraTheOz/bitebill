import { RecurringDetailShell } from "@/features/recurring-invoices/components/recurring-detail-shell";

export default async function RecurringTemplateDetailPage({
  params,
}: PageProps<"/recurring-invoices/[templateId]">) {
  const { templateId } = await params;

  return <RecurringDetailShell templateId={templateId} />;
}

