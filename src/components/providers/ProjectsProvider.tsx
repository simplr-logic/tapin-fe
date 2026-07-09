"use client";

import { createContext, type ReactNode, useContext, useState } from "react";

import { MAX_LEDGER_ENTRIES } from "@/config/constants";
import ledgerSeed from "@/data/ledger.json";
import projectsSeed from "@/data/projects.json";

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
  addProject: (input: NewProjectInput) => number;
  updateProject: (id: number, patch: ProjectPatch) => void;
  adjustLoggedMinutes: (id: number, deltaMinutes: number, note?: string, date?: string) => void;
  removeProject: (id: number) => void;
  addComment: (id: number, text: string) => void;
}

const initialProjects: Project[] = projectsSeed as Project[];
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
  const [projects, setProjects] = useState<Project[]>(initialProjects);
  const [comments, setComments] = useState<Record<number, Comment[]>>({});
  const [ledger, setLedger] = useState<LedgerEntry[]>(initialLedger);
  const [nextId, setNextId] = useState(initialProjects.length + 1);

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
    const targetDate = date ?? new Date().toLocaleDateString("en-CA");
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
      [id]: [...(prev[id] ?? []), { id: Date.now(), text, timestamp: nowTimestamp() }],
    }));
  }

  return (
    <ProjectsContext.Provider
      value={{
        projects,
        comments,
        ledger,
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
