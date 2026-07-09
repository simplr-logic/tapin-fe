"use client";

import { Palmtree, Plane } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { gardenColors } from "@/config/theme";

import {
  DatePickerField,
  fromIsoDate,
  PeriodToggle,
  startOfDay,
  toIsoDate,
} from "./SpecialDayHelpers";

export type SpecialDayType = "holiday" | "leave";
export type DayPeriod = "morning" | "noon";

export const LEAVE_TYPES = [
  "Annual Leave",
  "Medical Leave",
  "Maternity Leave",
  "Paternity Leave",
  "Emergency Leave",
  "Unpaid Leave",
] as const;

export type LeaveType = (typeof LEAVE_TYPES)[number];

export interface SpecialDay {
  id: number;
  type: SpecialDayType;
  leaveType?: LeaveType;
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
];

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
  const [leaveType, setLeaveType] = useState<LeaveType>(editing?.leaveType ?? "Annual Leave");
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
      ...(type === "leave" ? { leaveType } : {}),
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
          <div className="grid grid-cols-2 gap-2">
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

        {type === "leave" && (
          <div>
            <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide mb-1">
              Leave type
            </Label>
            <Select value={leaveType} onValueChange={(v) => setLeaveType(v as LeaveType)}>
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {LEAVE_TYPES.map((lt) => (
                  <SelectItem key={lt} value={lt}>
                    {lt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

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
