import { features } from "@/features/landing/data/features";
import { Reveal } from "./reveal";

export function FeatureGrid() {
  return (
    <section id="features" className="scroll-mt-24">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
        <Reveal className="mx-auto flex max-w-2xl flex-col items-center gap-4 text-center">
          <p className="text-[13px] font-bold uppercase tracking-[0.15em] text-purple">
            Features
          </p>
          <h2 className="text-3xl font-bold tracking-[-0.5px] text-ink sm:text-4xl">
            Everything you need to run your invoicing
          </h2>
          <p className="text-[15px] leading-relaxed text-muted sm:text-base">
            From the first draft to the final payment, every part of the
            workflow lives in one place. Fast, type-safe, and built to scale
            with you.
          </p>
        </Reveal>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <Reveal
              key={feature.title}
              delay={(index % 4) * 0.06}
              className="h-full">
              <article className="group flex h-full flex-col gap-3.5 rounded-2xl border border-border bg-surface p-6 transition-[border-color,transform] hover:-translate-y-1 hover:border-purple">
                <span className="grid size-11 place-items-center rounded-xl bg-purple/10 text-purple transition-colors group-hover:bg-purple group-hover:text-white">
                  <feature.icon className="size-5" aria-hidden="true" />
                </span>
                <h3 className="text-[17px] font-bold tracking-[-0.25px] text-ink">
                  {feature.title}
                </h3>
                <p className="text-[15px] leading-relaxed text-muted">
                  {feature.description}
                </p>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
