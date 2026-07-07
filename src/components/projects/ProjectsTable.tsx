"use client";

import { useState } from "react";
import {
  Truck,
  Building2,
  Cloud,
  LayoutGrid,
  Pencil,
  Trash2,
  Plus,
  FolderKanban,
  Lock,
  Unlock,
} from "lucide-react";
import { useProjects, type Project } from "@/components/providers/ProjectsProvider";
import { ProjectFormDialog } from "@/components/projects/ProjectFormDialog";
import { getComplianceColor } from "@/config/theme";

const PROJECT_ICONS = {
  truck: Truck,
  building: Building2,
  grid: LayoutGrid,
  cloud: Cloud,
} as const;

function getPct(loggedMinutes: number, targetHours: number): number {
  return Math.round((loggedMinutes / 60 / targetHours) * 100);
}

function formatHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function getStatusStyle(pct: number): { color: string; label: string } {
  const label = pct >= 100 ? "Exceeded" : pct >= 85 ? "Near target" : "Under target";
  return { color: getComplianceColor(pct), label };
}

export function ProjectsTable() {
  const { projects, addProject, updateProject, removeProject } = useProjects();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  return (
    <div className="bg-white rounded-lg border border-garden-border shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-garden-border flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 text-ink-muted text-xs font-medium tracking-wide uppercase">
          <FolderKanban className="w-3.5 h-3.5" />
          All Projects
          <span className="text-[10px] font-semibold text-ink-muted bg-surface-2 px-2 py-0.5 rounded-full normal-case tracking-normal">
            {projects.length}
          </span>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center gap-1.5 text-xs bg-kale hover:bg-kale-hover text-white rounded-md px-3 py-1.5 transition-colors font-medium shadow-card"
        >
          <Plus className="w-3.5 h-3.5" />
          New Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="px-5 py-10 text-center text-xs text-ink-subtle">
          No projects yet.{" "}
          <span
            className="font-semibold text-link cursor-pointer hover:underline"
            onClick={() => setIsCreateOpen(true)}
          >
            Create one
          </span>{" "}
          to get started.
        </div>
      ) : (
        <div className="divide-y divide-garden-border">
          {projects.map((project) => {
            const pct = getPct(project.loggedMinutes, project.targetHours);
            const status = getStatusStyle(pct);
            const Icon = PROJECT_ICONS[project.icon];

            return (
              <div
                key={project.id}
                className={[
                  "px-5 py-3.5 flex items-center gap-4 hover:bg-surface-2/60 transition-colors",
                  project.locked ? "bg-surface-2/40" : "",
                ].join(" ")}
              >
                <div
                  className="w-9 h-9 rounded-md flex items-center justify-center shrink-0"
                  style={{ backgroundColor: status.color }}
                >
                  <Icon className="w-4 h-4 text-white" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <p className="text-sm font-semibold text-ink truncate">{project.title}</p>
                    {project.locked && (
                      <span className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-ink-subtle bg-surface-2 border border-garden-border-strong rounded-full px-1.5 py-0.5 shrink-0">
                        <Lock className="w-2.5 h-2.5" />
                        Locked
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-ink-muted truncate">
                    {project.company} · Assignee {project.assignee}
                  </p>
                </div>

                <div className="hidden sm:flex flex-col items-end w-28 shrink-0">
                  <span className="text-xs font-semibold text-ink">
                    {formatHours(project.loggedMinutes)} / {project.targetHours}h
                  </span>
                  <span className="text-[10px] font-semibold" style={{ color: status.color }}>
                    {pct}% · {status.label}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateProject(project.id, { locked: !project.locked })}
                    title={project.locked ? "Unlock project" : "Lock project"}
                    className={[
                      "w-8 h-8 rounded-md flex items-center justify-center border transition-colors",
                      project.locked
                        ? "text-warning bg-warning/8 border-warning/30 hover:bg-warning/14"
                        : "text-ink-muted bg-white border-garden-border hover:bg-surface-2 hover:text-ink",
                    ].join(" ")}
                  >
                    {project.locked ? (
                      <Lock className="w-3.5 h-3.5" />
                    ) : (
                      <Unlock className="w-3.5 h-3.5" />
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingProject(project)}
                    title="Edit project"
                    className="w-8 h-8 rounded-md flex items-center justify-center text-ink-muted bg-white border border-garden-border hover:bg-surface-2 hover:text-ink transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Delete "${project.title}"? This cannot be undone.`)) {
                        removeProject(project.id);
                      }
                    }}
                    title="Delete project"
                    className="w-8 h-8 rounded-md flex items-center justify-center text-error bg-white border border-garden-border hover:bg-error/8 hover:border-error/30 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <ProjectFormDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} onCreate={addProject} />
      <ProjectFormDialog
        open={editingProject !== null}
        onOpenChange={(open) => !open && setEditingProject(null)}
        project={editingProject}
        onSave={updateProject}
      />
    </div>
  );
}
