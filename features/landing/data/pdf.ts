export type PaperItem = {
  name: string;
  amount: string;
};

export const templates = ["Classic", "Modern", "Corporate"];

export const included = [
  "Your logo, colors, and company details",
  "Client info, invoice items, and payment terms",
  "Status watermarks. Paid, Pending, or Overdue",
  "Optional tax and discount breakdowns",
];

export const paperItems: PaperItem[] = [
  { name: "Brand identity & logo design", amount: "$1,850.00" },
  { name: "Landing page design", amount: "$1,920.00" },
  { name: "Design system handoff", amount: "$920.00" },
];
