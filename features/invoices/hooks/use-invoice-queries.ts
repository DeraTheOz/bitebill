import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { clientKeys } from "@/features/clients/hooks/use-client-queries";
import { invoicesApi, type InvoiceListRequest } from "../lib/api";
import type {
  InvoiceFormValues,
  InvoiceStatusIntent,
} from "../schemas/invoice-schema";

// List and detail share the ["invoices"] prefix so a single
// invalidateQueries({ queryKey: invoiceKeys.all }) refreshes both.
export const invoiceKeys = {
  all: ["invoices"] as const,
  list: (params: InvoiceListRequest) =>
    ["invoices", "list", params] as const,
  detail: (id: string) => ["invoices", "detail", id] as const,
};

export function useInvoices(params: InvoiceListRequest) {
  return useQuery({
    queryKey: invoiceKeys.list(params),
    queryFn: () => invoicesApi.list(params),
    // Keep the previous page visible while the next one loads.
    placeholderData: keepPreviousData,
  });
}

export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => invoicesApi.get(id),
    enabled: Boolean(id),
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      values,
      status,
    }: {
      values: InvoiceFormValues;
      status: InvoiceStatusIntent;
    }) => invoicesApi.create(values, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      // Client invoice counts/metrics derive from invoices.
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
    },
  });
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      values,
      status,
    }: {
      id: string;
      values: InvoiceFormValues;
      status?: InvoiceStatusIntent;
    }) => invoicesApi.update(id, values, status),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      queryClient.setQueryData(invoiceKeys.detail(invoice.id), invoice);
    },
  });
}

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.remove(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      queryClient.removeQueries({ queryKey: invoiceKeys.detail(id) });
    },
  });
}

export function useMarkInvoicePaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.markPaid(id),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      queryClient.setQueryData(invoiceKeys.detail(invoice.id), invoice);
    },
  });
}
