"use client";

import { CalendarIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import type { DayPeriod } from "./SpecialDayDialog";

export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

export function fromIsoDate(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

export function PeriodToggle({
  value,
  onChange,
  morningLabel,
  noonLabel,
}: {
  value: DayPeriod;
  onChange: (v: DayPeriod) => void;
  morningLabel: string;
  noonLabel: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-1.5">
      {(
        [
          ["morning", morningLabel],
          ["noon", noonLabel],
        ] as [DayPeriod, string][]
      ).map(([period, label]) => (
        <button
          key={period}
          type="button"
          onClick={() => onChange(period)}
          className={[
            "py-1.5 rounded-md border text-[11px] font-semibold transition-colors",
            value === period
              ? "bg-kale/10 border-kale/35 text-kale"
              : "bg-surface-2 border-garden-border text-ink-subtle hover:text-ink-muted",
          ].join(" ")}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function DatePickerField({
  label,
  date,
  onChange,
}: {
  label: string;
  date: Date;
  onChange: (d: Date) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start font-normal text-ink text-xs h-9"
          />
        }
      >
        <CalendarIcon className="w-3.5 h-3.5 text-ink-subtle" />
        {date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={(d) => {
            if (d) {
              onChange(d);
              setOpen(false);
            }
          }}
          autoFocus
        />
      </PopoverContent>
      <span className="sr-only">{label}</span>
    </Popover>
  );
}
