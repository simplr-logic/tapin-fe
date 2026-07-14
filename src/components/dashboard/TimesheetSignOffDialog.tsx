"use client";

import { ScrollText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { gardenColors } from "@/config/theme";

export interface PreviewProject {
  id: number;
  title: string;
  company: string;
  loggedMinutes: number;
  targetHours: number;
}

function ProjectPreviewRow({ p }: { p: PreviewProject }) {
  const pct = p.targetHours > 0 ? Math.round((p.loggedMinutes / 60 / p.targetHours) * 100) : 0;
  const color =
    pct >= 115 ? gardenColors.error : pct >= 100 ? gardenColors.success : gardenColors.yellow;
  const h = Math.floor(p.loggedMinutes / 60);
  const m = p.loggedMinutes % 60;

  return (
    <div className="flex items-center gap-3 px-3 py-2.5">
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold text-ink truncate">{p.title}</p>
        <p className="text-[10px] text-ink-subtle truncate">{p.company}</p>
        <div className="h-1 rounded-full bg-surface-3 mt-1.5 overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }}
          />
        </div>
      </div>
      <div className="text-right shrink-0">
        <p className="text-xs font-semibold text-ink tabular-nums">
          {m > 0 ? `${h}h ${m}m` : `${h}h`}
        </p>
        <p className="text-[10px] font-bold tabular-nums" style={{ color }}>
          {pct}%
        </p>
      </div>
    </div>
  );
}

function SignOffForm({
  totalHours,
  totalTarget,
  monthLabel,
  projects,
  onOpenChange,
  onSubmit,
}: {
  totalHours: number;
  totalTarget: number;
  monthLabel?: string;
  projects: PreviewProject[];
  onOpenChange: (open: boolean) => void;
  onSubmit: () => void;
}) {
  const pct = totalTarget > 0 ? Math.round((totalHours / totalTarget) * 100) : 0;
  const pctColor =
    pct >= 115 ? gardenColors.error : pct >= 100 ? gardenColors.success : gardenColors.yellow;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onSubmit();
    onOpenChange(false);
  }

  return (
    <>
      <DialogHeader>
        <span className="text-[10px] font-semibold text-link uppercase tracking-wide">
          Timesheet Submission
        </span>
        <DialogTitle>{monthLabel ?? "This Month"}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Summary card */}
        <div className="rounded-md bg-surface-2 border border-garden-border p-3.5 space-y-2.5">
          <div className="flex items-end justify-between gap-2">
            <span className="text-2xl font-semibold text-ink tracking-tight tabular-nums">
              {totalHours.toFixed(1)}h
            </span>
            <span className="text-xs text-ink-subtle mb-0.5">
              of {Math.round(totalTarget)}h target
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, pct)}%`, backgroundColor: pctColor }}
            />
          </div>
          <p className="text-[11px] font-semibold tabular-nums" style={{ color: pctColor }}>
            {pct}%
          </p>
        </div>

        {/* Per-project breakdown */}
        {projects.length > 0 && (
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] text-ink-subtle uppercase tracking-wide font-medium px-0.5">
              <ScrollText className="w-3 h-3" />
              Projects · {projects.length}
            </div>
            <div className="rounded-md border border-garden-border divide-y divide-garden-border max-h-[200px] overflow-y-auto">
              {projects.map((p) => (
                <ProjectPreviewRow key={p.id} p={p} />
              ))}
            </div>
          </div>
        )}

        <p className="text-[11px] text-ink-muted leading-relaxed">
          By submitting, you confirm that the hours registered
          {monthLabel ? ` in ${monthLabel}` : " this month"} accurately represent your attendance
          and project work allocations.
        </p>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="flex-1 h-9 text-xs font-semibold"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1 h-9 text-xs font-semibold">
            Confirm &amp; Submit
          </Button>
        </div>
      </form>
    </>
  );
}

export function TimesheetSignOffDialog({
  open,
  onOpenChange,
  totalHours,
  totalTarget,
  monthLabel,
  projects,
  onVerify,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  totalHours: number;
  totalTarget: number;
  monthLabel?: string;
  projects: PreviewProject[];
  onVerify: (signature: string) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        {open && (
          <SignOffForm
            totalHours={totalHours}
            totalTarget={totalTarget}
            monthLabel={monthLabel}
            projects={projects}
            onOpenChange={onOpenChange}
            onSubmit={() => onVerify("")}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
