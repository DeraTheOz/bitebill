import type { ReactNode } from "react";

export function FormSection({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h2 className="text-[15px] font-bold text-purple">{title}</h2>
      <div className="mt-6 space-y-6">{children}</div>
    </section>
  );
}
