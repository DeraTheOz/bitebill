import { Spinner } from "./spinner";

type PageLoaderProps = {
  label?: string;
  className?: string;
};

export function PageLoader({
  label = "Loading…",
  className = "",
}: PageLoaderProps) {
  return (
    <div
      className={`flex min-h-screen w-full flex-col items-center justify-center gap-6 px-6 ${className}`}>
      <Spinner label={label} />
      <p
        aria-hidden="true"
        className="text-[13px] font-medium tracking-[0.1px] text-muted-light">
        {label}
      </p>
    </div>
  );
}
