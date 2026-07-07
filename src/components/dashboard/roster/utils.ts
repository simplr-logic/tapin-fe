import { SPECIAL_DAY_TYPES, type SpecialDay } from "@/components/dashboard/SpecialDayDialog";
import { gardenColors } from "@/config/theme";

import type { PeriodView } from "@/config/constants";

export function getPct(loggedMinutes: number, targetHours: number): number {
  return Math.round((loggedMinutes / 60 / targetHours) * 100);
}

export function formatHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatSpecialDate(iso: string): string {
  const d = new Date(`${iso}T00:00:00`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

export function formatSpecialRange(day: SpecialDay): string {
  if (day.startDate === day.endDate) return formatSpecialDate(day.startDate);
  return `${formatSpecialDate(day.startDate)} – ${formatSpecialDate(day.endDate)}`;
}

export function formatSpecialRangeAll(days: SpecialDay[]): string {
  const starts = days.map((d) => d.startDate).sort();
  const ends = days.map((d) => d.endDate).sort();
  const start = starts[0];
  const end = ends[ends.length - 1];
  if (start === end) return formatSpecialDate(start);
  return `${formatSpecialDate(start)} – ${formatSpecialDate(end)}`;
}

export function formatTypesSummary(days: SpecialDay[]): string {
  const labels = Array.from(
    new Set(days.map((d) => SPECIAL_DAY_TYPES.find((t) => t.value === d.type)!.label))
  );
  return labels.join(" + ");
}

export function shortDate(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function stripTime(d: Date): Date {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
}

// A "week" is a rolling 7-day window starting on whatever date is picked —
// pick Jul 6 and the window is Jul 6 – Jul 12, not snapped to a calendar
// Monday.
export function weekEnd(start: Date): Date {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

// Picking any date outside the current week/month/year is a read-only
// projection — there's no real historical backend, only the current week's
// live data. For "week" that means: does today fall inside the picked
// 7-day window?
export function isSamePeriod(a: Date, b: Date, period: PeriodView): boolean {
  if (period === "week") {
    const start = stripTime(a);
    const end = weekEnd(start);
    const target = stripTime(b);
    return target >= start && target <= end;
  }
  if (period === "month")
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
  return a.getFullYear() === b.getFullYear();
}

export function getPeriodLabel(period: PeriodView, date: Date): string {
  if (period === "week") {
    const start = stripTime(date);
    const end = weekEnd(start);
    return `${shortDate(start)} – ${shortDate(end)}, ${end.getFullYear()}`;
  }
  if (period === "month")
    return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  return String(date.getFullYear());
}

// Project heat tiers deliberately never use "warning" (the brownish tone) —
// that hue is reserved for Holiday special-day blocks. Projects only ever
// read as success (on track), open (near/over target), or error (well over).
export function getHeatStyle(pct: number): { bg: string; border: string; pctColor: string } {
  if (pct >= 120)
    return { bg: "bg-error/18", border: "border-error/45", pctColor: gardenColors.error };
  if (pct >= 100)
    return { bg: "bg-error/12", border: "border-error/32", pctColor: gardenColors.error };
  if (pct >= 85) return { bg: "bg-open/14", border: "border-open/35", pctColor: gardenColors.open };
  if (pct >= 60)
    return { bg: "bg-success/14", border: "border-success/35", pctColor: gardenColors.success };
  if (pct >= 30)
    return { bg: "bg-success/8", border: "border-success/22", pctColor: gardenColors.success };
  return { bg: "bg-surface-2", border: "border-garden-border", pctColor: gardenColors.inkSubtle };
}

export function getShortCode(title: string): string {
  const words = title.trim().split(/\s+/);
  if (words.length > 1)
    return words
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase();
  return title.slice(0, 3).toUpperCase();
}
