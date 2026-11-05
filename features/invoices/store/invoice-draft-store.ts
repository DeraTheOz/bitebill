import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { z } from "zod";
import type { invoiceFormSchema } from "../schemas/invoice-schema";

/** Raw form input type (before Zod coercion). */
export type InvoiceFormInput = z.input<typeof invoiceFormSchema>;

type InvoiceDraftStore = {
  draft: Partial<InvoiceFormInput> | null;
  setDraft: (values: Partial<InvoiceFormInput>) => void;
  clearDraft: () => void;
};

/**
 * Persists the in-progress "create invoice" form values to sessionStorage.
 * Data survives accidental drawer closes but clears when the tab is closed.
 */
export const useInvoiceDraftStore = create<InvoiceDraftStore>()(
  persist(
    (set) => ({
      draft: null,
      setDraft: (values) => set({ draft: values }),
      clearDraft: () => set({ draft: null }),
    }),
    {
      name: "bitebill:invoice-draft",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

