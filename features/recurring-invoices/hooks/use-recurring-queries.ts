import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { clientKeys } from "@/features/clients/hooks/use-client-queries";
import { dashboardKeys } from "@/features/dashboard/hooks/use-dashboard-queries";
import { invoiceKeys } from "@/features/invoices/hooks/use-invoice-queries";
import { recurringApi, type RecurringListRequest } from "../lib/api";
import type { RecurringTemplateFormValues } from "../schemas/recurring-schema";

/** TanStack Query key factory for recurring invoice list and detail caches. */
export const recurringKeys = {
  all: ["recurring-invoices"] as const,
  list: (params: RecurringListRequest) =>
    ["recurring-invoices", "list", params] as const,
  detail: (id: string) => ["recurring-invoices", "detail", id] as const,
};

/** Fetches paginated recurring invoice schedules while preserving previous page data. */
export function useRecurringTemplates(params: RecurringListRequest) {
  return useQuery({
    queryKey: recurringKeys.list(params),
    queryFn: () => recurringApi.list(params),
    placeholderData: keepPreviousData,
  });
}

/** Fetches a single recurring invoice schedule by id when `id` is non-empty. */
export function useRecurringTemplate(id: string) {
  return useQuery({
    queryKey: recurringKeys.detail(id),
    queryFn: () => recurringApi.get(id),
    enabled: Boolean(id),
  });
}

/** Creates a recurring invoice schedule and invalidates the list cache. */
export function useCreateRecurringTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (values: RecurringTemplateFormValues) =>
      recurringApi.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.all });
    },
  });
}

/** Updates a recurring invoice schedule and primes its detail cache. */
export function useUpdateRecurringTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      values,
    }: {
      id: string;
      values: RecurringTemplateFormValues;
    }) => recurringApi.update(id, values),
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.all });
      queryClient.setQueryData(recurringKeys.detail(template.id), template);
    },
  });
}

/** Pauses or resumes a recurring invoice schedule and updates list/detail caches. */
export function useToggleRecurringTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, active }: { id: string; active: boolean }) =>
      recurringApi.toggle(id, active),
    onSuccess: (template) => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.all });
      queryClient.setQueryData(recurringKeys.detail(template.id), template);
    },
  });
}

/** Deletes a recurring invoice schedule and removes its cached detail query. */
export function useDeleteRecurringTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recurringApi.remove(id),
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.all });
      queryClient.removeQueries({ queryKey: recurringKeys.detail(id) });
    },
  });
}

/** Triggers immediate ad-hoc invoice generation from a recurring schedule and refreshes related caches. */
export function useGenerateRecurringInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => recurringApi.generateNow(id),
    onSuccess: (_invoice, id) => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.all });
      queryClient.invalidateQueries({ queryKey: recurringKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

/** Runs all currently due recurring schedules for the user and invalidates affected caches. */
export function useRunDueRecurringTemplates() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => recurringApi.runDue(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.all });
      queryClient.invalidateQueries({ queryKey: invoiceKeys.all });
      queryClient.invalidateQueries({ queryKey: clientKeys.all });
      queryClient.invalidateQueries({ queryKey: dashboardKeys.all });
    },
  });
}

