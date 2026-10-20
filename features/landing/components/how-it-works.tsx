import { steps } from "@/features/landing/data/how-it-works";
import { Reveal } from "./reveal";

export function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <p className="text-[13px] font-bold uppercase tracking-[0.15em] text-purple">
            How it works
          </p>
          <h2 className="text-3xl font-bold tracking-[-0.5px] text-ink sm:text-4xl">
            From nothing to paid in three steps
          </h2>
        </Reveal>

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {steps.map((step, index) => (
            <Reveal key={step.number} delay={index * 0.08} className="h-full">
              <article className="flex h-full flex-col gap-4 rounded-2xl border border-border bg-surface p-7 transition-[border-color,transform] hover:-translate-y-1 hover:border-purple">
                <span className="grid size-10 place-items-center rounded-full bg-purple text-[15px] font-bold text-white">
                  {step.number}
                </span>
                <h3 className="text-[17px] font-bold tracking-[-0.25px] text-ink">
                  {step.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-muted">
                  {step.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
