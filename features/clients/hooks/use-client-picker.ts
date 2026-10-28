"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { useClickOutside } from "@/hooks/use-click-outside";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useClients } from "./use-client-queries";

const MAX_RESULTS = 6;

export type SelectedClient = {
  id: string;
  name: string;
  company: string | null;
};

export type UseClientPickerOptions = {
  value: string;
  onChange: (value: string) => void;
  selectedClient?: SelectedClient | null;
  disabled?: boolean;
};

export function useClientPicker({
  value,
  onChange,
  selectedClient,
  disabled = false,
}: UseClientPickerOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [picked, setPicked] = useState<SelectedClient | null>(null);

  const fieldId = useId();
  const errorId = `${fieldId}-error`;
  const listId = `${fieldId}-list`;

  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selected =
    picked?.id === value
      ? picked
      : selectedClient?.id === value
        ? selectedClient
        : null;

  const search = useDebouncedValue(query, 250).trim();
  const { data, isPending, isFetching } = useClients({
    page: 1,
    pageSize: MAX_RESULTS,
    q: search || undefined,
  });

  const clients = data?.clients ?? [];
  const total = data?.pagination.total ?? 0;

  const isDebouncing = query.trim() !== search;
  const isSearching = isFetching || isDebouncing;

  useClickOutside(containerRef, () => {
    if (isOpen) {
      setIsOpen(false);
      setQuery("");
    }
  });

  function open() {
    if (disabled) return;
    setIsOpen(true);
    setQuery("");
    setActiveIndex(0);
  }

  function close() {
    setIsOpen(false);
    setQuery("");
    triggerRef.current?.focus();
  }

  function toggle() {
    if (isOpen) {
      close();
    } else {
      open();
    }
  }

  function choose(client: SelectedClient) {
    onChange(client.id);
    setPicked(client);
    close();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) =>
        clients.length === 0 ? 0 : Math.min(index + 1, clients.length - 1),
      );
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const client = clients[activeIndex];
      if (client) choose(client);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  }

  const label =
    selected && selected.id === value
      ? selected.company
        ? `${selected.name} — ${selected.company}`
        : selected.name
      : null;

  return {
    fieldId,
    errorId,
    listId,
    containerRef,
    triggerRef,
    isOpen,
    open,
    close,
    toggle,
    query,
    setQuery,
    activeIndex,
    setActiveIndex,
    selected,
    label,
    search,
    clients,
    total,
    isPending,
    isFetching,
    isDebouncing,
    isSearching,
    choose,
    handleKeyDown,
  };
}

