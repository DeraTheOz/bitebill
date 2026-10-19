import Image from "next/image";
import Link from "next/link";

type BrandLockupProps = {
  className?: string;
};

export function BrandLockup({ className = "" }: BrandLockupProps) {
  return (
    <Link
      href="/"
      aria-label="BiteBill home"
      className={`flex items-center gap-2.5 rounded-sm ${className}`}>
      <div className="relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-br-xl bg-purple">
        <div className="absolute bottom-0 left-0 h-1/2 w-full rounded-br-xl bg-purple-light mask-[url('/assets/logo-bg.svg')] mask-repeat:no-repeat mask-size-[100%_100%]" />
        <Image
          src="/assets/logo-white.svg"
          width={18}
          height={18}
          alt=""
          className="relative"
        />
      </div>
      <span className="text-lg font-bold tracking-wider text-ink">
        BiteBill
      </span>
    </Link>
  );
}
