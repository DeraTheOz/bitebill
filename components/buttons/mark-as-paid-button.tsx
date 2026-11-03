import type { ButtonProps } from "./button";

export function MarkAsPaidButton({
  className = "",
  type = "button",
  children = "Mark as Paid",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex h-11 md:h-12 w-full md:w-32.75 items-center justify-center rounded-3xl bg-button-purple px-4 md:px-5 text-sm md:text-[15px] font-bold text-white transition-colors hover:bg-button-purple-light ${className}`}
      {...props}>
      {children}
    </button>
  );
}
