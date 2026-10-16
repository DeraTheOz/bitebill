import type { ComponentPropsWithRef } from "react";

type TextAreaFieldProps = ComponentPropsWithRef<"textarea"> & {
  label: string;
  error?: string;
};

export function TextAreaField({
  label,
  error,
  id,
  className = "",
  ...props
}: TextAreaFieldProps) {
  const fieldId = id ?? props.name;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={fieldId} className="text-[13px] font-medium text-muted">
        {label}
      </label>
      <textarea
        {...props}
        id={fieldId}
        aria-invalid={error ? true : undefined}
        className={`min-h-24 w-full resize-y rounded border bg-surface px-4 py-3 text-[15px] font-medium text-ink caret-purple outline-none transition-colors placeholder:text-muted-light focus:border-purple disabled:cursor-not-allowed disabled:opacity-60 ${
          error ? "border-danger" : "border-border"
        } ${className}`}
      />
      {error && <p className="text-[13px] font-medium text-danger">{error}</p>}
    </div>
  );
}
