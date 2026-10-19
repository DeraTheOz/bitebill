export type MockupItem = {
  name: string;
  qty: number;
  amount: number;
};

export const invoiceItems: MockupItem[] = [
  { name: "Brand identity & logo design", qty: 1, amount: 1850 },
  { name: "Landing page design", qty: 3, amount: 1920 },
  { name: "Design system handoff", qty: 1, amount: 920 },
];
