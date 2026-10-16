import { Button, type ButtonProps } from "./button";

export function CancelButton({ className = "", ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      className={`bg-button-surface-subtle text-button-muted hover:bg-button-border ${className}`}>
      Cancel
    </Button>
  );
}
