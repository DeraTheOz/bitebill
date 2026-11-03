import type { ButtonProps } from "./button";

export function DeleteButton({
  className = "",
  type = "button",
  children = "Delete",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex h-11 md:h-12 w-full md:min-w-22.25 items-center justify-center rounded-3xl bg-button-danger px-4 md:px-6 text-sm md:text-[15px] font-bold text-white transition-colors hover:bg-button-danger-light ${className}`}
      {...props}>
      {children}
    </button>
  );
}
