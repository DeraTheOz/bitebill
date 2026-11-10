"use client";

import { useEffect, useRef, useState } from "react";
import { addDays } from "date-fns";
import toast from "react-hot-toast";
import type { CustomSelectOption } from "@/components/forms/custom-select-field";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useIsMounted } from "@/hooks/use-is-mounted";
import {
  useCreateInvoiceShare,
  useInvoiceShare,
  useRevokeInvoiceShare,
  useUpdateInvoiceShare,
} from "./use-share-queries";

export type ExpirationPreset = "never" | "3" | "7" | "14" | "30";

export type ShareConfirmAction = "regenerate" | "disable" | null;

export const CREATE_EXPIRATION_OPTIONS: readonly CustomSelectOption[] = [
  { value: "never", label: "Never expires" },
  { value: "3", label: "Expires in 3 days" },
  { value: "7", label: "Expires in 7 days" },
  { value: "14", label: "Expires in 14 days" },
  { value: "30", label: "Expires in 30 days" },
];

export const UPDATE_EXPIRATION_OPTIONS: readonly CustomSelectOption[] = [
  { value: "never", label: "Never expires" },
  { value: "3", label: "3 days from now" },
  { value: "7", label: "7 days from now" },
  { value: "14", label: "14 days from now" },
  { value: "30", label: "30 days from now" },
];

function presetToExpiresAt(preset: ExpirationPreset): string | null {
  if (preset === "never") return null;
  return addDays(new Date(), Number(preset)).toISOString();
}

export function useShareInvoiceDialog({
  invoiceId,
  onClose,
}: {
  invoiceId: string;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLElement>(null);
  const mounted = useIsMounted();
  const [createPreset, setCreatePreset] = useState<ExpirationPreset>("never");
  const [copied, setCopied] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ShareConfirmAction>(null);

  const {
    data: share,
    isPending: isLoadingShare,
    isError: isShareError,
    refetch,
  } = useInvoiceShare(invoiceId);
  const createOrRegenerate = useCreateInvoiceShare(invoiceId);
  const updateExpiration = useUpdateInvoiceShare(invoiceId);
  const revokeShare = useRevokeInvoiceShare(invoiceId);

  const isMutating =
    createOrRegenerate.isPending ||
    updateExpiration.isPending ||
    revokeShare.isPending;

  useClickOutside(panelRef, isMutating ? () => {} : onClose);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || isMutating) return;
      // Let an open custom select dropdown close on the first Escape press.
      if (
        panelRef.current?.querySelector(
          '[role="combobox"][aria-expanded="true"]',
        )
      ) {
        return;
      }
      onClose();
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isMutating, onClose]);

  const fullShareUrl = share
    ? mounted
      ? `${window.location.origin}${share.sharePath}`
      : share.sharePath
    : "";

  async function handleCopy() {
    if (!fullShareUrl) return;
    try {
      await navigator.clipboard.writeText(fullShareUrl);
      setCopied(true);
      toast.success("Share link copied");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Could not copy link");
    }
  }

  function handleCreate() {
    createOrRegenerate.mutate(
      {
        regenerate: false,
        expiresAt: presetToExpiresAt(createPreset),
      },
      {
        onSuccess: () => toast.success("Share link created"),
        onError: (error) => toast.error(error.message),
      },
    );
  }

  function handleRegenerate() {
    createOrRegenerate.mutate(
      { regenerate: true },
      {
        onSuccess: () => {
          setConfirmAction(null);
          toast.success("Share link regenerated");
        },
        onError: (error) => toast.error(error.message),
      },
    );
  }

  function handleExpirationUpdate(value: string) {
    if (!value) return;
    const expiresAt = presetToExpiresAt(value as ExpirationPreset);
    updateExpiration.mutate(expiresAt, {
      onSuccess: () => toast.success("Expiration updated"),
      onError: (error) => toast.error(error.message),
    });
  }

  function handleRevoke() {
    revokeShare.mutate(undefined, {
      onSuccess: () => {
        setConfirmAction(null);
        toast.success("Share link disabled");
      },
      onError: (error) => toast.error(error.message),
    });
  }

  return {
    panelRef,
    share,
    isLoadingShare,
    isShareError,
    isMutating,
    isCreating: createOrRegenerate.isPending,
    createPreset,
    setCreatePreset,
    copied,
    confirmAction,
    setConfirmAction,
    fullShareUrl,
    refetch,
    handleCopy,
    handleCreate,
    handleRegenerate,
    handleExpirationUpdate,
    handleRevoke,
  };
}

