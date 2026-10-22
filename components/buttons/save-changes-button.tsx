import { Button, type ButtonProps } from "./button";

export function SaveChangesButton({
  className = "",
  children = "Save Changes",
  ...props
}: ButtonProps) {
  return (
    <Button
      {...props}
      className={`bg-button-purple text-white hover:bg-button-purple-light ${className}`}>
      {children}
    </Button>
  );
}
