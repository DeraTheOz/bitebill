import type { ButtonProps } from "./button";

export function DeleteButton({
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`h-12 w-22.25 rounded-3xl bg-button-danger px-6 text-[15px] font-bold text-white transition-colors hover:bg-button-danger-light ${className}`}
      {...props}>
      Delete
    </button>
  );
}
