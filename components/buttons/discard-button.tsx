import { Button, type ButtonProps } from "./button";

export function DiscardButton({ className = "", ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      className={`bg-button-surface-subtle text-button-muted ${className}`}>
      Discard
    </Button>
  );
}
