"use client";

import { useState, type ComponentPropsWithRef } from "react";
import { Eye, EyeOff } from "lucide-react";

type TextFieldProps = ComponentPropsWithRef<"input"> & {
  label?: string;
  error?: string;
};

export function TextField({
  label,
  error,
  id,
  type = "text",
  disabled,
  className = "",
  ...props
}: TextFieldProps) {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id ?? props.name;
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  const inputElement = (
    <input
      {...props}
      id={inputId}
      type={inputType}
      disabled={disabled}
      aria-invalid={error ? true : undefined}
      className={`h-12 w-full rounded border bg-surface pl-4 ${
        // Hide Edge/IE's built-in reveal icon so it doesn't duplicate our toggle.
        isPassword ? "pr-12 [&::-ms-clear]:hidden [&::-ms-reveal]:hidden" : "pr-4"
      } text-[15px] font-bold text-ink caret-purple outline-none transition-colors placeholder:font-medium placeholder:text-muted-light focus:border-purple disabled:cursor-not-allowed disabled:opacity-60 ${
        error ? "border-danger" : "border-border"
      } ${className}`}
    />
  );

  return (
    <div className="flex flex-col gap-2">
      {Boolean(label) && (
        <label htmlFor={inputId} className="text-[13px] font-medium text-muted">
          {label}
        </label>
      )}
      {isPassword ? (
        <div className="relative">
          {inputElement}
          <button
            type="button"
            disabled={disabled}
            onClick={() => setShowPassword((prev) => !prev)}
            onMouseDown={(event) => event.preventDefault()}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-controls={inputId}
            className="absolute right-2.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded text-muted-light transition-colors hover:text-purple focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:text-muted-light">
            {showPassword ? (
              <EyeOff className="size-4.5" aria-hidden="true" />
            ) : (
              <Eye className="size-4.5" aria-hidden="true" />
            )}
          </button>
        </div>
      ) : (
        inputElement
      )}
      {error && (
        <p className="text-[12px] font-medium leading-tight text-danger sm:text-[13px]">
          {error}
        </p>
      )}
    </div>
  );
}
