import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { ClientFormValues } from "../schemas/client-schema";

type ClientDraftStore = {
  draft: Partial<ClientFormValues> | null;
  setDraft: (values: Partial<ClientFormValues>) => void;
  clearDraft: () => void;
};

/**
 * Persists the in-progress "create client" form values to sessionStorage.
 * Data survives accidental drawer closes but clears when the tab is closed.
 */
export const useClientDraftStore = create<ClientDraftStore>()(
  persist(
    (set) => ({
      draft: null,
      setDraft: (values) => set({ draft: values }),
      clearDraft: () => set({ draft: null }),
    }),
    {
      name: "bitebill:client-draft",
      storage: createJSONStorage(() => sessionStorage),
    },
  ),
);

