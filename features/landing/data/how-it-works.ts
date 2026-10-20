export type Step = {
  number: string;
  title: string;
  description: string;
};

export const steps: Step[] = [
  {
    number: "1",
    title: "Add your clients once",
    description:
      "Save contact details, addresses, and notes, then reuse them on every invoice forever.",
  },
  {
    number: "2",
    title: "Build an invoice in seconds",
    description:
      "Invoice items, tax, terms, and notes, with totals always calculated on the server you can trust.",
  },
  {
    number: "3",
    title: "Send, share, collect",
    description:
      "Download a branded PDF, share a public link and mark it paid, with every step logged.",
  },
];
