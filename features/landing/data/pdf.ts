export type PaperItem = {
  name: string;
  amount: string;
};

/** Available PDF template names listed in the landing PDF showcase. */
export const templates = ["Classic", "Modern", "Corporate"];

/** Feature highlights displayed alongside the landing PDF preview. */
export const included = [
  "Your logo, colors, and company details",
  "Client info, invoice items, and payment terms",
  "Status watermarks. Paid, Pending, or Overdue",
  "Optional tax and discount breakdowns",
];

/** Sample line items rendered on the landing page paper invoice preview. */
export const paperItems: PaperItem[] = [
  { name: "Brand identity & logo design", amount: "$1,850.00" },
  { name: "Landing page design", amount: "$1,920.00" },
  { name: "Design system handoff", amount: "$920.00" },
];
