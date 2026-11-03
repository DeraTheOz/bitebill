export type MockupItem = {
  name: string;
  quantity: number;
  amount: number;
};

export const invoiceItems: MockupItem[] = [
  { name: "Brand identity & logo design", quantity: 1, amount: 1850 },
  { name: "Landing page design", quantity: 3, amount: 1920 },
  { name: "Design system handoff", quantity: 1, amount: 920 },
];
