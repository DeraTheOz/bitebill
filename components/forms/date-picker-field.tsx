"use client";

import { DayPicker } from "react-day-picker";
import {
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useDatePickerField } from "@/hooks/use-date-picker-field";

import "react-day-picker/style.css";

type DatePickerFieldProps = {
  label: string;
  name?: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
  disabled?: boolean;
  min?: string;
  max?: string;
  fromYear?: number;
  toYear?: number;
  align?: "start" | "end";
};

export function DatePickerField({
  label,
  name,
  value,
  onChange,
  onBlur,
  error,
  disabled = false,
  min,
  max,
  fromYear = new Date().getFullYear() - 10,
  toYear = new Date().getFullYear() + 10,
  align = "start",
}: DatePickerFieldProps) {
  const {
    fieldId,
    errorId,
    calendarId,
    containerRef,
    buttonRef,
    isOpen,
    open,
    close,
    handleKeyDown,
    selected,
    minDate,
    maxDate,
    defaultMonth,
    display,
    alignmentClass,
    select,
    selectToday,
    isTodayDisabled,
  } = useDatePickerField({
    value,
    onChange,
    onBlur,
    disabled,
    min,
    max,
    align,
  });

  return (
    <div
      ref={containerRef}
      onKeyDown={handleKeyDown}
      className="relative flex flex-col gap-2">
      <label htmlFor={fieldId} className="text-[13px] font-medium text-muted">
        {label}
      </label>

      <input type="hidden" name={name} value={value} />

      <button
        ref={buttonRef}
        id={fieldId}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
        aria-controls={calendarId}
        aria-describedby={error ? errorId : undefined}
        disabled={disabled}
        onClick={open}
        className={`flex h-12 w-full items-center justify-between gap-3 rounded border bg-surface px-4 text-left text-[15px] font-bold outline-none transition-colors focus:border-purple disabled:cursor-not-allowed disabled:opacity-60 ${
          error ? "border-danger" : "border-border"
        }`}>
        <span className={selected ? "text-ink" : "text-muted-light"}>
          {display}
        </span>
        <CalendarIcon
          className="size-4 shrink-0 text-muted-light"
          aria-hidden="true"
        />
      </button>

      {isOpen && (
        <div
          id={calendarId}
          role="dialog"
          aria-label={label}
          className={`absolute top-[calc(100%+8px)] z-50 rounded-lg border border-border bg-surface p-3 shadow-[0_24px_40px_-20px_rgba(var(--shadow-navy),0.4)] dark:shadow-[0_24px_40px_-20px_rgba(0,0,0,0.7)] ${alignmentClass}`}>
          <DayPicker
            mode="single"
            selected={selected}
            defaultMonth={defaultMonth}
            onSelect={select}
            disabled={[
              ...(minDate ? [{ before: minDate }] : []),
              ...(maxDate ? [{ after: maxDate }] : []),
            ]}
            captionLayout="dropdown"
            startMonth={new Date(fromYear, 0)}
            endMonth={new Date(toYear, 11)}
            showOutsideDays
            fixedWeeks
            navLayout="around"
            classNames={{
              root: "bitebill-daypicker text-ink",
              months: "flex flex-col",
              month: "relative space-y-3",
              month_caption:
                "flex h-8 items-center justify-center px-9 text-[14px] font-bold",
              caption_label:
                "inline-flex items-center gap-1 text-[13px] font-bold text-ink pointer-events-none",
              dropdowns:
                "inline-flex items-center justify-center gap-1.5 text-[14px] font-bold",
              dropdown_root:
                "relative inline-flex items-center rounded border border-border bg-canvas px-2 py-0.5 text-ink transition-colors hover:border-purple focus-within:border-purple",
              dropdown:
                "absolute inset-0 size-full cursor-pointer opacity-0 bg-surface text-ink [color-scheme:light] dark:[color-scheme:dark]",
              nav: "flex items-center gap-1",
              button_previous:
                "absolute left-0 top-0 inline-flex size-8 items-center justify-center rounded text-muted-light transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple/60",
              button_next:
                "absolute right-0 top-0 inline-flex size-8 items-center justify-center rounded text-muted-light transition-colors hover:bg-canvas hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple/60",
              chevron: "size-4",
              month_grid: "w-full border-collapse",
              weekdays: "flex",
              weekday:
                "w-9 text-center text-[12px] font-medium text-muted-light",
              week: "mt-1 flex",
              day: "size-9 p-0 text-center",
              day_button:
                "day_button size-9 rounded-full text-[13px] font-medium text-ink transition-colors hover:bg-canvas focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple/60",
              selected: "rdp-selected",
              today: "rdp-today",
              outside: "text-muted-light/70",
              disabled: "text-muted-light opacity-40 pointer-events-none",
            }}
            components={{
              Chevron: (props) => {
                if (props.orientation === "left") {
                  return <ChevronLeft className="size-4" />;
                }
                if (props.orientation === "right") {
                  return <ChevronRight className="size-4" />;
                }
                return <ChevronDown className="ml-1 size-3 text-muted-light" />;
              },
              Select: ({ className = "", ...props }) => (
                <select
                  className={`bg-surface text-ink dark:bg-[#1e2139] scrollbar-purple dark:text-white scheme-light dark:scheme-dark ${className}`}
                  {...props}
                />
              ),
              Option: (props) => (
                <option
                  className="bg-surface text-ink dark:bg-[#1e2139] dark:text-white"
                  {...props}
                />
              ),
            }}
          />

          <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
            <button
              type="button"
              onClick={selectToday}
              disabled={isTodayDisabled}
              className="rounded px-1.5 py-0.5 text-[12px] font-bold text-purple hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple/60 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:no-underline">
              Today
            </button>
            <button
              type="button"
              onClick={close}
              className="rounded px-1.5 py-0.5 text-[12px] font-medium text-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple/60">
              Close
            </button>
          </div>
        </div>
      )}

      {error && (
        <p id={errorId} className="text-[13px] font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
