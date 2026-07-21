"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { Project } from "@/components/providers/ProjectsProvider";

export function AdjustModal({
  project,
  sign,
  onSignChange,
  hours,
  onHoursChange,
  minutes,
  onMinutesChange,
  note,
  onNoteChange,
  onSave,
  onClose,
}: {
  project: Project;
  sign: "add" | "subtract";
  onSignChange: (s: "add" | "subtract") => void;
  hours: number;
  onHoursChange: (h: number) => void;
  minutes: number;
  onMinutesChange: (m: number) => void;
  note: string;
  onNoteChange: (v: string) => void;
  onSave: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <span className="text-[10px] font-semibold text-link uppercase tracking-wide">
            Adjust Hours
          </span>
          <DialogTitle className="truncate max-w-[240px]">{project.title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-2 bg-surface-2 p-1 rounded-md border border-garden-border">
          <button
            type="button"
            onClick={() => onSignChange("subtract")}
            className={[
              "py-1.5 text-xs font-semibold rounded-md transition-all",
              sign === "subtract"
                ? "bg-error/12 text-error border border-error/30"
                : "text-ink-subtle hover:text-ink-muted",
            ].join(" ")}
          >
            Unlog hours
          </button>
          <button
            type="button"
            onClick={() => onSignChange("add")}
            className={[
              "py-1.5 text-xs font-semibold rounded-md transition-all",
              sign === "add"
                ? "bg-success/12 text-success border border-success/30"
                : "text-ink-subtle hover:text-ink-muted",
            ].join(" ")}
          >
            Log custom hours
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide mb-1">
              Hours
            </Label>
            <Input
              type="number"
              min={0}
              step={1}
              value={hours}
              onChange={(e) => onHoursChange(Math.max(0, Math.floor(Number(e.target.value))))}
            />
          </div>
          <div>
            <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide mb-1">
              Minutes
            </Label>
            <Input
              type="number"
              min={0}
              max={59}
              step={5}
              value={minutes}
              onChange={(e) =>
                onMinutesChange(Math.min(59, Math.max(0, Math.floor(Number(e.target.value)))))
              }
            />
          </div>
        </div>

        <div>
          <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide mb-1">
            Note (optional)
          </Label>
          <Input
            type="text"
            value={note}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder="e.g. forgot to clock out, backfilled from calendar"
          />
        </div>

        <Button
          type="button"
          onClick={onSave}
          disabled={hours === 0 && minutes === 0}
          className={[
            "w-full text-xs font-semibold uppercase tracking-wide h-9",
            sign === "subtract" ? "bg-error hover:brightness-90 text-white" : "",
          ].join(" ")}
        >
          Confirm {sign === "subtract" ? "Deduction" : "Addition"}
        </Button>
      </DialogContent>
    </Dialog>
  );
}
