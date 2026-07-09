"use client";

import { Building2, Cloud, LayoutGrid, Truck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { DatePickerInput } from "./DatePickerInput";
import { MonthlyTargetsEditor } from "./MonthlyTargetsEditor";

import type {
  NewProjectInput,
  Project,
  ProjectIcon,
} from "@/components/providers/ProjectsProvider";

const ICON_OPTIONS: { value: ProjectIcon; icon: typeof Truck; label: string }[] = [
  { value: "building", icon: Building2, label: "Building" },
  { value: "truck", icon: Truck, label: "Truck" },
  { value: "cloud", icon: Cloud, label: "Cloud" },
  { value: "grid", icon: LayoutGrid, label: "Grid" },
];

function formFromProject(project?: Project | null) {
  if (!project) {
    return {
      title: "",
      company: "",
      assignee: "",
      icon: "grid" as ProjectIcon,
      startDate: "",
      endDate: "",
      monthlyTargets: [] as { month: string; hours: number }[],
    };
  }
  const monthlyTargets = project.monthlyTargets?.length
    ? project.monthlyTargets
    : project.startDate
      ? [{ month: project.startDate.slice(0, 7), hours: 0 }]
      : [];
  return {
    title: project.title,
    company: project.company,
    assignee: project.assignee,
    icon: project.icon,
    startDate: project.startDate ?? "",
    endDate: project.endDate ?? "",
    monthlyTargets,
  };
}

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

    const totalHours = form.monthlyTargets.reduce((s, t) => s + t.hours, 0);
    const avgMonthly =
      form.monthlyTargets.length > 0 ? totalHours / form.monthlyTargets.length : 40;
    const weeklyTarget = Math.max(1, Math.round(avgMonthly / 4.33));

    const base = {
      title: form.title.trim(),
      company: form.company.trim(),
      assignee: form.assignee.trim().slice(0, 3).toUpperCase() || "—",
      targetHours: weeklyTarget,
      icon: form.icon,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      monthlyTargets: form.monthlyTargets.length > 0 ? form.monthlyTargets : undefined,
    };

    if (isEdit && project) {
      onSave?.(project.id, base);
    } else {
      onCreate?.({ ...base, locked: false });
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

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide mb-1">
              Start date
            </Label>
            <DatePickerInput
              value={form.startDate}
              max={form.endDate || undefined}
              placeholder="Start date"
              onChange={(newStart) =>
                setForm((f) => {
                  const next = { ...f, startDate: newStart };
                  if (newStart && f.endDate && f.monthlyTargets.length === 0) {
                    next.monthlyTargets = [{ month: newStart.slice(0, 7), hours: 0 }];
                  }
                  return next;
                })
              }
            />
          </div>
          <div>
            <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide mb-1">
              End date
            </Label>
            <DatePickerInput
              value={form.endDate}
              min={form.startDate || undefined}
              placeholder="End date"
              onChange={(newEnd) =>
                setForm((f) => {
                  const next = { ...f, endDate: newEnd };
                  if (f.startDate && newEnd && f.monthlyTargets.length === 0) {
                    next.monthlyTargets = [{ month: f.startDate.slice(0, 7), hours: 0 }];
                  }
                  return next;
                })
              }
            />
          </div>
        </div>

        {form.startDate && form.endDate && (
          <MonthlyTargetsEditor
            targets={form.monthlyTargets}
            startDate={form.startDate}
            onChange={(monthlyTargets) => setForm((f) => ({ ...f, monthlyTargets }))}
          />
        )}

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
