"use client";

import { CalendarDays, Check, ChevronDown, Flame, ShieldCheck, UserCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { useSyncExternalStore } from "react";

import { Calendar } from "@/components/ui/calendar";

import LiveClock from "./LiveClock";

const STORAGE_KEY = "tapin.checkins";
const LOCAL_EVENT = "tapin:checkins-updated";

function todayIso(): string {
  return new Date().toLocaleDateString("en-CA");
}

function readRaw(): string {
  if (typeof window === "undefined") return "[]";
  return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
}

function writeRaw(value: string) {
  window.localStorage.setItem(STORAGE_KEY, value);
  window.dispatchEvent(new Event(LOCAL_EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(LOCAL_EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(LOCAL_EVENT, cb);
  };
}

function getSnapshot() {
  return readRaw();
}
function getServerSnapshot() {
  return "[]";
}

function computeStreak(checkins: Set<string>): number {
  let streak = 0;
  const d = new Date();
  while (true) {
    const iso = d.toLocaleDateString("en-CA");
    if (!checkins.has(iso)) break;
    streak++;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

interface WeekDot {
  iso: string;
  letter: string;
  status: "checked" | "today" | "future" | "missed";
}

function getWeekDots(checkins: Set<string>): WeekDot[] {
  const today = new Date();
  const todayStr = today.toLocaleDateString("en-CA");
  const diffToMonday = (today.getDay() + 6) % 7;
  const monday = new Date(today);
  monday.setDate(today.getDate() - diffToMonday);
  const letters = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const iso = d.toLocaleDateString("en-CA");
    const checked = checkins.has(iso);
    const isToday = iso === todayStr;
    const isFuture = iso > todayStr;
    const status: WeekDot["status"] = checked
      ? "checked"
      : isToday
        ? "today"
        : isFuture
          ? "future"
          : "missed";
    return { iso, letter: letters[i], status };
  });
}

export default function DailyAttendance() {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const [calendarOpen, setCalendarOpen] = useState(false);

  const checkins = useMemo<Set<string>>(() => {
    try {
      return new Set(JSON.parse(raw) as string[]);
    } catch {
      return new Set();
    }
  }, [raw]);

  const today = todayIso();
  const checkedInToday = checkins.has(today);
  const streak = useMemo(() => computeStreak(checkins), [checkins]);
  const weekDots = useMemo(() => getWeekDots(checkins), [checkins]);
  const checkinDates = useMemo(
    () => Array.from(checkins).map((iso) => new Date(`${iso}T00:00:00`)),
    [checkins]
  );

  function handleCheckIn() {
    if (checkedInToday) return;
    const next = [...Array.from(checkins), today].sort();
    writeRaw(JSON.stringify(next));
  }

  const dateStr = new Date()
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();

  return (
    <div className="bg-white rounded-lg border border-garden-border shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-garden-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-ink-muted text-xs font-medium tracking-wide uppercase">
          <ShieldCheck className="w-3.5 h-3.5" />
          Daily Attendance
        </div>
        <span
          className={[
            "text-[10px] font-semibold px-2 py-0.5 rounded-full border tracking-wide",
            checkedInToday
              ? "bg-success/10 text-success border-success/25"
              : "bg-warning/10 text-warning border-warning/25",
          ].join(" ")}
        >
          {checkedInToday ? "CHECKED IN" : "PENDING IN"}
        </span>
      </div>

      <div className="px-5 py-6 space-y-5">
        <div className="text-center space-y-0.5">
          <p className="text-[10px] text-ink-subtle tracking-widest font-medium">{dateStr}</p>
          <p className="text-[2.75rem] font-light tracking-tight text-ink font-mono leading-none">
            <LiveClock />
          </p>
        </div>

        <button
          onClick={handleCheckIn}
          disabled={checkedInToday}
          className={[
            "w-full h-11 flex items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors shadow-card",
            checkedInToday
              ? "bg-success/10 text-success border border-success/30 cursor-default"
              : "bg-kale hover:bg-kale-hover active:bg-kale-hover text-white",
          ].join(" ")}
        >
          {checkedInToday ? (
            <>
              <Check className="w-4 h-4" />
              Checked In Today
            </>
          ) : (
            <>
              <UserCheck className="w-4 h-4" />
              Perform Daily Check-In
            </>
          )}
        </button>

        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-ink-subtle tracking-wide uppercase font-medium">
              This Week
            </span>
            {streak >= 3 && (
              <span className="flex items-center gap-1 text-[11px] font-semibold text-warning">
                <Flame className="w-3 h-3" />
                {streak} Day Streak
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            {weekDots.map((dot) => (
              <div key={dot.iso} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={[
                    "w-full aspect-square rounded-md flex items-center justify-center text-[10px] font-semibold transition-all",
                    dot.status === "checked"
                      ? "bg-success text-white"
                      : dot.status === "today"
                        ? "ring-2 ring-link ring-offset-1 bg-link/10 text-link"
                        : "bg-surface-2 text-ink-subtle",
                  ].join(" ")}
                >
                  {dot.status === "checked" ? (
                    <Check className="w-3 h-3" strokeWidth={3} />
                  ) : (
                    dot.letter.slice(0, 1)
                  )}
                </div>
                <span className="text-[9px] text-ink-subtle font-medium">
                  {dot.letter.slice(0, 1)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCalendarOpen((o) => !o)}
          className="w-full flex items-center justify-between text-[10px] font-medium text-ink-muted hover:text-ink transition-colors py-1"
        >
          <span className="flex items-center gap-1.5">
            <CalendarDays className="w-3.5 h-3.5" />
            View Attendance Calendar
          </span>
          <ChevronDown
            className={["w-3.5 h-3.5 transition-transform", calendarOpen ? "rotate-180" : ""].join(
              " "
            )}
          />
        </button>

        {calendarOpen && (
          <div className="-mx-5 border-t border-garden-border pt-3 px-2">
            <Calendar
              mode="multiple"
              selected={checkinDates}
              onSelect={() => {}}
              className="mx-auto"
            />
          </div>
        )}
      </div>
    </div>
  );
}
