export function Line({
  name,
  qty,
  unitPrice,
  total,
}: {
  name: string;
  qty: string;
  unitPrice: string;
  total: string;
}) {
  return (
    <div className="mt-7 grid grid-cols-[1fr_auto] items-center text-[15px] text-muted font-bold md:grid-cols-[1.6fr_.5fr_.9fr_.9fr]">
      <span className="text-ink">
        {name}
        <small className="mt-2 block text-[15px] font-bold text-muted md:hidden">
          {qty} x {unitPrice}
        </small>
      </span>

      <span className="hidden md:block">{qty}</span>
      <span className="hidden text-right md:block">{unitPrice}</span>
      <span className="text-right text-ink">{total}</span>
    </div>
  );
}
