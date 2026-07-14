"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import type { Comment, Project } from "@/components/providers/ProjectsProvider";

export function CommentsModal({
  project,
  comments,
  periodLabel,
  periodStart,
  periodEnd,
  onClose,
}: {
  project: Project;
  comments: Comment[];
  periodLabel?: string;
  periodStart?: string;
  periodEnd?: string;
  onClose: () => void;
}) {
  const filtered = comments.filter(
    (c) =>
      !c.date || ((!periodStart || c.date >= periodStart) && (!periodEnd || c.date <= periodEnd))
  );

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <span className="text-[10px] font-semibold text-link uppercase tracking-wide">
            Adjustment Notes
          </span>
          <DialogTitle className="truncate max-w-[240px]">{project.title}</DialogTitle>
          {periodLabel && <p className="text-[11px] text-ink-muted">{periodLabel}</p>}
        </DialogHeader>

        <div className="space-y-2 max-h-72 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="text-xs text-ink-subtle text-center py-6">No notes for this period.</p>
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
