import Image from "next/image";

export function InvoiceEmptyState() {
  return (
    <div className="mx-auto flex max-w-60.5 flex-col items-center pt-18.75 text-center md:pt-19">
      <Image
        src="/assets/empty-invoices.svg"
        width={242}
        height={200}
        loading="eager"
        alt="No invoices yet"
      />
      <h2 className="mt-11.75 text-[24px] font-bold tracking-[-0.75px] text-ink">
        There is nothing here
      </h2>
      <p className="mt-6 text-[13px] font-medium leading-3.75 tracking-[-0.1px] text-muted-light">
        Create an invoice by clicking the
        <br />
        <strong className="font-bold">New Invoice</strong> button and get
        started
      </p>
    </div>
  );
}

export function InvoiceNoResultsState() {
  return (
    <div className="mx-auto flex max-w-80 flex-col items-center pt-18.75 text-center md:pt-19">
      <h2 className="text-[24px] font-bold tracking-[-0.75px] text-ink">
        No invoices found
      </h2>
      <p className="mt-6 text-[13px] font-medium leading-5 tracking-[-0.1px] text-muted-light">
        No invoices match the selected filters. Try changing or clearing them.
      </p>
    </div>
  );
}
