import { Trash2 } from "lucide-react";
import type { ButtonProps } from "./button";

export function RemoveItemButton({ className = "", ...props }: ButtonProps) {
  return (
    <button
      type="button"
      aria-label="Remove item"
      className={`text-button-muted-light transition-colors hover:text-button-danger ${className}`}
      {...props}>
      <Trash2 size={18} />
    </button>
  );
}
