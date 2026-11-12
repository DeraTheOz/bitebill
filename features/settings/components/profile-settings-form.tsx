"use client";

import { BadgeCheck } from "lucide-react";
import { Avatar } from "@/components/avatar";
import { SaveChangesButton } from "@/components/buttons/save-changes-button";
import { TextField } from "@/components/forms/text-field";
import { Spinner } from "@/components/loaders/spinner";
import { useProfileSettingsForm } from "../hooks/use-profile-settings-form";
import type { SettingsUser } from "../types/settings";

export function ProfileSettingsForm({ user }: { user: SettingsUser }) {
  const { liveName, errors, isDirty, isPending, register, handleSubmit } =
    useProfileSettingsForm(user);

  return (
    <form
      noValidate
      onSubmit={handleSubmit}
      className="max-w-2xl space-y-6 rounded-2xl border border-border bg-surface p-6 shadow-[0_10px_10px_-10px_rgba(var(--shadow-navy),0.1)] sm:p-8 dark:shadow-none">
      <div>
        <h2 className="text-[18px] font-bold tracking-[-0.25px] text-ink">
          Personal Profile
        </h2>
        <p className="mt-1 text-[13px] font-medium text-muted-light">
          Manage your account display name and view your verified sign-in
          email.
        </p>
      </div>

      <div className="flex items-center gap-4 rounded-xl border border-border bg-surface-subtle p-4">
        <Avatar
          name={liveName}
          image={user.image}
          className="size-13 text-[16px]"
        />
        <div className="min-w-0">
          <p className="truncate text-[16px] font-bold text-ink">{liveName}</p>
          <p className="mt-0.5 flex flex-wrap items-center gap-1.5 text-[13px] font-medium text-muted-light">
            <span className="truncate">{user.email}</span>
            {user.emailVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-status-paid/10 px-2 py-0.5 text-[11px] font-bold text-status-paid">
                <BadgeCheck className="size-3" aria-hidden="true" />
                Verified
              </span>
            )}
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <TextField
          label="Full name"
          id="profile-name"
          type="text"
          autoComplete="name"
          disabled={isPending}
          error={errors.name?.message}
          {...register("name")}
        />

        <div>
          <TextField
            label="Email address"
            id="profile-email"
            type="email"
            value={user.email}
            readOnly
            disabled
          />
          <p className="mt-1.5 text-[12px] font-medium text-muted-light">
            Your sign-in email cannot be changed from workspace settings.
          </p>
        </div>
      </div>

      <div className="flex justify-end border-t border-border pt-6">
        <SaveChangesButton
          type="submit"
          disabled={!isDirty || isPending}
          className="inline-flex items-center justify-center gap-2 disabled:cursor-not-allowed disabled:opacity-60">
          {isPending ? (
            <>
              <Spinner className="size-4" tone="currentColor" />
              Saving…
            </>
          ) : (
            "Save Changes"
          )}
        </SaveChangesButton>
      </div>
    </form>
  );
}
