import type { ButtonProps } from "./button";

export function EditButton({
  className = "",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex h-11 md:h-12 w-full md:w-18.25 items-center justify-center rounded-3xl bg-button-dark px-4 md:px-6 text-sm md:text-[15px] font-bold text-white transition-colors hover:bg-button-secondary hover:text-button-muted-blue ${className}`}
      {...props}>
      Edit
    </button>
  );
}
