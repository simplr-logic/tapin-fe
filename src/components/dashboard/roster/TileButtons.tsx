"use client";

import { ClipboardList, Clock, Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { Project } from "@/components/providers/ProjectsProvider";

export interface TileActionsProps {
  project: Project;
  onOpenComments: (id: number) => void;
  onOpenAdjust: (id: number) => void;
  onOpenEdit: (id: number) => void;
}

export function WorklogButton({
  project,
  onOpenComments,
  className,
}: Omit<TileActionsProps, "onOpenAdjust" | "onOpenEdit"> & { className: string }) {
  return (
    <Button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onOpenComments(project.id);
      }}
      title="View worklog"
      className={["h-auto p-0 text-white shrink-0 bg-kale hover:bg-kale-hover", className].join(
        " "
      )}
    >
      <ClipboardList className="w-3 h-3" />
    </Button>
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
    <Button
      type="button"
      variant="outline"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onOpenAdjust(project.id);
      }}
      title={disabled ? "Not editable outside the current week" : "Log a custom hour / unlog hours"}
      className={[
        "h-auto p-0 text-ink-muted bg-card hover:bg-surface-2 hover:text-ink shrink-0",
        "disabled:opacity-40 disabled:hover:bg-card",
        className,
      ].join(" ")}
    >
      <Clock className="w-3 h-3" />
    </Button>
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
    <Button
      type="button"
      variant="outline"
      onClick={(e) => {
        e.stopPropagation();
        onOpenEdit(project.id);
      }}
      title="Edit project details"
      className={[
        "h-auto p-0 text-ink-muted bg-card hover:bg-surface-2 hover:text-ink shrink-0",
        className,
      ].join(" ")}
    >
      <Pencil className="w-3 h-3" />
    </Button>
  );
}
