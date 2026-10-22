import toast from "react-hot-toast";
import { useForm } from "react-hook-form";
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

  const {
    register,
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
        : defaultValues,
  });

  const label = mode === "edit" ? "Edit client" : "New client";

  async function onSubmit(values: ClientFormValues) {
    try {
      if (mode === "edit" && clientId) {
        await updateClient.mutateAsync({ id: clientId, values });
        toast.success("Client updated");
      } else {
        await createClient.mutateAsync(values);
        toast.success("Client added");
      }
      onClose();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Something went wrong",
      );
    }
  }

  return {
    label,
    errors,
    isSubmitting,
    existingClient,
    register,
    onSubmit,
    handleSubmit,
  };
}
