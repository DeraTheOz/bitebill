import { useEffect } from "react";
import toast from "react-hot-toast";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  clientFormSchema,
  type ClientFormValues,
} from "../schemas/client-schema";
import {
  useClient,
  useCreateClient,
  useUpdateClient,
} from "./use-client-queries";
import { useClientDraftStore } from "../store/client-draft-store";

const defaultValues: ClientFormValues = {
  name: "",
  email: "",
  phone: "",
  company: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  notes: "",
};

export function useClientFormDrawer(
  mode: string,
  onClose: () => void,
  clientId?: string,
) {
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const { data: existingClient } = useClient(clientId ?? "");

  const { draft, setDraft, clearDraft } = useClientDraftStore();

  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues:
      mode === "edit" && existingClient
        ? {
            name: existingClient.name,
            email: existingClient.email ?? "",
            phone: existingClient.phone ?? "",
            company: existingClient.company ?? "",
            addressLine1: existingClient.address.addressLine1 ?? "",
            addressLine2: existingClient.address.addressLine2 ?? "",
            city: existingClient.address.city ?? "",
            state: existingClient.address.state ?? "",
            country: existingClient.address.country ?? "",
            notes: existingClient.notes ?? "",
          }
        : // Restore persisted draft in create mode so accidental closes don't lose work.
          (draft as ClientFormValues | null) ?? defaultValues,
  });

  const label = mode === "edit" ? "Edit client" : "New client";

  // Persist draft as the user types (create mode only).
  const allValues = useWatch({ control });
  useEffect(() => {
    if (mode !== "create") return;
    setDraft(allValues as Partial<ClientFormValues>);
  }, [mode, allValues, setDraft]);

  async function onSubmit(values: ClientFormValues) {
    try {
      if (mode === "edit" && clientId) {
        await updateClient.mutateAsync({ id: clientId, values });
        toast.success("Client updated");
      } else {
        await createClient.mutateAsync(values);
        toast.success("Client added");
        // Clear the persisted draft now that it's been saved to the server.
        clearDraft();
      }
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  }

  /** Called by the Discard button to intentionally wipe the draft. */
  function discard() {
    clearDraft();
    onClose();
  }

  return {
    label,
    errors,
    isSubmitting,
    existingClient,
    register,
    onSubmit,
    discard,
    handleSubmit,
    hasDraft: mode === "create" && draft !== null,
  };
}
