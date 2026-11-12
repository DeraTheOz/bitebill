import { getSessionUser } from "@/features/auth/lib/session";
import { SettingsWorkspace } from "@/features/settings/components/settings-workspace";
import type { SettingsTab } from "@/features/settings/types/settings";

export const dynamic = "force-dynamic";

const VALID_TABS = new Set<SettingsTab>([
  "branding",
  "pdf",
  "profile",
  "account",
]);

/** Resolves a query-string tab name to a valid `SettingsTab`, defaulting to `"branding"`. */
function resolveTab(raw?: string): SettingsTab {
  if (raw && VALID_TABS.has(raw as SettingsTab)) {
    return raw as SettingsTab;
  }
  return "branding";
}

export default async function SettingsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const [user, params] = await Promise.all([getSessionUser(), searchParams]);

  if (!user) return null;

  return (
    <SettingsWorkspace
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        emailVerified: Boolean(user.emailVerified),
        image: user.image ?? null,
      }}
      initialTab={resolveTab(params.tab)}
    />
  );
}

