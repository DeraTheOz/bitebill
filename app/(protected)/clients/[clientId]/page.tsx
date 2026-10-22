import { ClientDetail } from "@/features/clients/components/client-detail";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({
  params,
}: PageProps<"/clients/[clientId]">) {
  const { clientId } = await params;

  return <ClientDetail clientId={clientId} />;
}
