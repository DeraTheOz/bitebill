import { Check } from "lucide-react";
import Image from "next/image";
import { included, paperItems, templates } from "@/features/landing/data/pdf";
import { Reveal } from "./reveal";

export function PdfSection() {
  return (
    <section id="pdf" className="scroll-mt-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <Reveal className="order-2 lg:order-1">
          <div className="flex flex-col items-start gap-5">
            <p className="text-[13px] font-bold uppercase tracking-[0.15em] text-purple">
              PDF export
            </p>
            <h2 className="text-3xl font-bold tracking-[-0.5px] text-ink sm:text-4xl">
              Documents that look like you mean it.
            </h2>
            <p className="max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
              Not screenshots. Not HTML exports. BiteBill generates real,
              print-ready PDFs on demand.
            </p>

            <ul className="mt-1 flex flex-col gap-3">
              {included.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-[15px] font-medium text-ink">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-purple/10">
                    <Check
                      className="size-3.5 text-purple"
                      aria-hidden="true"
                    />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-2 flex flex-wrap items-center gap-2.5">
              <span className="text-[13px] font-bold text-muted-light">
                Templates:
              </span>
              {templates.map((template) => (
                <span
                  key={template}
                  className="rounded-full border border-border bg-surface px-3.5 py-1.5 text-[13px] font-bold text-ink">
                  {template}
                </span>
              ))}
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1} className="order-1 lg:order-2">
          <div className="relative mx-auto w-full max-w-md">
            <div
              aria-hidden="true"
              className="absolute inset-0 translate-x-3 translate-y-3 rounded-xl border border-border bg-surface-subtle"
            />
            <div className="relative rotate-[-1.5deg] overflow-hidden rounded-xl border border-[#dfe3fa] bg-white p-6 text-[#0c0e16] shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.25)] sm:p-8">
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 grid place-items-center">
                <span className="rotate-[-24deg] text-4xl font-bold tracking-[0.2em] text-status-paid/30 sm:text-5xl">
                  PAID
                </span>
              </span>

              <div className="relative flex items-start justify-between gap-4">
                <div className="flex items-center gap-2.5">
                  <span className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-br-xl bg-purple">
                    <span className="absolute bottom-0 left-0 h-1/2 w-full rounded-br-xl bg-purple-light mask-[url('/assets/logo-bg.svg')] mask-repeat:no-repeat mask-size-[100%_100%]" />
                    <Image
                      src="/assets/logo-white.svg"
                      width={18}
                      height={18}
                      alt=""
                      className="relative"
                    />
                  </span>
                  <div>
                    <p className="text-[15px] font-bold leading-tight">
                      BiteBill Studio
                    </p>
                    <p className="text-[13px] font-medium text-[#7e88c3]">
                      studio@bitebill.app
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-[17px] font-bold tracking-[-0.25px]">
                    INVOICE
                  </p>
                  <p className="text-[13px] font-medium text-[#7e88c3]">
                    #INV-108
                  </p>
                </div>
              </div>

              <div className="relative mt-6 flex justify-between gap-4 border-t border-[#dfe3fa] pt-4 text-[13px]">
                <div>
                  <p className="font-medium text-[#7e88c3]">Billed to</p>
                  <p className="mt-0.5 font-bold">Jensen Harris</p>
                  <p className="text-[#7e88c3]">harris@apexco.com</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-[#7e88c3]">Due date</p>
                  <p className="mt-0.5 font-bold">Oct 15, 2026</p>
                </div>
              </div>

              <div className="relative mt-5 border-t border-[#dfe3fa]">
                {paperItems.map((item) => (
                  <div
                    key={item.name}
                    className="flex justify-between gap-4 border-b border-[#dfe3fa] py-2.5 text-[13px]">
                    <span className="font-medium">{item.name}</span>
                    <span className="font-bold">{item.amount}</span>
                  </div>
                ))}
                <div className="flex justify-between gap-4 pt-3 text-[15px] font-bold text-[#7c5dfa]">
                  <span>Total due</span>
                  <span>$5,159.00</span>
                </div>
              </div>

              <div className="relative mt-6 border-t border-dashed border-[#dfe3fa] pt-4">
                <p className="text-[11px] font-medium text-[#7e88c3]">
                  Payment due within 14 days of issue.
                </p>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
