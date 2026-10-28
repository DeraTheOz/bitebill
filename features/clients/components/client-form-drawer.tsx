"use client";

import { useRef } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { TextField } from "@/components/forms/text-field";
import { TextAreaField } from "@/components/forms/text-area-field";
import { FormSection } from "@/components/forms/form-section";
import { DiscardButton } from "@/components/buttons/discard-button";
import { CancelButton } from "@/components/buttons/cancel-button";
import { SaveChangesButton } from "@/components/buttons/save-changes-button";
import { Button } from "@/components/buttons/button";
import { Spinner } from "@/components/loaders/spinner";
import { useClientFormDrawer } from "../hooks/use-client-form-drawer";

const pendingButtonClassName =
  "inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60";

type ClientFormDrawerProps = {
  mode: "create" | "edit";
  clientId?: string;
  onClose: () => void;
};

export function ClientFormDrawer({
  mode,
  clientId,
  onClose,
}: ClientFormDrawerProps) {
  const panelRef = useRef<HTMLElement>(null);

  const {
    label,
    errors,
    isSubmitting,
    existingClient,
    register,
    onSubmit,
    handleSubmit,
  } = useClientFormDrawer(mode, onClose, clientId);

  // Prevent closing the drawer mid-save
  useClickOutside(panelRef, isSubmitting ? () => {} : onClose);

  return (
    <div className="fixed inset-x-0 bottom-0 top-18 z-40 bg-black/50 md:top-20 lg:inset-y-0 lg:left-64">
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        className="scrollbar-purple absolute inset-0 w-full overflow-y-auto bg-surface px-6 pb-24 pt-8 shadow-2xl dark:bg-canvas md:w-154 md:rounded-r-[20px] md:px-14 md:pb-28 md:pt-12 lg:right-auto lg:pt-14">
        <h1 className="text-[24px] font-bold tracking-[-0.75px] text-ink">
          {mode === "edit" ? (
            <>
              Edit Client:{" "}
              <span className="text-muted-light">{existingClient?.name}</span>
            </>
          ) : (
            "New Client"
          )}
        </h1>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          aria-busy={isSubmitting}
          className="mt-12 space-y-12">
          <FormSection title="Client Details">
            <TextField
              label="Name"
              placeholder="Alex Grim"
              autoComplete="name"
              error={errors.name?.message}
              {...register("name")}
            />
            <TextField
              label="Email (optional)"
              type="email"
              placeholder="alexgrim@mail.com"
              autoComplete="email"
              error={errors.email?.message}
              {...register("email")}
            />
            <div className="grid gap-6 sm:grid-cols-2">
              <TextField
                label="Phone"
                type="tel"
                placeholder="07700 900318"
                autoComplete="tel"
                error={errors.phone?.message}
                {...register("phone")}
              />
              <TextField
                label="Company"
                placeholder="Grim Studio"
                autoComplete="organization"
                error={errors.company?.message}
                {...register("company")}
              />
            </div>
          </FormSection>

          <FormSection title="Address">
            <div className="grid gap-6 sm:grid-cols-2">
              <TextField
                label="Address Line 1"
                placeholder="84 Church Way"
                autoComplete="address-line1"
                error={errors.addressLine1?.message}
                {...register("addressLine1")}
              />
              <TextField
                label="Address Line 2"
                placeholder="Flat 2, Example House"
                autoComplete="address-line2"
                error={errors.addressLine2?.message}
                {...register("addressLine2")}
              />
            </div>
            <div className="grid gap-6 sm:grid-cols-3">
              <TextField
                label="City"
                placeholder="Bradford"
                autoComplete="address-level2"
                error={errors.city?.message}
                {...register("city")}
              />
              <TextField
                label="State / County"
                placeholder="West Yorkshire"
                autoComplete="address-level1"
                error={errors.state?.message}
                {...register("state")}
              />
              <TextField
                label="Country"
                placeholder="United Kingdom"
                autoComplete="country-name"
                error={errors.country?.message}
                {...register("country")}
              />
            </div>
          </FormSection>

          <FormSection title="Notes">
            <TextAreaField
              label="Notes"
              placeholder="Anything worth remembering about this client…"
              error={errors.notes?.message}
              {...register("notes")}
            />
          </FormSection>

          <footer className="fixed inset-x-0 bottom-0 flex flex-wrap justify-end gap-2 border-t border-border bg-surface px-6 py-4 dark:bg-canvas md:right-auto md:w-154 md:px-14 lg:left-64">
            {mode === "create" ? (
              <>
                <DiscardButton
                  className="mr-auto disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={onClose}
                  disabled={isSubmitting}
                />
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={`bg-button-purple text-white hover:bg-button-purple-light ${pendingButtonClassName}`}>
                  {isSubmitting && (
                    <Spinner className="size-4" tone="currentColor" />
                  )}
                  {isSubmitting ? "Adding…" : "Add Client"}
                </Button>
              </>
            ) : (
              <>
                <CancelButton
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="disabled:cursor-not-allowed disabled:opacity-60"
                />
                <SaveChangesButton
                  type="submit"
                  disabled={isSubmitting}
                  className={`inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60`}>
                  {isSubmitting ? (
                    <>
                      <Spinner className="size-4" tone="currentColor" />
                      Saving…
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </SaveChangesButton>
              </>
            )}
          </footer>
        </form>
      </aside>
    </div>
  );
}
