import type { ButtonProps } from "./button";

export function MarkAsPaidButton({
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`h-12 w-32.75 rounded-3xl bg-button-purple px-5 text-[15px] font-bold text-white transition-colors hover:bg-button-purple-light ${className}`}
      {...props}>
      Mark as Paid
    </button>
  );
}
