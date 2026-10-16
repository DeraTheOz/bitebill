import { Button, type ButtonProps } from "./button";

export function AddNewItemButton({ className = "", ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      className={`w-full bg-button-surface-subtle text-button-muted transition-colors hover:bg-button-border ${className}`}>
      + Add New Item
    </Button>
  );
}
