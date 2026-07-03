"use client";

import { createContext, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import type { Project } from "@/components/providers/ProjectsProvider";

export interface TimesheetProjectSnapshot {
  id: number;
  title: string;
  company: string;
  loggedMinutes: number;
  targetHours: number;
}

export interface TimesheetRecord {
  id: string;
  weekLabel: string;
  submittedAt: string;
  submittedBy: string;
  totalLoggedHours: number;
  totalTargetHours: number;
  projects: TimesheetProjectSnapshot[];
}

interface TimesheetContextValue {
  records: TimesheetRecord[];
  currentWeekLabel: string;
  currentWeekRecord: TimesheetRecord | null;
  submitTimesheet: (signature: string, projects: Project[]) => void;
}

const STORAGE_KEY = "tapin.timesheets";
// localStorage's native "storage" event only fires in *other* tabs, not the one
// that made the write — this custom event covers the same-tab case so the
// provider updates immediately after submitTimesheet, while "storage" still
// keeps other open tabs in sync.
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

// Server has no localStorage — render as if no timesheets are archived yet
// until the client takes over on first paint.
function getServerSnapshot(): string {
  return "[]";
}

function getIsoWeek(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

/** "Week 27 · Jun 29 – Jul 5, 2026" — the Monday-Sunday cycle containing `date`. */
export function getWeekLabel(date: Date = new Date()): string {
  const day = date.getDay();
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(date);
  monday.setDate(date.getDate() - diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `Week ${getIsoWeek(date)} · ${fmt(monday)} – ${fmt(sunday)}, ${sunday.getFullYear()}`;
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

  const currentWeekLabel = getWeekLabel();
  const currentWeekRecord = records.find((r) => r.weekLabel === currentWeekLabel) ?? null;

  function submitTimesheet(signature: string, projects: Project[]) {
    const record: TimesheetRecord = {
      id: `ts-${Date.now()}`,
      weekLabel: currentWeekLabel,
      submittedAt: new Date().toISOString(),
      submittedBy: signature,
      totalLoggedHours: projects.reduce((sum, p) => sum + p.loggedMinutes / 60, 0),
      totalTargetHours: projects.reduce((sum, p) => sum + p.targetHours, 0),
      projects: projects.map((p) => ({
        id: p.id,
        title: p.title,
        company: p.company,
        loggedMinutes: p.loggedMinutes,
        targetHours: p.targetHours,
      })),
    };
    // Re-signing the same week replaces its record rather than duplicating it.
    const next = [record, ...records.filter((r) => r.weekLabel !== currentWeekLabel)];
    writeRaw(JSON.stringify(next));
  }

  return (
    <TimesheetContext.Provider
      value={{ records, currentWeekLabel, currentWeekRecord, submitTimesheet }}
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
