import type { ButtonProps } from "./button";

export function EditButton({
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`h-12 w-18.25 rounded-3xl bg-button-dark px-6 text-[15px] font-bold text-white transition-colors hover:bg-button-secondary hover:text-button-muted-blue ${className}`}
      {...props}>
      Edit
    </button>
  );
}
