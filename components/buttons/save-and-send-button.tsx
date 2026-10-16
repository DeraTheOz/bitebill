import { Button, type ButtonProps } from "./button";

export function SaveAndSendButton({ className = "", ...props }: ButtonProps) {
  return (
    <Button
      {...props}
      className={`bg-button-purple text-white hover:bg-button-purple-light ${className}`}>
      Save &amp; Send
    </Button>
  );
}
