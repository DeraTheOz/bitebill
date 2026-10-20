import { Check, Link2 } from "lucide-react";
import Image from "next/image";
import { sharingPoints } from "@/features/landing/data/sharing";
import { Reveal } from "./reveal";


export function SharingSection() {
  return (
    <section id="sharing" className="scroll-mt-24">
      <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:gap-16 lg:py-24">
        <Reveal>
          <div className="relative mx-auto flex max-w-md items-center justify-center rounded-2xl border border-border bg-surface p-8 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] sm:p-12 dark:shadow-none">
            <Image
              src="/assets/empty-invoices.svg"
              width={280}
              height={232}
              loading="eager"
              alt="A paper airplane flying out of an envelope, representing shared invoices"
              className="w-full max-w-70"
            />
            <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-full border border-border bg-canvas px-3.5 py-2 text-[13px] font-bold text-ink">
              <Link2 className="size-3.5 text-purple" aria-hidden="true" />
              bitebill.app/share/8f3a&hellip;
            </div>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className="flex flex-col items-start gap-5">
            <p className="text-[13px] font-bold uppercase tracking-[0.15em] text-purple">
              Sharing &amp; privacy
            </p>
            <h2 className="text-3xl font-bold tracking-[-0.5px] text-ink sm:text-4xl">
              Share invoices without the back-and-forth.
            </h2>
            <p className="max-w-xl text-[15px] leading-relaxed text-muted sm:text-base">
              Send one link. Your client sees a polished, read-only invoice and
              can download the PDF. No login, no friction, no exposure of
              anything else.
            </p>
            <ul className="mt-1 flex flex-col gap-3">
              {sharingPoints.map((item) => (
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
          </div>
        </Reveal>
      </div>
    </section>
  );
}
