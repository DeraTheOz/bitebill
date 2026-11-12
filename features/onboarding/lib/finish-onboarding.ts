import { brandingApi } from "@/features/branding/lib/api";
import type { OnboardingValues } from "../schemas/onboarding-schema";

/** Persists completed onboarding branding settings via the branding API client. */
export async function finishOnboarding(values: OnboardingValues) {
  return brandingApi.save(values);
}
