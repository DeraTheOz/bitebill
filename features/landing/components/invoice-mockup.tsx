import { Clock, Download, Link2, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import { invoiceItems } from "@/features/landing/data/invoice-mockup";

const usd = (value: number) =>
  value.toLocaleString("en-US", { style: "currency", currency: "USD" });

const subtotal = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
const tax = subtotal * 0.1;
const total = subtotal + tax;

export function InvoiceMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 28 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
      className="relative">
      <div className="relative z-10 rounded-2xl border border-border bg-surface p-5 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] sm:p-7 dark:shadow-none">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-br-xl bg-purple">
              <span className="absolute bottom-0 left-0 h-1/2 w-full rounded-br-xl bg-purple-light [mask-image:url('/assets/logo-bg.svg')] mask-repeat:no-repeat mask-size-[100%_100%]" />
              <Image
                src="/assets/logo-white.svg"
                width={20}
                height={20}
                alt=""
                className="relative"
              />
            </span>
            <div>
              <p className="text-[15px] font-bold leading-tight text-ink">
                BiteBill Studio
              </p>
              <p className="text-[13px] font-medium text-muted-light">
                Invoice &middot; #INV-108
              </p>
            </div>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-status-paid/10 px-3 py-1 text-[13px] font-bold text-status-paid">
            <span className="size-1.5 rounded-full bg-status-paid" />
            Paid
          </span>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 border-t border-border pt-5 sm:grid-cols-3">
          <div>
            <p className="text-[13px] font-medium text-muted-light">
              Billed to
            </p>
            <p className="mt-1 text-[15px] font-bold text-ink">Jensen Harris</p>
            <p className="text-[13px] font-medium text-muted">
              harris@apexco.com
            </p>
          </div>
          <div>
            <p className="text-[13px] font-medium text-muted-light">Issued</p>
            <p className="mt-1 text-[15px] font-bold text-ink">Oct 1, 2026</p>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <p className="text-[13px] font-medium text-muted-light">Due</p>
            <p className="mt-1 text-[15px] font-bold text-ink">Oct 15, 2026</p>
          </div>
        </div>

        <table className="mt-5 w-full text-left">
          <caption className="sr-only">Invoice line items</caption>
          <thead>
            <tr className="border-b border-border text-[13px] font-bold text-muted-light">
              <th scope="col" className="pb-2.5 font-bold">
                Item
              </th>
              <th scope="col" className="pb-2.5 text-right font-bold">
                Qty
              </th>
              <th scope="col" className="pb-2.5 text-right font-bold">
                Amount
              </th>
            </tr>
          </thead>
          <tbody>
            {invoiceItems.map((item) => (
              <tr key={item.name} className="border-b border-border">
                <td className="py-3 pr-3 text-[15px] font-medium text-ink">
                  {item.name}
                </td>
                <td className="py-3 text-right text-[15px] font-medium text-muted">
                  {item.qty}
                </td>
                <td className="py-3 text-right text-[15px] font-bold text-ink">
                  {usd(item.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="mt-4 flex justify-end">
          <dl className="w-full max-w-56 space-y-2 text-[15px]">
            <div className="flex justify-between text-muted">
              <dt>Subtotal</dt>
              <dd>{usd(subtotal)}</dd>
            </div>
            <div className="flex justify-between text-muted">
              <dt>Tax (10%)</dt>
              <dd>{usd(tax)}</dd>
            </div>
            <div className="flex justify-between border-t border-border pt-2.5 font-bold text-ink">
              <dt>Total</dt>
              <dd className="text-purple">{usd(total)}</dd>
            </div>
          </dl>
        </div>

        <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-5">
          <span className="inline-flex h-10 items-center gap-2 rounded-full bg-button-purple px-4 text-[13px] font-bold text-white">
            <Download className="size-3.5" aria-hidden="true" />
            Download PDF
          </span>
          <span className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-[13px] font-bold text-muted">
            <Link2 className="size-3.5" aria-hidden="true" />
            Copy share link
          </span>
        </div>
      </div>

      <div className="absolute -top-5 right-2 z-20 hidden items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-[13px] font-bold text-ink shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.15)] sm:flex dark:shadow-none">
        <TrendingUp className="size-4 text-status-paid" aria-hidden="true" />
        Revenue trending up
      </div>

      <div className="absolute -bottom-5 left-2 z-20 hidden items-center gap-2 rounded-full border border-border bg-surface px-3.5 py-2 text-[13px] font-bold text-ink shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.15)] sm:flex dark:shadow-none">
        <Clock className="size-4 text-status-pending" aria-hidden="true" />
        Overdue detected automatically
      </div>
    </motion.div>
  );
}
