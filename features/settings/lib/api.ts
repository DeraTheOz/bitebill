import type {
  DeleteAccountResult,
  SettingsUser,
  UserAccountsInfo,
} from "../types/settings";

/** Client HTTP error carrying optional machine-readable error `code` from settings endpoints. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/** Sends a JSON request to a settings API route and throws a typed `ApiError` on failure. */
async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      body?.error ?? "Something went wrong. Please try again.",
      response.status,
      typeof body?.code === "string" ? body.code : undefined,
    );
  }

  return body as T;
}

/** Typed client wrapper around user account and security endpoints. */
export const settingsApi = {
  getAccounts: async () => {
    return request<UserAccountsInfo>("/api/user/accounts");
  },

  updateProfile: async (values: { name: string }) => {
    const { user } = await request<{ user: SettingsUser }>("/api/user", {
      method: "PATCH",
      body: JSON.stringify(values),
    });
    return user;
  },

  requestSetupPasswordOtp: async () => {
    return request<{ success: boolean }>("/api/user/password/setup-otp", {
      method: "POST",
    });
  },

  changePassword: async (values: {
    currentPassword: string;
    newPassword: string;
    revokeOtherSessions: boolean;
  }) => {
    return request<{ success: boolean }>("/api/user/password", {
      method: "POST",
      body: JSON.stringify(values),
    });
  },

  deleteAccount: async (values: {
    confirmation: string;
    password?: string;
  }) => {
    return request<DeleteAccountResult>("/api/user", {
      method: "DELETE",
      body: JSON.stringify(values),
    });
  },
};

