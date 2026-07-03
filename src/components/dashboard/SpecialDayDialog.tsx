"use client";

import { useState } from "react";
import { Palmtree, Plane, HeartPulse, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { gardenColors } from "@/config/theme";

export type SpecialDayType = "holiday" | "leave" | "sick";

export interface SpecialDay {
  id: number;
  type: SpecialDayType;
  date: string;
  hours: number;
  notes: string;
}

export const SPECIAL_DAY_TYPES: {
  value: SpecialDayType;
  icon: typeof Palmtree;
  label: string;
  hex: string;
  activeClass: string;
  cardClass: string;
}[] = [
  {
    value: "holiday",
    icon: Palmtree,
    label: "Holiday",
    hex: gardenColors.warning,
    activeClass: "bg-warning/10 border-warning/35 text-warning",
    cardClass: "bg-warning/6 border-warning/20",
  },
  {
    value: "leave",
    icon: Plane,
    label: "Leave",
    hex: gardenColors.link,
    activeClass: "bg-link/10 border-link/35 text-link",
    cardClass: "bg-link/6 border-link/20",
  },
  {
    value: "sick",
    icon: HeartPulse,
    label: "Sick",
    hex: gardenColors.error,
    activeClass: "bg-error/10 border-error/35 text-error",
    cardClass: "bg-error/6 border-error/20",
  },
];

function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function SpecialDayForm({
  onOpenChange,
  onSave,
}: {
  onOpenChange: (open: boolean) => void;
  onSave: (input: Omit<SpecialDay, "id">) => void;
}) {
  const [type, setType] = useState<SpecialDayType>("holiday");
  const [date, setDate] = useState<Date>(() => new Date());
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [hours, setHours] = useState(8);
  const [notes, setNotes] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSave({ type, date: toIsoDate(date), hours, notes: notes.trim() });
    onOpenChange(false);
  }

  return (
    <>
      <DialogHeader>
        <span className="text-[10px] font-semibold text-link uppercase tracking-wide">
          Special Day Logger
        </span>
        <DialogTitle>Log Holiday / Leave</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide mb-1">
            Off-day type
          </Label>
          <div className="grid grid-cols-3 gap-2">
            {SPECIAL_DAY_TYPES.map(({ value, icon: Icon, label, activeClass }) => (
              <button
                key={value}
                type="button"
                onClick={() => setType(value)}
                className={[
                  "py-2 px-1 rounded-md border text-xs font-semibold flex flex-col items-center gap-1.5 transition-colors",
                  type === value
                    ? activeClass
                    : "bg-surface-2 border-garden-border text-ink-subtle hover:text-ink-muted",
                ].join(" ")}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide mb-1">
            Date of record
          </Label>
          <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
            <PopoverTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start font-normal text-ink"
                />
              }
            >
              <CalendarIcon className="w-3.5 h-3.5 text-ink-subtle" />
              {date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </PopoverTrigger>
            <PopoverContent align="start" className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => {
                  if (d) {
                    setDate(d);
                    setIsDatePickerOpen(false);
                  }
                }}
                autoFocus
              />
            </PopoverContent>
          </Popover>
          <p className="text-[10px] text-ink-subtle mt-1">
            Please specify a date within the active week cycle.
          </p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide">
              Hours credit
            </Label>
            <span className="text-xs font-bold text-kale">{hours} Hours</span>
          </div>
          <Slider
            value={hours}
            onValueChange={(v) => setHours(v as number)}
            min={1}
            max={12}
            step={0.5}
          />
          <div className="flex justify-between text-[9px] text-ink-subtle mt-1.5">
            <span>1h</span>
            <span>4h (Half-Day)</span>
            <span>8h (Full-Day)</span>
            <span>12h</span>
          </div>
        </div>

        <div>
          <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide mb-1">
            Reason / Notes
          </Label>
          <Input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Christmas Day, National Day"
          />
        </div>

        <Button
          type="submit"
          className="w-full h-9 text-xs font-semibold uppercase tracking-wide gap-1.5"
        >
          <Palmtree className="w-3.5 h-3.5" />
          Save Off-Day Block
        </Button>
      </form>
    </>
  );
}

export function SpecialDayDialog({
  open,
  onOpenChange,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (input: Omit<SpecialDay, "id">) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && <SpecialDayForm onOpenChange={onOpenChange} onSave={onSave} />}
      </DialogContent>
    </Dialog>
  );
}
