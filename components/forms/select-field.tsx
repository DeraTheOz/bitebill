import type { ComponentPropsWithRef } from "react";
import { ChevronDown } from "lucide-react";

type SelectFieldProps = ComponentPropsWithRef<"select"> & {
  label: string;
  error?: string;
};

export function SelectField({
  label,
  error,
  id,
  className = "",
  children,
  ...props
}: SelectFieldProps) {
  const inputId = id ?? props.name;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-[13px] font-medium text-muted">
        {label}
      </label>
      <div className="relative">
        <select
          {...props}
          id={inputId}
          className={`h-12 w-full cursor-pointer appearance-none rounded border bg-surface px-4 pr-10 text-[15px] font-bold text-ink outline-none transition-colors focus:border-purple ${
            error ? "border-danger" : "border-border"
          } ${className}`}>
          {children}
        </select>
        <ChevronDown
          className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-light"
          aria-hidden="true"
        />
      </div>
      {error && <p className="text-[13px] font-medium text-danger">{error}</p>}
    </div>
  );
}
