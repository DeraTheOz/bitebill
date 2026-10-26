import { Avatar } from "@/components/avatar";
import { copyClientId } from "../hooks/use-copy-client-id";
import { shortClientId } from "../lib/helpers";
import { formatDate } from "@/lib/format";
import { Client } from "../types/client";
import { Copy } from "lucide-react";
import { EditButton } from "@/components/buttons/edit-button";
import { DeleteButton } from "@/components/buttons/delete-button";

interface ClientHeaderProps {
  client: Client;
  onEdit: () => void;
  onDelete: () => void;
  isDeletePending?: boolean;
}

export function ClientHeader({
  client,
  onEdit,
  onDelete,
  isDeletePending = false,
}: ClientHeaderProps) {
  return (
    <div className="mt-5 rounded-lg bg-surface p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] md:mt-8 md:p-8">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div className="flex flex-wrap items-start gap-5">
          <Avatar
            name={client.name}
            image={client.image}
            className="size-16 text-[20px] md:size-20 md:text-[24px]"
          />
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
              <h1 className="text-[24px] font-bold tracking-[-0.5px] text-ink md:text-[28px]">
                {client.name}
              </h1>
              {client.company && (
                <span className="rounded-full bg-purple/10 px-3 py-1 text-[13px] font-bold tracking-[-0.1px] text-purple">
                  {client.company}
                </span>
              )}
            </div>
            <p className="mt-2 text-[13px] font-medium tracking-[-0.1px] text-muted-light">
              Client since {formatDate(client.createdAt)}
            </p>
            <button
              type="button"
              onClick={() => copyClientId(client.id)}
              className="mt-3 inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 font-mono text-[12px] font-medium text-muted transition-colors hover:border-purple hover:text-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple">
              <span title={client.id}>#{shortClientId(client.id)}</span>
              <Copy size={12} strokeWidth={2} aria-hidden="true" />
              <span className="font-sans">Copy ID</span>
            </button>
          </div>
        </div>

        <div className="gap-2 hidden shrink-0 md:flex">
          <EditButton onClick={onEdit} />
          <DeleteButton
            onClick={onDelete}
            disabled={isDeletePending}
            className="disabled:cursor-not-allowed disabled:opacity-60"
          />
        </div>
      </div>
    </div>
  );
}
