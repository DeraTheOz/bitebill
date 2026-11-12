import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { RecurringTemplateFormInput } from "../schemas/recurring-schema";

type RecurringDraftStore = {
  draft: Partial<RecurringTemplateFormInput> | null;
  setDraft: (values: Partial<RecurringTemplateFormInput>) => void;
  clearDraft: () => void;
};

/**
 * Persists in-progress recurring template form values in sessionStorage
 * so accidental drawer closes do not lose user input.
 */
export const useRecurringDraftStore = create<RecurringDraftStore>()(
  persist(
    (set) => ({
      draft: null,
      setDraft: (values) => set({ draft: values }),
      clearDraft: () => set({ draft: null }),
    }),
    {
      name: "bitebill:recurring-draft",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

