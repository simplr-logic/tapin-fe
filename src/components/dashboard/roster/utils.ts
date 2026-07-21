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

// Snaps any date to the Monday of its ISO week (Mon–Sun).
export function weekStart(d: Date): Date {
  const copy = stripTime(d);
  const dow = copy.getDay(); // 0=Sun
  copy.setDate(copy.getDate() - ((dow + 6) % 7));
  return copy;
}

export function weekEnd(start: Date): Date {
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

export function isSamePeriod(a: Date, b: Date, period: PeriodView): boolean {
  if (period === "day") return a.toLocaleDateString("en-CA") === b.toLocaleDateString("en-CA");
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
  if (period === "day")
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    });
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
  if (pct >= 115)
    return { bg: "bg-error/18", border: "border-error/45", pctColor: gardenColors.error };
  if (pct >= 100)
    return { bg: "bg-success/14", border: "border-success/35", pctColor: gardenColors.success };
  if (pct >= 50)
    return { bg: "bg-yellow/12", border: "border-yellow/30", pctColor: gardenColors.yellow };
  if (pct > 0)
    return { bg: "bg-yellow/6", border: "border-yellow/18", pctColor: gardenColors.yellow };
  return { bg: "bg-surface-2", border: "border-garden-border", pctColor: gardenColors.inkSubtle };
}

export function getPeriodRange(period: PeriodView, date: Date): { start: string; end: string } {
  if (period === "day") {
    const iso = date.toLocaleDateString("en-CA");
    return { start: iso, end: iso };
  }
  if (period === "week") {
    const start = stripTime(date);
    const end = weekEnd(start);
    return { start: start.toLocaleDateString("en-CA"), end: end.toLocaleDateString("en-CA") };
  }
  if (period === "month") {
    const y = date.getFullYear(),
      m = date.getMonth();
    return {
      start: new Date(y, m, 1).toLocaleDateString("en-CA"),
      end: new Date(y, m + 1, 0).toLocaleDateString("en-CA"),
    };
  }
  const y = date.getFullYear();
  return { start: `${y}-01-01`, end: `${y}-12-31` };
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
