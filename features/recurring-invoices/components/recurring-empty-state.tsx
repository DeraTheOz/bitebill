import Image from "next/image";

export function RecurringEmptyState() {
  return (
    <div className="mx-auto flex max-w-68 flex-col items-center pt-18.75 text-center md:pt-19">
      <Image
        src="/assets/empty-invoices.svg"
        width={242}
        height={200}
        loading="eager"
        alt="No recurring invoices yet"
      />
      <h2 className="mt-11.75 text-[24px] font-bold tracking-[-0.75px] text-ink">
        No recurring invoices
      </h2>
      <p className="mt-6 text-[13px] font-medium leading-5 tracking-[-0.1px] text-muted-light">
        Automate monthly, quarterly, or annual billing by clicking{" "}
        <strong className="font-bold">New Recurring</strong>
      </p>
    </div>
  );
}

export function RecurringNoResultsState() {
  return (
    <div className="mx-auto flex max-w-80 flex-col items-center pt-18.75 text-center md:pt-19">
      <h2 className="text-[24px] font-bold tracking-[-0.75px] text-ink">
        No recurring invoices found
      </h2>
      <p className="mt-6 text-[13px] font-medium leading-5 tracking-[-0.1px] text-muted-light">
        No recurring invoices match your search or filters. Try changing or
        clearing them.
      </p>
    </div>
  );
}

