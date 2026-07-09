"use client";

import { Clock, MessageSquare, Pencil } from "lucide-react";

import type { Project } from "@/components/providers/ProjectsProvider";

export interface TileActionsProps {
  project: Project;
  onOpenComments: (id: number) => void;
  onOpenAdjust: (id: number) => void;
  onOpenEdit: (id: number) => void;
}

export function CommentButton({
  project,
  onOpenComments,
  className,
}: Omit<TileActionsProps, "onOpenAdjust" | "onOpenEdit"> & { className: string }) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpenComments(project.id);
      }}
      title="View adjustment notes"
      className={[
        "rounded-md flex items-center justify-center text-white shrink-0 bg-kale hover:bg-kale-hover transition-colors",
        className,
      ].join(" ")}
    >
      <MessageSquare className="w-3 h-3" />
    </button>
  );
}

export function AdjustHoursButton({
  project,
  onOpenAdjust,
  className,
  disabled = false,
}: Omit<TileActionsProps, "commentCount" | "onOpenComments" | "onOpenEdit"> & {
  className: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onOpenAdjust(project.id);
      }}
      title={disabled ? "Not editable outside the current week" : "Log a custom hour / unlog hours"}
      className={[
        "rounded-md flex items-center justify-center text-ink-muted bg-white border border-garden-border hover:bg-surface-2 hover:text-ink transition-colors shrink-0",
        "disabled:opacity-40 disabled:hover:bg-white disabled:cursor-not-allowed",
        className,
      ].join(" ")}
    >
      <Clock className="w-3 h-3" />
    </button>
  );
}

export function EditProjectButton({
  project,
  onOpenEdit,
  className,
}: Omit<TileActionsProps, "commentCount" | "onOpenComments" | "onOpenAdjust"> & {
  className: string;
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpenEdit(project.id);
      }}
      title="Edit project details"
      className={[
        "rounded-md flex items-center justify-center text-ink-muted bg-white border border-garden-border hover:bg-surface-2 hover:text-ink transition-colors shrink-0",
        className,
      ].join(" ")}
    >
      <Pencil className="w-3 h-3" />
    </button>
  );
}
