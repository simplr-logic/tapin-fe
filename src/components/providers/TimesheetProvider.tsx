"use client";

import { createContext, type ReactNode, useContext, useMemo, useSyncExternalStore } from "react";

import { type Project, sumLogs } from "@/components/providers/ProjectsProvider";

export interface TimesheetProjectSnapshot {
  id: number;
  title: string;
  company: string;
  loggedMinutes: number;
  targetHours: number;
}

export interface TimesheetRecord {
  id: string;
  monthLabel: string; // "July 2026"
  monthKey: string; // "2026-07"
  periodStart: string; // "2026-07-01"
  periodEnd: string; // "2026-07-07" (date of submission)
  submittedAt: string;
  submittedBy: string;
  totalLoggedHours: number;
  totalTargetHours: number;
  projects: TimesheetProjectSnapshot[];
}

interface TimesheetContextValue {
  records: TimesheetRecord[];
  currentMonthLabel: string;
  currentMonthRecord: TimesheetRecord | null;
  isMonthSubmitted: (date: Date) => boolean;
  submitTimesheet: (signature: string, projects: Project[]) => void;
  unsubmitTimesheet: (monthKey: string) => void;
}

const STORAGE_KEY = "tapin.timesheets";
// localStorage's native "storage" event only fires in *other* tabs, not the one
// that made the write — this custom event covers the same-tab case.
const LOCAL_UPDATE_EVENT = "tapin:timesheets-updated";

function readRaw(): string {
  return window.localStorage.getItem(STORAGE_KEY) ?? "[]";
}

function writeRaw(value: string) {
  window.localStorage.setItem(STORAGE_KEY, value);
  window.dispatchEvent(new Event(LOCAL_UPDATE_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener(LOCAL_UPDATE_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(LOCAL_UPDATE_EVENT, callback);
  };
}

function getSnapshot(): string {
  return readRaw();
}

function getServerSnapshot(): string {
  return "[]";
}

function toMonthKey(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthLabel(date: Date = new Date()): string {
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

function monthStart(date: Date): string {
  return new Date(date.getFullYear(), date.getMonth(), 1).toLocaleDateString("en-CA");
}

const TimesheetContext = createContext<TimesheetContextValue | null>(null);

export function TimesheetProvider({ children }: { children: ReactNode }) {
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const records: TimesheetRecord[] = useMemo(() => {
    try {
      return JSON.parse(raw) as TimesheetRecord[];
    } catch {
      return [];
    }
  }, [raw]);

  const currentMonthLabel = getMonthLabel();
  const currentMonthRecord = records.find((r) => r.monthKey === toMonthKey(new Date())) ?? null;

  function isMonthSubmitted(date: Date): boolean {
    const key = toMonthKey(date);
    return records.some((r) => r.monthKey === key);
  }

  function submitTimesheet(signature: string, projects: Project[]) {
    const now = new Date();
    const start = monthStart(now);
    const end = now.toLocaleDateString("en-CA");
    const record: TimesheetRecord = {
      id: `ts-${Date.now()}`,
      monthLabel: getMonthLabel(now),
      monthKey: toMonthKey(now),
      periodStart: start,
      periodEnd: end,
      submittedAt: now.toISOString(),
      submittedBy: signature,
      totalLoggedHours: projects.reduce((sum, p) => sum + sumLogs(p.logs, start, end) / 60, 0),
      totalTargetHours: projects.reduce((sum, p) => sum + p.targetHours, 0),
      projects: projects.map((p) => ({
        id: p.id,
        title: p.title,
        company: p.company,
        loggedMinutes: sumLogs(p.logs, start, end),
        targetHours: p.targetHours,
      })),
    };
    const key = toMonthKey(now);
    const next = [record, ...records.filter((r) => r.monthKey !== key)];
    writeRaw(JSON.stringify(next));
  }

  function unsubmitTimesheet(monthKey: string) {
    writeRaw(JSON.stringify(records.filter((r) => r.monthKey !== monthKey)));
  }

  return (
    <TimesheetContext.Provider
      value={{
        records,
        currentMonthLabel,
        currentMonthRecord,
        isMonthSubmitted,
        submitTimesheet,
        unsubmitTimesheet,
      }}
    >
      {children}
    </TimesheetContext.Provider>
  );
}

export function useTimesheets() {
  const ctx = useContext(TimesheetContext);
  if (!ctx) throw new Error("useTimesheets must be used within a TimesheetProvider");
  return ctx;
}
