"use client";

import { Building2, Cloud, LayoutGrid, Truck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { DatePickerInput } from "./DatePickerInput";
import { MonthlyTargetsEditor } from "./MonthlyTargetsEditor";

import type { MonthlyTarget, Project, ProjectIcon } from "@/components/providers/ProjectsProvider";

export interface ProjectFormPayload {
  title: string;
  company: string;
  assignee: string;
  targetHours: number;
  icon: ProjectIcon;
  startDate?: string;
  endDate?: string;
  monthlyTargets?: MonthlyTarget[];
}

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
      monthlyTargets: [] as MonthlyTarget[],
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

export function ProjectFormFields({
  project,
  submitLabel,
  onSubmit,
}: {
  project?: Project | null;
  submitLabel: string;
  onSubmit: (payload: ProjectFormPayload) => void;
}) {
  const [form, setForm] = useState(() => formFromProject(project));

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim() || !form.company.trim()) return;

    const totalHours = form.monthlyTargets.reduce((s, t) => s + t.hours, 0);
    const avgMonthly =
      form.monthlyTargets.length > 0 ? totalHours / form.monthlyTargets.length : 40;
    const weeklyTarget = Math.max(1, Math.round(avgMonthly / 4.33));

    onSubmit({
      title: form.title.trim(),
      company: form.company.trim(),
      assignee: form.assignee.trim().slice(0, 3).toUpperCase() || "—",
      targetHours: weeklyTarget,
      icon: form.icon,
      startDate: form.startDate || undefined,
      endDate: form.endDate || undefined,
      monthlyTargets: form.monthlyTargets.length > 0 ? form.monthlyTargets : undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label className="text-[10px] font-semibold text-ink-subtle tracking-wide mb-1">
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
        <Label className="text-[10px] font-semibold text-ink-subtle tracking-wide mb-1">
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
          <Label className="text-[10px] font-semibold text-ink-subtle tracking-wide mb-1">
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
          <Label className="text-[10px] font-semibold text-ink-subtle tracking-wide mb-1">
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
        <Label className="text-[10px] font-semibold text-ink-subtle tracking-wide mb-1">Icon</Label>
        <div className="flex items-center gap-2">
          {ICON_OPTIONS.map(({ value, icon: Icon, label }) => (
            <Button
              key={value}
              type="button"
              variant="outline"
              size="icon"
              title={label}
              onClick={() => setForm((f) => ({ ...f, icon: value }))}
              className={[
                "w-9 h-9",
                form.icon === value
                  ? "bg-kale text-white border-kale hover:bg-kale hover:text-white"
                  : "bg-surface-2 text-ink-muted hover:text-ink",
              ].join(" ")}
            >
              <Icon className="w-4 h-4" />
            </Button>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full h-9 text-xs font-semibold tracking-wide">
        {submitLabel}
      </Button>
    </form>
  );
}
