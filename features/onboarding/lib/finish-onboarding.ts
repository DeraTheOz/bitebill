import { brandingApi } from "@/features/branding/lib/api";
import type { OnboardingValues } from "../schemas/onboarding-schema";

export async function finishOnboarding(values: OnboardingValues) {
  return brandingApi.save(values);
}
