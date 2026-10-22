import { Wallet } from "lucide-react";

export function ClientMetricCard({
  label,
  value,
  hint,
  icon: Icon,
}: {
  label: string;
  value: string;
  hint: string;
  icon: typeof Wallet;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-transparent bg-surface p-4 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] dark:shadow-none ">
      <div className="flex items-center gap-3">
        <span className="grid size-9 shrink-0 place-items-center rounded-full bg-purple/10 text-purple">
          <Icon size={16} strokeWidth={2} />
        </span>
        <p className="tracking-[-0.1px] text-muted-light">{label}</p>
      </div>
      <p className=" text-[24px] font-bold tracking-[-0.5px] text-ink">
        {value}
      </p>
      <p className=" text-[13px] font-medium text-muted">{hint}</p>
    </div>
  );
}
