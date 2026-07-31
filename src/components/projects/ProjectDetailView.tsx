"use client";

import { ArrowLeft, Lock, Trash2, Unlock } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { PROJECT_ICONS } from "@/components/dashboard/roster/constants";
import { formatHours } from "@/components/dashboard/roster/utils";
import { ProjectFormFields } from "@/components/projects/ProjectFormFields";
import { sumLogs, useProjects } from "@/components/providers/ProjectsProvider";
import { Button } from "@/components/ui/button";
import { getComplianceColorClass } from "@/config/theme";
import { cn } from "@/lib/utils";

function BackLink() {
  return (
    <Link
      href="/projects/list"
      className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-muted hover:text-ink transition-colors"
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      All Projects
    </Link>
  );
}

export function ProjectDetailView({ projectId }: { projectId: number }) {
  const router = useRouter();
  const { projects, updateProject, removeProject } = useProjects();
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <BackLink />
        <div className="bg-card rounded-lg border border-garden-border shadow-card p-8 text-center text-xs text-ink-subtle">
          Project not found.
        </div>
      </div>
    );
  }

  const Icon = PROJECT_ICONS[project.icon];
  const monthLogged = sumLogs(project.logs);
  const totalTarget = project.monthlyTargets?.length
    ? project.monthlyTargets.reduce((s, t) => s + t.hours, 0)
    : project.targetHours;
  const pct = Math.round((monthLogged / 60 / totalTarget) * 100);

  function handleDelete() {
    if (!project || !window.confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    removeProject(project.id);
    router.push("/projects/list");
  }

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <BackLink />

      <div className="bg-card rounded-lg border border-garden-border shadow-elevated overflow-hidden">
        <div className="px-5 py-4 flex items-center gap-4">
          <div className="w-12 h-12 rounded-md flex items-center justify-center shrink-0 bg-surface-2 border border-garden-border">
            <Icon className="w-5 h-5 text-ink-muted" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <p className="text-base font-semibold text-ink truncate">{project.title}</p>
              {project.locked && (
                <span className="flex items-center gap-1 text-[9px] font-semibold tracking-wide text-ink-subtle bg-surface-2 border border-garden-border-strong rounded-full px-1.5 py-0.5 shrink-0">
                  <Lock className="w-2.5 h-2.5" />
                  Locked
                </span>
              )}
            </div>
            <p className="text-xs text-ink-muted truncate">
              {project.company} · Assignee {project.assignee}
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => updateProject(project.id, { locked: !project.locked })}
            title={project.locked ? "Unlock project" : "Lock project"}
            className={cn(
              project.locked
                ? "text-warning bg-warning/8 border-warning/30 hover:bg-warning/14"
                : "text-ink-muted bg-card hover:bg-surface-2 hover:text-ink"
            )}
          >
            {project.locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleDelete}
            title="Delete project"
            className="text-error bg-card hover:bg-error/8 hover:border-error/30"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        <div className="border-t border-garden-border px-5 py-3.5 flex items-center justify-between">
          <span className="text-xs font-semibold text-ink">
            {formatHours(monthLogged)} / {totalTarget}h this month
          </span>
          <span className={cn("text-[10px] font-semibold", getComplianceColorClass(pct))}>
            {pct}%
          </span>
        </div>
      </div>

      <div className="bg-card rounded-lg border border-garden-border shadow-card p-5">
        <p className="text-[10px] font-semibold text-ink-subtle tracking-wide mb-3">
          Project details
        </p>
        <ProjectFormFields
          project={project}
          submitLabel="Save Changes"
          onSubmit={(payload) => updateProject(project.id, payload)}
        />
      </div>
    </div>
  );
}
