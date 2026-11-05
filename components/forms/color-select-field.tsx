"use client";

import { Check, ChevronDown, Pipette } from "lucide-react";
import { HexColorInput, HexColorPicker } from "react-colorful";
import {
  useColorSelectField,
  type ColorOption,
} from "@/hooks/use-color-select-field";

export type { ColorOption };

export type ColorSelectFieldProps = {
  label: string;
  id?: string;
  name?: string;
  colors: readonly ColorOption[];
  value?: string;
  onChange?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  className?: string;
  align?: "left" | "right";
};

export function ColorSelectField({
  label,
  id,
  name,
  colors,
  value,
  onChange,
  error,
  disabled = false,
  className = "",
  align = "right",
}: ColorSelectFieldProps) {
  const {
    inputId,
    listId,
    containerRef,
    isOpen,
    setIsOpen,
    hasEyeDropper,
    current,
    matchingPreset,
    handleColorChange,
    handleEyeDropper,
    handleKeyDown,
  } = useColorSelectField({
    id,
    name,
    colors,
    value,
    onChange,
    disabled,
  });

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className="relative flex flex-col gap-2">
      <label htmlFor={inputId} className="text-[13px] font-medium text-muted">
        {label}
      </label>

      {name && <input type="hidden" name={name} value={current} />}

      <div className="relative">
        <button
          id={inputId}
          type="button"
          role="combobox"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-controls={listId}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          className={`flex h-12 w-full items-center gap-3 rounded border bg-surface px-4 text-left transition-colors focus:border-purple disabled:cursor-not-allowed disabled:opacity-60 ${
            error ? "border-danger" : "border-border"
          } ${className}`}>
          <span
            className="size-5 shrink-0 rounded-full border border-black/10 dark:border-white/10"
            style={{ backgroundColor: current }}
          />
          <div className="flex min-w-0 items-center gap-2 truncate">
            <span className="truncate text-[15px] font-bold text-ink">
              {matchingPreset ? matchingPreset.name : "Custom"}
            </span>
            <span className="shrink-0 font-mono text-[13px] font-medium uppercase text-muted">
              ({current})
            </span>
          </div>
          <ChevronDown
            className={`ml-auto size-4 shrink-0 text-muted-light transition-transform duration-200 ${
              isOpen ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </button>

        {isOpen && (
          <div
            id={listId}
            role="dialog"
            aria-label={label}
            className={`absolute top-[calc(100%+8px)] z-40 flex flex-col gap-3 rounded-xl border border-border bg-surface p-3 shadow-[0_16px_32px_-12px_rgba(var(--shadow-navy),0.25)] sm:p-3.5 dark:bg-canvas ${
              align === "left"
                ? "inset-x-0 w-full sm:inset-x-auto sm:left-0 sm:right-auto sm:w-80"
                : "inset-x-0 w-full sm:inset-x-auto sm:right-0 sm:left-auto sm:w-80"
            } max-w-[calc(100vw-2rem)]`}>
            {/* Presets Grid */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-light">
                  Palette
                </span>
                {matchingPreset && (
                  <span className="truncate text-[12px] font-bold text-purple">
                    {matchingPreset.name}
                  </span>
                )}
              </div>
              <div className="grid grid-cols-6 place-items-center gap-1.5 sm:gap-2">
                {colors.map((color) => {
                  const isSelected =
                    color.value.toLowerCase() === current.toLowerCase();

                  return (
                    <button
                      key={color.value}
                      type="button"
                      title={`${color.name} (${color.value})`}
                      onClick={() => handleColorChange(color.value)}
                      className={`group relative flex aspect-square w-full max-w-8 items-center justify-center rounded-full border border-black/10 transition-transform hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple dark:border-white/10 ${
                        isSelected
                          ? "ring-2 ring-purple ring-offset-2 dark:ring-offset-canvas"
                          : ""
                      }`}
                      style={{ backgroundColor: color.value }}>
                      {isSelected && (
                        <Check className="size-3.5 text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Section */}
            <div className="border-t border-border pt-3">
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-light">
                  Custom Color
                </span>
                <span className="font-mono text-[12px] font-bold uppercase text-ink">
                  {current}
                </span>
              </div>

              {/* Visual spectrum and hue slider */}
              <div className="custom-color-picker overflow-hidden rounded-lg">
                <HexColorPicker
                  color={current}
                  onChange={handleColorChange}
                />
              </div>

              {/* Hex Input & Eyedropper */}
              <div className="mt-2.5 flex items-center gap-2">
                <div className="relative flex flex-1 min-w-0 items-center rounded border border-border bg-surface px-2.5 py-1.5 focus-within:border-purple dark:bg-surface-subtle">
                  <span className="mr-1 text-[13px] font-bold text-muted-light">
                    #
                  </span>
                  <HexColorInput
                    color={current}
                    onChange={handleColorChange}
                    prefixed={false}
                    className="w-full min-w-0 bg-transparent font-mono text-[13px] font-bold uppercase text-ink outline-none"
                  />
                </div>

                {hasEyeDropper && (
                  <button
                    type="button"
                    title="Pick color from screen"
                    onClick={handleEyeDropper}
                    className="flex size-8 shrink-0 items-center justify-center rounded border border-border bg-surface text-muted transition-colors hover:border-purple hover:text-purple sm:size-9 dark:bg-surface-subtle">
                    <Pipette className="size-3.5 sm:size-4" />
                  </button>
                )}

                <div
                  className="size-8 shrink-0 rounded border border-black/10 sm:size-9 dark:border-white/10"
                  style={{ backgroundColor: current }}
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-[13px] font-medium text-danger">{error}</p>}
    </div>
  );
}
