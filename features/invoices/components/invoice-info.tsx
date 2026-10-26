import type { ReactNode } from "react";

export function Info({
  label,
  value,
  className,
  children,
}: {
  label: string;
  value: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={className}>
      <p className="text-[13px] text-muted">{label}</p>
      <p className="mt-3 text-[15px] font-bold">{value}</p>
      {children}
    </div>
  );
}
