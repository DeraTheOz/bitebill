import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Avatar } from "@/components/avatar";
import type { ClientListItem } from "../types/client";
import { formatDate } from "@/lib/format";

export function ClientList({ clients }: { clients: ClientListItem[] }) {
  return (
    <div className="space-y-4">
      {clients.map((client) => {
        const { invoiceCount } = client;

        return (
          <Link
            key={client.id}
            href={`/clients/${client.id}`}
            className="grid w-full grid-cols-[minmax(140px,1.3fr)_minmax(150px,1.5fr)_minmax(110px,1.1fr)_minmax(96px,1fr)_28px_14px] items-center gap-4 rounded-lg border border-transparent bg-surface px-6 py-6.25 text-left shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] transition-[border-color,transform] hover:-translate-y-0.5 hover:border-purple focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple dark:shadow-none max-[720px]:relative max-[720px]:block max-[720px]:h-33.5 max-[720px]:px-6 max-[720px]:py-0"
            aria-label={`Open client ${client.name}`}>
            <span className="flex items-center gap-4 max-[720px]:absolute max-[720px]:left-6 max-[720px]:top-5 max-[720px]:max-w-[calc(100%-5.5rem)]">
              <Avatar name={client.name} image={client.image} />

              <span className="min-w-0 max-[720px]:truncate">
                <span className="block truncate text-[15px] font-bold tracking-[-0.25px] text-ink">
                  {client.name}
                </span>
                <span className="mt-0.5 hidden text-[13px] font-medium tracking-[-0.1px] text-muted-light md:block">
                  {client.company || "Independent"}
                </span>
              </span>
            </span>

            <span className="truncate text-[13px] font-medium tracking-[-0.1px] text-muted-light max-[720px]:absolute max-[720px]:left-6 max-[720px]:top-22.5 max-[720px]:max-w-[calc(100%-7.5rem)] max-[720px]:truncate">
              {client.email || "—"}
            </span>

            <span className="truncate text-[15px] font-bold tracking-[-0.25px] text-ink max-[720px]:hidden">
              {client.company || "—"}
            </span>

            <span className="text-[13px] font-medium tracking-[-0.1px] text-muted-light max-[720px]:absolute max-[720px]:right-6 max-[720px]:top-22.5 max-[720px]:text-right">
              Added{" "}
              <span className="text-muted">{formatDate(client.createdAt)}</span>
            </span>

            <span
              className="grid size-7 place-items-center justify-self-end rounded-full bg-purple/10 text-[13px] font-bold text-purple max-[720px]:absolute max-[720px]:right-6 max-[720px]:top-5"
              aria-label={`${invoiceCount} invoices`}>
              {invoiceCount}
            </span>

            <ChevronRight
              size={18}
              strokeWidth={2}
              className="text-purple max-[720px]:hidden"
            />
          </Link>
        );
      })}
    </div>
  );
}
