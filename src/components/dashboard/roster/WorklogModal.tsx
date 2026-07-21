"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

import type { Comment, Project } from "@/components/providers/ProjectsProvider";

export function WorklogModal({
  project,
  comments,
  periodLabel,
  periodStart,
  periodEnd,
  onAddEntry,
  onClose,
}: {
  project: Project;
  comments: Comment[];
  periodLabel?: string;
  periodStart?: string;
  periodEnd?: string;
  onAddEntry: (text: string) => void;
  onClose: () => void;
}) {
  const [text, setText] = useState("");

  const filtered = comments.filter(
    (c) =>
      !c.date || ((!periodStart || c.date >= periodStart) && (!periodEnd || c.date <= periodEnd))
  );

  function submit() {
    const trimmed = text.trim();
    if (!trimmed) return;
    onAddEntry(trimmed);
    setText("");
  }

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <span className="text-[10px] font-semibold text-link uppercase tracking-wide">
            Worklog
          </span>
          <DialogTitle className="truncate max-w-[240px]">{project.title}</DialogTitle>
          {periodLabel && <p className="text-[11px] text-ink-muted">{periodLabel}</p>}
        </DialogHeader>

        <div className="flex gap-2">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="Add a worklog entry…"
            className="h-8 text-sm flex-1"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={submit}
            disabled={!text.trim()}
            className="h-8 px-3 text-xs shrink-0"
          >
            Add
          </Button>
        </div>

        <div className="space-y-2 max-h-60 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-xs text-ink-subtle text-center py-6">
              No worklog entries for this period.
            </p>
          ) : (
            filtered.map((c) => (
              <div
                key={c.id}
                className="rounded-md bg-surface-2 border border-garden-border px-3 py-2.5"
              >
                <p className="text-xs text-ink leading-relaxed">{c.text}</p>
                <p className="text-[10px] text-ink-subtle mt-1">{c.timestamp}</p>
              </div>
            ))
          )}
        </div>

        <Button variant="outline" className="w-full h-9 text-xs font-semibold" onClick={onClose}>
          Close
        </Button>
      </DialogContent>
    </Dialog>
  );
}
