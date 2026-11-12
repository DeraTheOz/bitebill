import type { RecurringFrequency } from "../types/recurring";

const frequencyLabels: Record<RecurringFrequency, string> = {
  monthly: "Monthly",
  quarterly: "Quarterly",
  yearly: "Yearly",
};

export function RecurringStatusBadge({ active }: { active: boolean }) {
  return (
    <span
      className={`flex h-10 w-26 items-center justify-center gap-2 rounded-md text-[15px] font-bold tracking-[-0.25px] ${
        active
          ? "bg-status-paid/6 text-status-paid"
          : "bg-status-pending/6 text-status-pending"
      }`}>
      <span className="size-2 rounded-full bg-current" />
      {active ? "Active" : "Paused"}
    </span>
  );
}

export function RecurringFrequencyBadge({
  frequency,
}: {
  frequency: RecurringFrequency;
}) {
  return (
    <span className="inline-flex items-center rounded-full bg-purple/10 px-3 py-1 text-[12px] font-bold text-purple">
      {frequencyLabels[frequency]}
    </span>
  );
}
