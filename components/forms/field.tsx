export function Field({
  label,
  value,
  type = "text",
}: {
  label: string;
  value: string;
  type?: string;
}) {
  return (
    <label className="block text-[13px] font-medium text-muted">
      {label}
      <input
        type={type}
        defaultValue={value}
        className="mt-2 h-12 w-full rounded border border-border bg-surface caret-purple px-4 text-[15px] font-bold text-ink outline-none focus:border-purple"
      />
    </label>
  );
}
