export function ClientAvatar({
  name,
  image,
  className = "size-10 text-[13px]",
}: {
  name: string;
  image?: string | null;
  className?: string;
}) {
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- DiceBear avatars are self-contained SVG data URIs
      <img
        src={image}
        alt=""
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
      aria-hidden="true"
      className={`grid shrink-0 place-items-center rounded-full bg-purple/10 font-bold text-purple ${className}`}>
      {initials}
    </span>
  );
}
