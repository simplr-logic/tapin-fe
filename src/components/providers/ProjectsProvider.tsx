"use client";

import { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { MAX_LEDGER_ENTRIES } from "@/config/constants";
import ledgerSeed from "@/data/ledger.json";
import projectsSeed from "@/data/projects.json";
import { buildSealedBreaks, computeStreak } from "@/hooks/useStreak";

const PROJECTS_KEY = "tapin:projects";
const STREAK_BREAKS_KEY = "tapin:streak-breaks";

export type ProjectIcon = "truck" | "building" | "grid" | "cloud";

export interface MonthlyTarget {
  month: string; // "YYYY-MM"
  hours: number;
}

export interface Project {
  id: number;
  title: string;
  company: string;
  assignee: string;
  logs: Record<string, number>;
  targetHours: number;
  icon: ProjectIcon;
  locked: boolean;
  startDate?: string;
  endDate?: string;
  monthlyTargets?: MonthlyTarget[];
}

export interface Comment {
  id: number;
  text: string;
  timestamp: string;
  date?: string;
}

export interface LedgerEntry {
  id: number;
  timestamp: string;
  projectTitle: string;
  company: string;
  icon: ProjectIcon;
  note: string;
}

export type NewProjectInput = Omit<Project, "id" | "logs">;
export type ProjectPatch = Partial<Omit<Project, "id">>;

export function sumLogs(logs: Record<string, number>, start?: string, end?: string): number {
  return Object.entries(logs)
    .filter(([d]) => (!start || d >= start) && (!end || d <= end))
    .reduce((sum, [, m]) => sum + m, 0);
}

interface ProjectsContextValue {
  projects: Project[];
  comments: Record<number, Comment[]>;
  ledger: LedgerEntry[];
  streak: number;
  addProject: (input: NewProjectInput) => number;
  updateProject: (id: number, patch: ProjectPatch) => void;
  adjustLoggedMinutes: (id: number, deltaMinutes: number, note?: string, date?: string) => void;
  removeProject: (id: number) => void;
  addComment: (id: number, text: string) => void;
}

const initialLedger: LedgerEntry[] = ledgerSeed as LedgerEntry[];

function nowTimestamp(): string {
  return new Date().toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const ProjectsContext = createContext<ProjectsContextValue | null>(null);

export function ProjectsProvider({ children }: { children: ReactNode }) {
  const [synced, setSynced] = useState(false);
  const [projects, setProjects] = useState<Project[]>(projectsSeed as Project[]);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [ledger, setLedger] = useState<LedgerEntry[]>(initialLedger);
  const [nextId, setNextId] = useState((projectsSeed as Project[]).length + 1);
  const [sealedBreaks, setSealedBreaks] = useState<Set<string>>(new Set());
  const streak = useMemo(() => {
    const allLogs: Record<string, number> = {};
    for (const p of projects) {
      for (const [date, mins] of Object.entries(p.logs)) {
        allLogs[date] = (allLogs[date] ?? 0) + mins;
      }
    }
    return computeStreak(allLogs, sealedBreaks);
  }, [projects, sealedBreaks]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(PROJECTS_KEY);
      const storedBreaks = localStorage.getItem(STREAK_BREAKS_KEY);
      const existingBreaks: Set<string> = storedBreaks
        ? new Set(JSON.parse(storedBreaks) as string[])
        : new Set();

      let mergedProjects = projectsSeed as Project[];
      if (stored) {
        const loaded = JSON.parse(stored) as Project[];
        // Seed logs are the baseline; user's non-zero entries override.
        // Zero values in localStorage are ignored so they don't shadow seed data.
        mergedProjects = loaded.map((p) => {
          const seed = (projectsSeed as Project[]).find((s) => s.id === p.id);
          if (!seed) return p;
          const userLogs = Object.fromEntries(Object.entries(p.logs).filter(([, v]) => v > 0));
          return { ...p, logs: { ...seed.logs, ...userLogs } };
        });
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setProjects(mergedProjects);
      }

      // Seal any past working days with no logs — retroactive entries won't heal these gaps.
      const allLogs: Record<string, number> = {};
      for (const p of mergedProjects) {
        for (const [date, mins] of Object.entries(p.logs)) {
          allLogs[date] = (allLogs[date] ?? 0) + mins;
        }
      }
      const breaks = buildSealedBreaks(allLogs, existingBreaks);
      localStorage.setItem(STREAK_BREAKS_KEY, JSON.stringify([...breaks]));

      setSealedBreaks(breaks);
    } catch {
      /* ignore */
    }
    setSynced(true);
  }, []);

  useEffect(() => {
    if (!synced) return;
    localStorage.setItem(PROJECTS_KEY, JSON.stringify(projects));
  }, [projects, synced]);

  function addLedgerEntry(project: Project, note: string) {
    setLedger((prev) =>
      [
        {
          id: Date.now(),
          timestamp: nowTimestamp(),
          projectTitle: project.title,
          company: project.company,
          icon: project.icon,
          note,
        },
        ...prev,
      ].slice(0, MAX_LEDGER_ENTRIES)
    );
  }

  function addProject(input: NewProjectInput) {
    const id = nextId;
    setNextId((n) => n + 1);
    setProjects((prev) => [...prev, { ...input, id, logs: {} }]);
    return id;
  }

  function updateProject(id: number, patch: ProjectPatch) {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function adjustLoggedMinutes(id: number, deltaMinutes: number, note?: string, date?: string) {
    const today = new Date().toLocaleDateString("en-CA");
    const targetDate = date ?? today;
    const project = projects.find((p) => p.id === id);
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              logs: {
                ...p.logs,
                [targetDate]: Math.max(0, (p.logs[targetDate] ?? 0) + deltaMinutes),
              },
            }
          : p
      )
    );
    if (!project || deltaMinutes === 0 || note === undefined) return;
    addLedgerEntry(project, note);
  }

  function removeProject(id: number) {
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setComments((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  }

  function addComment(id: number, text: string) {
    setComments((prev) => ({
      ...prev,
      [id]: [
        ...(prev[id] ?? []),
        {
          id: Date.now(),
          text,
          timestamp: nowTimestamp(),
          date: new Date().toLocaleDateString("en-CA"),
        },
      ],
    }));
  }

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        comments,
        ledger,
        streak,
        addProject,
        updateProject,
        adjustLoggedMinutes,
        removeProject,
        addComment,
      }}
    >
      {children}
    </ProjectsContext.Provider>
  );
}

export function useProjects() {
  const ctx = useContext(ProjectsContext);
  if (!ctx) throw new Error("useProjects must be used within a ProjectsProvider");
  return ctx;
}
