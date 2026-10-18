import Link from "next/link";

type NotFoundStateProps = {
  title?: string;
  description?: string;
  href?: string;
  actionLabel?: string;
  className?: string;
};

export function NotFoundState({
  title = "Page not found",
  description = "The page you are looking for does not exist or has been moved.",
  href = "/",
  actionLabel = "Back to home",
  className = "",
}: NotFoundStateProps) {
  return (
    <div
      className={`flex min-h-screen w-full flex-col items-center justify-center gap-6 px-6 text-center ${className}`}>
      <p className="font-mono text-[72px] font-bold leading-none tracking-[-2px] text-purple">
        404
      </p>
      <div className="flex flex-col gap-2">
        <h1 className="text-[24px] font-bold tracking-[-0.5px] text-ink">
          {title}
        </h1>
        <p className="max-w-md text-[13px] font-medium leading-5 text-muted-light">
          {description}
        </p>
      </div>
      <Link
        href={href}
        className="grid h-12 place-items-center rounded-full bg-purple px-6 text-[15px] font-bold text-white transition-colors hover:bg-purple-light focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple">
        {actionLabel}
      </Link>
    </div>
  );
}
