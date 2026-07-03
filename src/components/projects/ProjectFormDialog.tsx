"use client";

import { useState } from "react";
import { Truck, Building2, Cloud, LayoutGrid } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type {
  Project,
  ProjectIcon,
  NewProjectInput,
} from "@/components/providers/ProjectsProvider";

const ICON_OPTIONS: { value: ProjectIcon; icon: typeof Truck; label: string }[] = [
  { value: "building", icon: Building2, label: "Building" },
  { value: "truck", icon: Truck, label: "Truck" },
  { value: "cloud", icon: Cloud, label: "Cloud" },
  { value: "grid", icon: LayoutGrid, label: "Grid" },
];

const EMPTY_FORM = {
  title: "",
  company: "",
  assignee: "",
  targetHours: 8,
  icon: "grid" as ProjectIcon,
};

function formFromProject(project?: Project | null) {
  if (!project) return EMPTY_FORM;
  return {
    title: project.title,
    company: project.company,
    assignee: project.assignee,
    targetHours: project.targetHours,
    icon: project.icon,
  };
}

// Keyed by dialog open-state + target project (see the export below) so this
// remounts fresh every time it opens — the form's initial value is derived once
// at construction via useState's lazy initializer, no effect-based sync needed.
function ProjectForm({
  project,
  onOpenChange,
  onCreate,
  onSave,
}: {
  project?: Project | null;
  onOpenChange: (open: boolean) => void;
  onCreate?: (input: NewProjectInput) => void;
  onSave?: (id: number, patch: Partial<Omit<Project, "id">>) => void;
}) {
  const isEdit = !!project;
  const [form, setForm] = useState(() => formFromProject(project));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.company.trim()) return;

    const payload = {
      title: form.title.trim(),
      company: form.company.trim(),
      assignee: form.assignee.trim().slice(0, 3).toUpperCase() || "—",
      targetHours: Math.max(1, form.targetHours),
      icon: form.icon,
    };

    if (isEdit && project) {
      onSave?.(project.id, payload);
    } else {
      onCreate?.(payload);
    }
    onOpenChange(false);
  }

  return (
    <>
      <DialogHeader>
        <span className="text-[10px] font-semibold text-link uppercase tracking-wide">
          {isEdit ? "Edit Project" : "New Project"}
        </span>
        <DialogTitle>{isEdit ? project?.title : "Create allocation project"}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide mb-1">
            Project title
          </Label>
          <Input
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. Store Front Upgrade"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide mb-1">
              Company
            </Label>
            <Input
              required
              value={form.company}
              onChange={(e) => setForm((f) => ({ ...f, company: e.target.value }))}
              placeholder="e.g. Vanguard Retail"
            />
          </div>
          <div>
            <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide mb-1">
              Assignee
            </Label>
            <Input
              value={form.assignee}
              onChange={(e) => setForm((f) => ({ ...f, assignee: e.target.value }))}
              placeholder="e.g. VR"
              maxLength={3}
            />
          </div>
        </div>

        <div>
          <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide mb-1">
            Target hours (this week)
          </Label>
          <Input
            type="number"
            min={1}
            step={1}
            value={form.targetHours}
            onChange={(e) =>
              setForm((f) => ({
                ...f,
                targetHours: Math.max(1, Math.floor(Number(e.target.value))),
              }))
            }
          />
        </div>

        <div>
          <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide mb-1">
            Icon
          </Label>
          <div className="flex items-center gap-2">
            {ICON_OPTIONS.map(({ value, icon: Icon, label }) => (
              <button
                key={value}
                type="button"
                title={label}
                onClick={() => setForm((f) => ({ ...f, icon: value }))}
                className={[
                  "w-9 h-9 rounded-md border flex items-center justify-center transition-colors",
                  form.icon === value
                    ? "bg-kale text-white border-kale"
                    : "bg-surface-2 text-ink-muted border-garden-border hover:text-ink",
                ].join(" ")}
              >
                <Icon className="w-4 h-4" />
              </button>
            ))}
          </div>
        </div>

        <Button type="submit" className="w-full h-9 text-xs font-semibold uppercase tracking-wide">
          {isEdit ? "Save Changes" : "Create Project"}
        </Button>
      </form>
    </>
  );
}

export function ProjectFormDialog({
  open,
  onOpenChange,
  project,
  onCreate,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** When set, the dialog edits this project instead of creating a new one. */
  project?: Project | null;
  onCreate?: (input: NewProjectInput) => void;
  onSave?: (id: number, patch: Partial<Omit<Project, "id">>) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        {open && (
          <ProjectForm
            key={project?.id ?? "new"}
            project={project}
            onOpenChange={onOpenChange}
            onCreate={onCreate}
            onSave={onSave}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
