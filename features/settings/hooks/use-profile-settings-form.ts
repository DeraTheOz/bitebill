import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import {
  profileSettingsSchema,
  type ProfileSettingsValues,
} from "../schemas/settings-schema";
import type { SettingsUser } from "../types/settings";
import { useUpdateProfile } from "./use-settings-queries";

/** Manages personal profile display name form state and updates. */
export function useProfileSettingsForm(user: SettingsUser) {
  const updateProfile = useUpdateProfile();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty, isSubmitting },
  } = useForm<ProfileSettingsValues>({
    resolver: zodResolver(profileSettingsSchema),
    defaultValues: { name: user.name },
    mode: "onTouched",
  });

  const watchedName = useWatch({ control, name: "name" });
  const liveName = watchedName || user.name;
  const isPending = isSubmitting || updateProfile.isPending;

  async function onSubmit(values: ProfileSettingsValues) {
    try {
      const updated = await updateProfile.mutateAsync(values);
      reset({ name: updated.name });
      toast.success("Profile updated");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not update profile",
      );
    }
  }

  return {
    liveName,
    errors,
    isDirty,
    isPending,
    register,
    handleSubmit: handleSubmit(onSubmit),
  };
}

