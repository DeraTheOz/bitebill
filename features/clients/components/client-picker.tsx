"use client";

import { Check, ChevronsUpDown, Search } from "lucide-react";
import { Spinner } from "@/components/loaders/spinner";
import {
  useClientPicker,
  type SelectedClient,
} from "../hooks/use-client-picker";

export type { SelectedClient };

type ClientPickerProps = {
  value: string;
  onChange: (value: string) => void;
  selectedClient?: SelectedClient | null;
  error?: string;
  disabled?: boolean;
};

export function ClientPicker({
  value,
  onChange,
  selectedClient,
  error,
  disabled = false,
}: ClientPickerProps) {
  const {
    fieldId,
    errorId,
    listId,
    containerRef,
    triggerRef,
    isOpen,
    toggle,
    query,
    setQuery,
    activeIndex,
    setActiveIndex,
    label,
    search,
    clients,
    total,
    isPending,
    isSearching,
    choose,
    handleKeyDown,
  } = useClientPicker({
    value,
    onChange,
    selectedClient,
    disabled,
  });

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={fieldId} className="text-[13px] font-medium text-muted">
        Client
      </label>

      <div ref={containerRef} className="relative">
        <button
          ref={triggerRef}
          id={fieldId}
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-describedby={error ? errorId : undefined}
          disabled={disabled}
          onClick={toggle}
          className={`flex h-12 w-full items-center justify-between gap-3 rounded border bg-surface px-4 text-left text-[15px] font-bold outline-none transition-colors focus:border-purple disabled:cursor-not-allowed disabled:opacity-60 ${
            error ? "border-danger" : "border-border"
          }`}>
          <span className={label ? "truncate text-ink" : "text-muted-light"}>
            {label ?? "Select a client"}
          </span>
          <ChevronsUpDown
            className="size-4 shrink-0 text-muted-light"
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <div className="absolute inset-x-0 top-[calc(100%+8px)] z-30 rounded-lg border border-border bg-surface p-2 shadow-[0_16px_32px_-12px_rgba(var(--shadow-navy),0.25)]">
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-light"
                aria-hidden="true"
              />
              <input
                autoFocus
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setActiveIndex(0);
                }}
                onKeyDown={handleKeyDown}
                role="combobox"
                aria-expanded={isOpen}
                aria-controls={listId}
                aria-autocomplete="list"
                aria-activedescendant={
                  clients[activeIndex]
                    ? `${listId}-option-${clients[activeIndex].id}`
                    : undefined
                }
                placeholder="Search by name, email, or company"
                className="h-11 w-full rounded border border-border bg-surface pl-9 pr-9 text-[14px] font-medium text-ink caret-purple outline-none placeholder:text-muted-light focus:border-purple"
              />
              {isSearching && (
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2">
                  <Spinner className="size-4" tone="brand" />
                </div>
              )}
            </div>

            <ul
              id={listId}
              role="listbox"
              aria-label="Clients"
              className={`mt-2 max-h-72 overflow-y-auto scrollbar-purple transition-opacity ${
                isSearching && clients.length > 0
                  ? "opacity-60"
                  : "opacity-100"
              }`}>
              {isSearching && clients.length === 0 ? (
                <li className="flex items-center justify-center gap-2 px-3 py-4 text-[13px] font-medium text-muted-light">
                  <Spinner className="size-3.5" tone="brand" />
                  Searching…
                </li>
              ) : clients.length === 0 ? (
                <li className="px-3 py-4 text-center text-[13px] font-medium text-muted-light">
                  {search ? "No matching clients" : "No clients yet"}
                </li>
              ) : (
                clients.map((client, index) => {
                  const isSelected = client.id === value;
                  const isActive = index === activeIndex;

                  return (
                    <li
                      key={client.id}
                      id={`${listId}-option-${client.id}`}
                      role="option"
                      aria-selected={isSelected}
                      onMouseEnter={() => setActiveIndex(index)}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => choose(client)}
                      className={`flex cursor-pointer items-center justify-between gap-3 rounded px-3 py-2.5 ${
                        isActive ? "bg-canvas" : ""
                      }`}>
                      <span className="min-w-0">
                        <span className="block truncate text-[14px] font-bold text-ink">
                          {client.name}
                        </span>
                        <span className="block truncate text-[12px] font-medium text-muted">
                          {client.company ?? client.email ?? "No company"}
                        </span>
                      </span>
                      {isSelected && (
                        <Check
                          className="size-4 shrink-0 text-purple"
                          aria-hidden="true"
                        />
                      )}
                    </li>
                  );
                })
              )}
            </ul>

            {!isPending && clients.length > 0 && (
              <p className="border-t border-border px-3 pb-1 pt-2 text-[12px] font-medium text-muted-light">
                {isSearching
                  ? "Searching…"
                  : search
                    ? `${total} ${total === 1 ? "match" : "matches"}`
                    : `Showing ${clients.length} of ${total} clients — type to search`}
              </p>
            )}
          </div>
        )}
      </div>

      {error && (
        <p id={errorId} className="text-[13px] font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
