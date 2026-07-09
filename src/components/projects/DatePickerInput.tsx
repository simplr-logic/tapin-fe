"use client";

import { CalendarDays } from "lucide-react";
import { useState } from "react";

import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

export function DatePickerInput({
  value,
  onChange,
  min,
  max,
  placeholder = "Pick a date",
}: {
  value: string;
  onChange: (v: string) => void;
  min?: string;
  max?: string;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const display = value
    ? new Date(`${value}T00:00:00`).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <button
            type="button"
            className="flex h-8 w-full items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 text-left text-sm transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
          />
        }
      >
        <CalendarDays className="size-3.5 shrink-0 text-muted-foreground" />
        {display ? (
          <span>{display}</span>
        ) : (
          <span className="text-muted-foreground">{placeholder}</span>
        )}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-auto p-0">
        <Calendar
          mode="single"
          captionLayout="dropdown"
          selected={value ? new Date(`${value}T00:00:00`) : undefined}
          onSelect={(d) => {
            if (d) {
              onChange(d.toLocaleDateString("en-CA"));
              setOpen(false);
            }
          }}
          startMonth={new Date(new Date().getFullYear() - 5, 0)}
          endMonth={new Date(new Date().getFullYear() + 5, 11)}
          disabled={[
            ...(min ? [{ before: new Date(`${min}T00:00:00`) }] : []),
            ...(max ? [{ after: new Date(`${max}T00:00:00`) }] : []),
          ]}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
