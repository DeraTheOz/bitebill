import type { LucideIcon } from "lucide-react";

type StepHeaderProps = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export function StepHeader({
  icon: Icon,
  title,
  description,
}: StepHeaderProps) {
  return (
    <div className="flex items-start flex-wrap gap-4">
      <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-purple/10 text-purple">
        <Icon className="size-6" aria-hidden="true" />
      </span>
      <div>
        <h2 className="text-xl font-bold tracking-[-0.25px] text-ink sm:text-2xl">
          {title}
        </h2>
        <p className="mt-1.5 text-[15px] leading-relaxed text-muted">
          {description}
        </p>
      </div>
    </div>
  );
}
