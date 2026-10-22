import { Mail, MapPin, Phone } from "lucide-react";
import { ClientContactRow } from "./client-contact-row";
import { formatDate, shortClientId } from "../lib/helpers";
import { Client } from "../types/client";

interface ClientInfoProps {
  client: Client;
  outstandingCount: number;
}

export function ClientInfoSection({
  client,
  outstandingCount,
}: ClientInfoProps) {
  const addressLines = [
    client.address.addressLine1,
    client.address.addressLine2,
    client.address.city,
    client.address.state,
    client.address.country,
  ].filter(Boolean);

  return (
    <div className="mt-4 grid gap-4 md:grid-cols-2">
      <section
        aria-labelledby="client-contact-heading"
        className="rounded-lg bg-surface p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] dark:shadow-none md:p-8">
        <h2
          id="client-contact-heading"
          className="text-[15px] font-bold text-purple">
          Contact
        </h2>
        <ul className="mt-5 space-y-5">
          {client.email && (
            <ClientContactRow icon={Mail} label="Email">
              <a
                href={`mailto:${client.email}`}
                className="break-all transition-colors hover:text-purple">
                {client.email}
              </a>
            </ClientContactRow>
          )}
          {client.phone && (
            <ClientContactRow icon={Phone} label="Phone">
              <a
                href={`tel:${client.phone}`}
                className="transition-colors hover:text-purple">
                {client.phone}
              </a>
            </ClientContactRow>
          )}
          <ClientContactRow icon={MapPin} label="Address">
            {addressLines.length > 0 ? (
              <span className="block text-[15px] leading-6 text-ink">
                {addressLines.map((line, index) => (
                  <span key={line}>
                    {index > 0 && <br />}
                    {line}
                  </span>
                ))}
              </span>
            ) : (
              <span className="text-[15px] font-medium text-muted-light">
                No address on file
              </span>
            )}
          </ClientContactRow>
        </ul>
      </section>

      <section
        aria-labelledby="client-details-heading"
        className="rounded-lg bg-surface p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] dark:shadow-none md:p-8">
        <h2
          id="client-details-heading"
          className="text-[15px] font-bold text-purple">
          Details
        </h2>
        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-5">
          <div>
            <dt className="text-[13px] text-muted">Client ID</dt>
            <dd className="mt-1.5 font-mono text-[15px] font-bold text-ink">
              #{shortClientId(client.id)}
            </dd>
          </div>
          <div>
            <dt className="text-[13px] text-muted">Date Added</dt>
            <dd className="mt-1.5 text-[15px] font-bold text-ink">
              {formatDate(client.createdAt)}
            </dd>
          </div>
          <div>
            <dt className="text-[13px] text-muted">Company</dt>
            <dd className="mt-1.5 truncate text-[15px] font-bold text-ink">
              {client.company || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-[13px] text-muted">City</dt>
            <dd className="mt-1.5 truncate text-[15px] font-bold text-ink">
              {client.address.city || "—"}
            </dd>
          </div>
          <div className="col-span-2">
            <dt className="text-[13px] text-muted">Status</dt>
            <dd className="mt-1.5">
              <span
                className={`inline-flex h-8 items-center gap-2 rounded-md px-3 text-[13px] font-bold tracking-[-0.1px] ${
                  outstandingCount > 0
                    ? "bg-status-pending/6 text-status-pending"
                    : "bg-status-paid/6 text-status-paid"
                }`}>
                <span className="size-2 rounded-full bg-current" />
                {outstandingCount > 0
                  ? `${outstandingCount} unpaid invoice${outstandingCount > 1 ? "s" : ""}`
                  : "All invoices settled"}
              </span>
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
