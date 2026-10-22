import { Mail } from "lucide-react";
import { ReactNode } from "react";

export function ClientContactRow({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof Mail;
  label: string;
  children: ReactNode;
}) {
  return (
    <li className="flex items-start gap-3">
      <span className="grid size-9 shrink-0 place-items-center rounded-full bg-purple/10 text-purple">
        <Icon size={16} strokeWidth={2} />
      </span>
      <div className="min-w-0">
        <p className="text-[13px] text-muted">{label}</p>
        <div className="mt-1 text-[15px] font-bold text-ink">{children}</div>
      </div>
    </li>
  );
}
