import type { ComponentPropsWithRef } from "react";

type TextFieldProps = ComponentPropsWithRef<"input"> & {
  label: string;
  error?: string;
};

export function TextField({
  label,
  error,
  id,
  className = "",
  ...props
}: TextFieldProps) {
  const inputId = id ?? props.name;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={inputId} className="text-[13px] font-medium text-muted">
        {label}
      </label>
      <input
        {...props}
        id={inputId}
        aria-invalid={error ? true : undefined}
        className={`h-12 w-full rounded border bg-surface px-4 text-[15px] font-bold text-ink caret-purple outline-none transition-colors placeholder:font-medium placeholder:text-muted-light focus:border-purple disabled:cursor-not-allowed disabled:opacity-60 ${
          error ? "border-danger" : "border-border"
        } ${className}`}
      />
      {error && <p className="text-[13px] font-medium text-danger">{error}</p>}
    </div>
  );
}
