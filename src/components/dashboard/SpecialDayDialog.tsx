"use client";

import { useState } from "react";
import { Palmtree, Plane, HeartPulse, CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { gardenColors } from "@/config/theme";

export type SpecialDayType = "holiday" | "leave" | "sick";
export type DayPeriod = "morning" | "noon";

export interface SpecialDay {
  id: number;
  type: SpecialDayType;
  startDate: string;
  startPeriod: DayPeriod;
  endDate: string;
  endPeriod: DayPeriod;
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

function startOfDay(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

function fromIsoDate(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

// Each day in the range is worth a full 8h, except the first day (only the
// afternoon if it starts at "noon") and the last day (only the morning if it
// ends at "morning") — the standard half-day-leave accounting pattern.
export function computeSpecialDayHours(
  startDate: Date,
  startPeriod: DayPeriod,
  endDate: Date,
  endPeriod: DayPeriod
): number {
  const start = startOfDay(startDate);
  const end = startOfDay(endDate);
  if (end < start) return 0;

  const totalDays = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;

  if (totalDays === 1) {
    if (startPeriod === "morning" && endPeriod === "noon") return 8;
    if (startPeriod === "noon" && endPeriod === "noon") return 4;
    if (startPeriod === "morning" && endPeriod === "morning") return 4;
    return 0; // starts in the afternoon but "ends" that same morning — invalid range
  }

  const firstDayHours = startPeriod === "morning" ? 8 : 4;
  const lastDayHours = endPeriod === "noon" ? 8 : 4;
  const middleDays = totalDays - 2;
  return firstDayHours + lastDayHours + middleDays * 8;
}

function PeriodToggle({
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

function DatePickerField({
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

function SpecialDayForm({
  editing,
  onOpenChange,
  onSave,
  onUpdate,
}: {
  editing: SpecialDay | null;
  onOpenChange: (open: boolean) => void;
  onSave: (input: Omit<SpecialDay, "id">) => void;
  onUpdate: (id: number, input: Omit<SpecialDay, "id">) => void;
}) {
  const [type, setType] = useState<SpecialDayType>(editing?.type ?? "holiday");
  const [startDate, setStartDate] = useState<Date>(() =>
    editing ? fromIsoDate(editing.startDate) : new Date()
  );
  const [startPeriod, setStartPeriod] = useState<DayPeriod>(editing?.startPeriod ?? "morning");
  const [endDate, setEndDate] = useState<Date>(() =>
    editing ? fromIsoDate(editing.endDate) : new Date()
  );
  const [endPeriod, setEndPeriod] = useState<DayPeriod>(editing?.endPeriod ?? "noon");
  const [notes, setNotes] = useState(editing?.notes ?? "");

  const hours = computeSpecialDayHours(startDate, startPeriod, endDate, endPeriod);
  const canSave = hours > 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) return;
    const payload = {
      type,
      startDate: toIsoDate(startDate),
      startPeriod,
      endDate: toIsoDate(endDate),
      endPeriod,
      hours,
      notes: notes.trim(),
    };
    if (editing) {
      onUpdate(editing.id, payload);
    } else {
      onSave(payload);
    }
    onOpenChange(false);
  }

  return (
    <>
      <DialogHeader>
        <span className="text-[10px] font-semibold text-link uppercase tracking-wide">
          Special Day Logger
        </span>
        <DialogTitle>{editing ? "Edit Off-Day Block" : "Log Holiday / Leave"}</DialogTitle>
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

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide">
              From
            </Label>
            <DatePickerField label="Start date" date={startDate} onChange={setStartDate} />
            <PeriodToggle
              value={startPeriod}
              onChange={setStartPeriod}
              morningLabel="Morning"
              noonLabel="Noon"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide">
              To
            </Label>
            <DatePickerField label="End date" date={endDate} onChange={setEndDate} />
            <PeriodToggle
              value={endPeriod}
              onChange={setEndPeriod}
              morningLabel="Morning"
              noonLabel="Noon"
            />
          </div>
        </div>

        <div className="rounded-md bg-surface-2 border border-garden-border px-3.5 py-2.5 flex items-center justify-between">
          <span className="text-xs text-ink-muted">
            Each day counts as a Half-Day (4h) or Full-Day (8h)
          </span>
          <span className={["text-sm font-bold", canSave ? "text-kale" : "text-error"].join(" ")}>
            {hours}h
          </span>
        </div>
        {!canSave && (
          <p className="text-[10px] text-error -mt-2">
            End must be on or after the start, and can&apos;t end the same morning it starts in the
            afternoon.
          </p>
        )}

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
          disabled={!canSave}
          className="w-full h-9 text-xs font-semibold uppercase tracking-wide gap-1.5"
        >
          <Palmtree className="w-3.5 h-3.5" />
          {editing ? "Save Changes" : "Save Off-Day Block"}
        </Button>
      </form>
    </>
  );
}

export function SpecialDayDialog({
  open,
  onOpenChange,
  onSave,
  onUpdate,
  editing = null,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (input: Omit<SpecialDay, "id">) => void;
  onUpdate?: (id: number, input: Omit<SpecialDay, "id">) => void;
  editing?: SpecialDay | null;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && (
          <SpecialDayForm
            editing={editing}
            onOpenChange={onOpenChange}
            onSave={onSave}
            onUpdate={onUpdate ?? (() => {})}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
