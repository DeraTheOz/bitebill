import { Button, type ButtonProps } from "./button";

export function SaveAsDraftButton({ className = "", ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      className={`bg-button-sidebar text-button-muted-light hover:bg-button-deep dark:hover:bg-button-dark-hover ${className}`}>
      Save as Draft
    </Button>
  );
}
