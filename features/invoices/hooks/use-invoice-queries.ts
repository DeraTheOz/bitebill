import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { clientKeys } from "@/features/clients/hooks/use-client-queries";
import { dashboardKeys } from "@/features/dashboard/hooks/use-dashboard-queries";
import { invoicesApi, type InvoiceListRequest } from "../lib/api";
import type {
  InvoiceFormValues,
  InvoiceStatusIntent,
} from "../schemas/invoice-schema";

// List and detail share the ["invoices"] prefix so a single
// invalidateQueries({ queryKey: invoiceKeys.all }) refreshes both.
/** TanStack Query key factory for invoice lists and detail queries. */
export const invoiceKeys = {
  all: ["invoices"] as const,
  list: (params: InvoiceListRequest) =>
    ["invoices", "list", params] as const,
  detail: (id: string) => ["invoices", "detail", id] as const,
};

/** Fetches paginated invoices matching the active filters while retaining previous page data. */
export function useInvoices(params: InvoiceListRequest) {
  return useQuery({
    queryKey: invoiceKeys.list(params),
    queryFn: () => invoicesApi.list(params),
    // Keep the previous page visible while the next one loads.
    placeholderData: keepPreviousData,
  });
}

/** Fetches a single invoice by id when `id` is non-empty. */
export function useInvoice(id: string) {
  return useQuery({
    queryKey: invoiceKeys.detail(id),
    queryFn: () => invoicesApi.get(id),
    enabled: Boolean(id),
  });
}

/** Creates an invoice and invalidates invoice, client, and dashboard query caches. */
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
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

/** Updates an invoice and invalidates dependent invoice, client, and dashboard queries. */
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
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.setQueryData(invoiceKeys.detail(invoice.id), invoice);
    },
  });
}

/** Soft-deletes an invoice and updates invoice, client, and dashboard caches. */
export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.remove(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.removeQueries({ queryKey: invoiceKeys.detail(id) });
    },
  });
}

/** Marks an invoice as paid and refreshes cached invoice, client, and dashboard views. */
export function useMarkInvoicePaid() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.markPaid(id),
    onSuccess: (invoice) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
      queryClient.setQueryData(invoiceKeys.detail(invoice.id), invoice);
    },
  });
}

/** Downloads an invoice PDF and refreshes its detail query so the audit timeline updates. */
export function useDownloadInvoicePdf() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      invoiceNumber,
    }: {
      id: string;
      invoiceNumber: string;
    }) => invoicesApi.downloadPdf(id, invoiceNumber),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: invoiceKeys.detail(id) });
    },
  });
}
