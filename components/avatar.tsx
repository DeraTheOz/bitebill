export function Avatar({
  name,
  image,
  alt = "",
  className = "size-10 text-[13px]",
}: {
  name: string;
  image?: string | null;
  alt?: string;
  className?: string;
}) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- remote OAuth and self-contained SVG data URIs
      <img
        src={image}
        alt={alt}
        className={`shrink-0 rounded-full bg-purple/10 object-cover ${className}`}
      />
    );
  }

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <span
      aria-hidden={alt ? undefined : "true"}
      aria-label={alt || undefined}
      className={`grid shrink-0 place-items-center rounded-full bg-purple/10 font-bold text-purple ${className}`}>
      {initials}
    </span>
  );
}
