import Image from "next/image";

export function ClientEmptyState() {
  return (
    <div className="mx-auto flex max-w-60.5 flex-col items-center pt-18.75 text-center md:pt-19">
      <Image
        src="/assets/empty-invoices.svg"
        width={242}
        height={200}
        loading="eager"
        alt="No clients yet"
      />
      <h2 className="mt-11.75 text-[24px] font-bold tracking-[-0.75px] text-ink">
        There is nothing here
      </h2>
      <p className="mt-6 text-[13px] font-medium leading-3.75 tracking-[-0.1px] text-muted-light">
        Add a client by clicking the
        <br />
        <strong className="font-bold">New Client</strong> button and get started
      </p>
    </div>
  );
}

export function ClientNoResultsState() {
  return (
    <div className="mx-auto flex max-w-80 flex-col items-center pt-18.75 text-center md:pt-19">
      <h2 className="text-[24px] font-bold tracking-[-0.75px] text-ink">
        No clients found
      </h2>
      <p className="mt-6 text-[13px] font-medium leading-5 tracking-[-0.1px] text-muted-light">
        No clients match your search. Try adjusting the search term.
      </p>
    </div>
  );
}
