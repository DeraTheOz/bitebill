export type SettingsTab = "branding" | "pdf" | "profile" | "account";

export type SettingsUser = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image: string | null;
};

export type UserAccountsInfo = {
  hasCredentialAccount: boolean;
  providers: string[];
};

export type DeleteAccountResult =
  { outcome: "deleted" } | { outcome: "verification-sent"; message: string };
