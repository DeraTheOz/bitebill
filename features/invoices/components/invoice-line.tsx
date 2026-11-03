export function Line({
  name,
  quantity,
  unitPrice,
  total,
}: {
  name: string;
  quantity: string;
  unitPrice: string;
  total: string;
}) {
  return (
    <div className="mt-5 flex flex-col gap-1.5 border-b border-border/40 pb-5 text-[15px] font-bold text-muted last:border-b-0 last:pb-0 md:mt-7 md:grid md:grid-cols-[1.4fr_.7fr_1fr_1.1fr] md:items-center md:gap-0 md:border-b-0 md:pb-0">
      {/* Item Name */}
      <span className="text-ink wrap-break-word font-bold">{name}</span>

      {/* Mobile Meta Row: Quantity x Price and Total */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[13px] md:hidden">
        <span className="font-bold text-muted">
          {quantity} × {unitPrice}
        </span>
        <span className="font-bold text-ink text-right wrap-break-word">
          {total}
        </span>
      </div>

      {/* Desktop Columns */}
      <span className="hidden md:block">{quantity}</span>
      <span className="hidden text-right md:block">{unitPrice}</span>
      <span className="hidden text-right text-ink md:block">{total}</span>
    </div>
  );
}
