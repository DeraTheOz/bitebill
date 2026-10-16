import type { ComponentPropsWithRef } from "react";
import { ChevronDown } from "lucide-react";

type ColorOption = {
  value: string;
  name: string;
};

type ColorSelectFieldProps = Omit<
  ComponentPropsWithRef<"select">,
  "children"
> & {
  label: string;
  error?: string;
  colors: readonly ColorOption[];
};

export function ColorSelectField({
  label,
  error,
  id,
  colors,
  value,
  className = "",
  ...props
}: ColorSelectFieldProps) {
  const inputId = id ?? props.name;
  const current = String(value ?? "");
  const selected = colors.find((color) => color.value === current) ?? colors[0];

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-[13px] font-medium text-muted">
        {label}
      </label>
      <div
        className={`relative flex h-12 w-full items-center gap-3 rounded border bg-surface px-4 transition-colors focus-within:border-purple ${
          error ? "border-danger" : "border-border"
        }`}>
        <span
          className="size-5 shrink-0 rounded-full border border-black/10"
          style={{ backgroundColor: selected.value }}
        />
        <span className="text-[15px] font-bold text-ink">
          {selected.name}
        </span>
        <ChevronDown
          className="ml-auto size-4 shrink-0 text-muted-light"
          aria-hidden="true"
        />
        <select
          {...props}
          id={inputId}
          value={value}
          className={`absolute inset-0 h-full w-full cursor-pointer appearance-none bg-surface px-4 text-[15px] font-bold text-ink opacity-0 ${className}`}>
          {colors.map((color) => (
            <option key={color.value} value={color.value}>
              {color.name}
            </option>
          ))}
        </select>
      </div>
      {error && <p className="text-[13px] font-medium text-danger">{error}</p>}
    </div>
  );
}
