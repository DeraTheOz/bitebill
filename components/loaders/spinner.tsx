type SpinnerProps = {
  className?: string;
  label?: string;
  tone?: "brand" | "currentColor";
};

export function Spinner({
  className = "size-10",
  label = "Loading",
  tone = "brand",
}: SpinnerProps) {
  return (
    <span role="status" className="inline-flex">
      <svg
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
        className={`animate-spin ${className}`}>
        <circle
          cx="24"
          cy="24"
          r="20"
          stroke="currentColor"
          strokeWidth="4"
          className={tone === "brand" ? "text-purple/20" : "opacity-20"}
        />
        <path
          d="M24 4a20 20 0 0 1 20 20"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className={tone === "brand" ? "text-purple" : ""}
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}
