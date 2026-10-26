import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { clientsApi } from "../lib/api";
import type { ClientFormValues } from "../schemas/client-schema";
import type { ClientActivityFilter } from "../types/client";

export type ClientListQuery = {
  page: number;
  pageSize?: number;
  q?: string;
  activity?: ClientActivityFilter;
};

export const clientKeys = {
  all: ["clients"] as const,
  list: (params: ClientListQuery) => ["clients", "list", params] as const,
  detail: (id: string) => ["client", id] as const,
};

export function useClients(params: ClientListQuery) {
  return useQuery({
    queryKey: clientKeys.list(params),
    queryFn: () => clientsApi.list(params),
    // Keep the previous page visible while the next one loads. No
    // skeleton flash or layout shift when flipping pages.
    placeholderData: keepPreviousData,
  });
}

export function useClient(id: string) {
  return useQuery({
    queryKey: clientKeys.detail(id),
    queryFn: () => clientsApi.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: ClientFormValues) => clientsApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}

export function useUpdateClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: ClientFormValues }) =>
      clientsApi.update(id, values),
    onSuccess: (client) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      queryClient.setQueryData(clientKeys.detail(client.id), { client });
    },
  });
}

export function useDeleteClient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientsApi.remove(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      queryClient.removeQueries({ queryKey: clientKeys.detail(id) });
    },
  });
}
