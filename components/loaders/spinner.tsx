type SpinnerProps = {
  className?: string;
  label?: string;
};

export function Spinner({
  className = "size-10",
  label = "Loading",
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
          className="text-purple/20"
        />
        <path
          d="M24 4a20 20 0 0 1 20 20"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          className="text-purple"
        />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  );
}
