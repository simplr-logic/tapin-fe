"use client";

import { Plus, Trash2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { MonthlyTarget } from "@/components/providers/ProjectsProvider";

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function generateMonthOptions(): { value: string; label: string }[] {
  const options: { value: string; label: string }[] = [];
  const now = new Date();
  const startYear = now.getFullYear() - 3;
  const endYear = now.getFullYear() + 5;
  for (let y = startYear; y <= endYear; y++) {
    for (let m = 0; m < 12; m++) {
      options.push({
        value: `${y}-${String(m + 1).padStart(2, "0")}`,
        label: `${MONTH_NAMES[m]} ${y}`,
      });
    }
  }
  return options;
}

const MONTH_OPTIONS = generateMonthOptions();

export function nextMonthStr(monthStr: string): string {
  const [y, m] = monthStr.split("-").map(Number);
  return new Date(y, m, 1).toLocaleDateString("en-CA").slice(0, 7);
}

interface MonthlyTargetsEditorProps {
  targets: MonthlyTarget[];
  startDate?: string;
  onChange: (targets: MonthlyTarget[]) => void;
}

export function MonthlyTargetsEditor({ targets, startDate, onChange }: MonthlyTargetsEditorProps) {
  function update(index: number, patch: Partial<MonthlyTarget>) {
    onChange(targets.map((mt, i) => (i === index ? { ...mt, ...patch } : mt)));
  }

  function remove(index: number) {
    if (targets.length <= 1) return;
    onChange(targets.filter((_, i) => i !== index));
  }

  function add() {
    const last = targets[targets.length - 1];
    const month = last
      ? nextMonthStr(last.month)
      : (startDate?.slice(0, 7) ?? new Date().toLocaleDateString("en-CA").slice(0, 7));
    onChange([...targets, { month, hours: 0 }]);
  }

  const totalHours = targets.reduce((s, t) => s + t.hours, 0);

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide">
          Target hours
        </Label>
        {targets.length > 1 && (
          <span className="text-[10px] text-ink-muted">
            Subtotal: <span className="font-semibold text-ink">{totalHours}h</span> across{" "}
            {targets.length} months
          </span>
        )}
      </div>

      <div className="space-y-2">
        {targets.map((mt, i) => (
          <div key={i} className="flex items-center gap-2">
            <Select
              value={mt.month}
              onValueChange={(val) => val !== null && update(i, { month: val })}
            >
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select month" />
              </SelectTrigger>
              <SelectContent>
                {MONTH_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="relative w-24 shrink-0">
              <Input
                type="number"
                min={0}
                step={1}
                value={mt.hours}
                className="pr-6"
                onChange={(e) =>
                  update(i, { hours: Math.max(0, Math.floor(Number(e.target.value))) })
                }
              />
              <span className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                h
              </span>
            </div>
            <button
              type="button"
              onClick={() => remove(i)}
              disabled={targets.length === 1}
              className="text-ink-subtle hover:text-error transition-colors shrink-0 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={add}
        className="mt-2 flex items-center gap-1 text-xs font-medium text-link hover:text-link-hover transition-colors"
      >
        <Plus className="w-3.5 h-3.5" />
        Add month
      </button>
    </div>
  );
}
