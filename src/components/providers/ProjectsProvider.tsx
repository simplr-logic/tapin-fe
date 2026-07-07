"use client";

import { createContext, useContext, useState, type ReactNode } from "react";
import projectsSeed from "@/data/projects.json";
import ledgerSeed from "@/data/ledger.json";
import { MAX_LEDGER_ENTRIES } from "@/config/constants";

export type ProjectIcon = "truck" | "building" | "grid" | "cloud";

export interface Project {
  id: number;
  title: string;
  company: string;
  assignee: string;
  loggedMinutes: number;
  targetHours: number;
  icon: ProjectIcon;
  // Locked projects stay visible everywhere (roster grid/progress, tables)
  // but can't be tapped/adjusted — managed from the Projects page, not tied
  // to which week/period is being viewed.
  locked: boolean;
}

export interface Comment {
  id: number;
  text: string;
  timestamp: string;
}

// Denormalized (title/company/icon captured at the time of the entry) so the
// ledger reads correctly as a historical record even if a project is later
// renamed or deleted — an audit trail shouldn't rewrite itself.
export interface LedgerEntry {
  id: number;
  timestamp: string;
  projectTitle: string;
  company: string;
  icon: ProjectIcon;
  note: string;
}

export type NewProjectInput = Omit<Project, "id" | "loggedMinutes">;
export type ProjectPatch = Partial<Omit<Project, "id">>;

interface ProjectsContextValue {
  projects: Project[];
  comments: Record<number, Comment[]>;
  ledger: LedgerEntry[];
  addProject: (input: NewProjectInput) => number;
  updateProject: (id: number, patch: ProjectPatch) => void;
  adjustLoggedMinutes: (id: number, deltaMinutes: number, note?: string) => void;
  removeProject: (id: number) => void;
  addComment: (id: number, text: string) => void;
}

const initialProjects: Project[] = projectsSeed as Project[];
const initialLedger: LedgerEntry[] = ledgerSeed as LedgerEntry[];

function formatHoursShort(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

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
    setProjects((prev) => [...prev, { ...input, id, loggedMinutes: 0 }]);
    return id;
  }

  function updateProject(id: number, patch: ProjectPatch) {
    setProjects((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function adjustLoggedMinutes(id: number, deltaMinutes: number, note?: string) {
    const project = projects.find((p) => p.id === id);
    setProjects((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, loggedMinutes: Math.max(0, p.loggedMinutes + deltaMinutes) } : p
      )
    );
    if (!project || deltaMinutes === 0) return;
    const sign = deltaMinutes > 0 ? "+" : "−";
    const defaultNote = `${sign}${formatHoursShort(Math.abs(deltaMinutes))} ${deltaMinutes > 0 ? "logged" : "unlogged"}`;
    addLedgerEntry(project, note ?? defaultNote);
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
