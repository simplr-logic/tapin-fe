"use client";

import { Palmtree, Trees, Lightbulb, Pencil, Trash2 } from "lucide-react";

import { SPECIAL_DAY_TYPES, type SpecialDay } from "@/components/dashboard/SpecialDayDialog";

import { formatSpecialRange } from "./utils";

interface SpecialDaySectionProps {
  specialDays: SpecialDay[];
  periodLocked: boolean;
  onAdd: () => void;
  onEdit: (id: number) => void;
  onRemove: (id: number) => void;
}

export function SpecialDaySection({
  specialDays,
  periodLocked,
  onAdd,
  onEdit,
  onRemove,
}: SpecialDaySectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[10px] text-ink-subtle uppercase tracking-wide font-medium">
          <Trees className="w-3.5 h-3.5" />
          <Palmtree className="w-3.5 h-3.5" />
          Registered Special Day Blocks ({specialDays.length})
        </div>
        <span className="text-[10px] text-ink-subtle">Counts as non-worked roster hours</span>
      </div>

      {specialDays.length === 0 ? (
        <div className="rounded-lg border border-dashed border-garden-border bg-surface-2/50 px-5 py-4 text-center text-xs text-ink-subtle leading-relaxed">
          No public holidays or annual leaves logged for this week.{" "}
          <span
            onClick={onAdd}
            className="font-semibold text-link cursor-pointer hover:text-link-hover hover:underline"
          >
            Click &quot;Log Holiday/Leave&quot;
          </span>{" "}
          above to register one!
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {specialDays.map((day) => {
            const typeInfo = SPECIAL_DAY_TYPES.find((t) => t.value === day.type)!;
            const Icon = typeInfo.icon;
            return (
              <div
                key={day.id}
                className={["rounded-lg border px-4 py-3 space-y-2", typeInfo.cardClass].join(" ")}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-md bg-white/70 flex items-center justify-center shrink-0">
                      <Icon className="w-3.5 h-3.5" style={{ color: typeInfo.hex }} />
                    </div>
                    <div className="min-w-0">
                      <p
                        className="text-[10px] font-semibold uppercase tracking-wide"
                        style={{ color: typeInfo.hex }}
                      >
                        {typeInfo.label}
                      </p>
                      <p className="text-[10px] text-ink-subtle">{formatSpecialRange(day)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onEdit(day.id)}
                      title="Edit hours / dates"
                      className="w-6 h-6 rounded-md flex items-center justify-center text-ink-subtle hover:text-ink hover:bg-white/70 transition-colors"
                    >
                      <Pencil className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemove(day.id)}
                      title="Delete off-day block"
                      className="w-6 h-6 rounded-md flex items-center justify-center text-ink-subtle hover:text-error hover:bg-white/70 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {day.notes && (
                  <p className="text-xs text-ink truncate" title={day.notes}>
                    {day.notes}
                  </p>
                )}

                <div
                  className="flex items-center justify-between pt-2 border-t"
                  style={{ borderColor: `${typeInfo.hex}33` }}
                >
                  <span className="text-[9px] text-ink-subtle uppercase tracking-wide font-medium">
                    Roster Credit
                  </span>
                  <span className="text-xs font-bold" style={{ color: typeInfo.hex }}>
                    {day.hours}h
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-start gap-2.5 rounded-lg bg-warning/8 border border-warning/20 px-4 py-3">
        <Lightbulb className="w-3.5 h-3.5 mt-0.5 shrink-0 text-warning" />
        <p className="text-[11px] text-warning leading-relaxed">
          <span className="font-semibold">How to log:</span> Click anywhere inside a project tile to
          log time using the selected TAP unit, or drag a tile onto another to swap their position.
          Special day blocks (dashed border) are locked — drag to reposition them, but edit or
          delete them below. Use the pencil to edit project details, the clock to log a custom
          hour/minute amount or unlog hours, and the message icon to view or add comments.
        </p>
      </div>
    </div>
  );
}
