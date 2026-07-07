"use client";

import { Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

import type { Project, Comment } from "@/components/providers/ProjectsProvider";

export function CommentsModal({
  project,
  comments,
  draft,
  onDraftChange,
  onAdd,
  onClose,
}: {
  project: Project;
  comments: Comment[];
  draft: string;
  onDraftChange: (v: string) => void;
  onAdd: () => void;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <span className="text-[10px] font-semibold text-link uppercase tracking-wide">
            Comments
          </span>
          <DialogTitle className="truncate max-w-[240px]">{project.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-2 max-h-52 overflow-y-auto">
          {comments.length === 0 ? (
            <p className="text-xs text-ink-subtle text-center py-4">No comments yet.</p>
          ) : (
            comments.map((c) => (
              <div
                key={c.id}
                className="rounded-md bg-surface-2 border border-garden-border px-3 py-2"
              >
                <p className="text-xs text-ink leading-relaxed">{c.text}</p>
                <p className="text-[10px] text-ink-subtle mt-1">{c.timestamp}</p>
              </div>
            ))
          )}
        </div>

        <div className="flex items-end gap-2">
          <Textarea
            value={draft}
            onChange={(e) => onDraftChange(e.target.value)}
            placeholder="Add a comment…"
            rows={2}
            className="flex-1 text-xs min-h-16 resize-none"
          />
          <Button
            type="button"
            onClick={onAdd}
            disabled={!draft.trim()}
            size="icon"
            className="shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
