import type { ButtonHTMLAttributes } from "react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function Button({
  type = "button",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`h-12 rounded-full px-4 text-[15px] font-bold sm:px-6 transition-colors ${className}`}
      {...props}
    />
  );
}
