"use client";

import { CalendarDays, Palmtree, Pencil, Trash2 } from "lucide-react";

import { SPECIAL_DAY_TYPES, type SpecialDay } from "@/components/dashboard/SpecialDayDialog";

import { formatSpecialRange } from "./utils";

interface SpecialDaySectionProps {
  specialDays: SpecialDay[];
  onAdd: () => void;
  onEdit: (id: number) => void;
  onRemove: (id: number) => void;
}

export function SpecialDaySection({
  specialDays,
  onAdd,
  onEdit,
  onRemove,
}: SpecialDaySectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-ink-subtle uppercase tracking-wide font-medium">
          <Palmtree className="w-3.5 h-3.5" />
          Special Day Blocks
          <span className="normal-case tracking-normal text-[10px] font-semibold bg-surface-2 border border-garden-border text-ink-muted px-1.5 py-0.5 rounded-full">
            {specialDays.length}
          </span>
        </div>
        <span className="text-[10px] text-ink-subtle">Non-worked roster hours</span>
      </div>

      {specialDays.length === 0 ? (
        <div className="rounded-lg border border-dashed border-garden-border bg-surface-2/50 px-5 py-6 text-center space-y-1.5">
          <Palmtree className="w-5 h-5 text-ink-subtle mx-auto" />
          <p className="text-xs text-ink-subtle">No holidays or leave logged this week.</p>
          <button
            type="button"
            onClick={onAdd}
            className="text-xs font-semibold text-link hover:text-link-hover hover:underline"
          >
            Log one now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {specialDays.map((day) => {
            const typeInfo = SPECIAL_DAY_TYPES.find((t) => t.value === day.type)!;
            const Icon = typeInfo.icon;
            const label = day.type === "leave" && day.leaveType ? day.leaveType : typeInfo.label;

            return (
              <div
                key={day.id}
                className={["relative rounded-lg border overflow-hidden", typeInfo.cardClass].join(
                  " "
                )}
              >
                {/* colour accent strip */}
                <div
                  className="absolute top-0 left-0 right-0 h-0.5"
                  style={{ backgroundColor: typeInfo.hex }}
                />

                <div className="px-3.5 pt-3.5 pb-3 space-y-2.5">
                  {/* top row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                        style={{ backgroundColor: `${typeInfo.hex}18` }}
                      >
                        <Icon className="w-4 h-4" style={{ color: typeInfo.hex }} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-ink leading-tight truncate">
                          {label}
                        </p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <CalendarDays
                            className="w-2.5 h-2.5 shrink-0"
                            style={{ color: typeInfo.hex }}
                          />
                          <p className="text-[10px] text-ink-subtle truncate">
                            {formatSpecialRange(day)}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-0.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => onEdit(day.id)}
                        title="Edit"
                        className="w-6 h-6 rounded-md flex items-center justify-center text-ink-subtle hover:text-ink hover:bg-white/70 transition-colors"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemove(day.id)}
                        title="Delete"
                        className="w-6 h-6 rounded-md flex items-center justify-center text-ink-subtle hover:text-error hover:bg-white/70 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>

                  {day.notes && (
                    <p className="text-[10px] text-ink-subtle italic truncate" title={day.notes}>
                      &ldquo;{day.notes}&rdquo;
                    </p>
                  )}

                  {/* footer */}
                  <div
                    className="flex items-center justify-between pt-2 border-t"
                    style={{ borderColor: `${typeInfo.hex}28` }}
                  >
                    <span className="text-[9px] text-ink-subtle uppercase tracking-wide font-medium">
                      Roster credit
                    </span>
                    <span
                      className="text-xs font-bold px-2 py-0.5 rounded-full"
                      style={{ color: typeInfo.hex, backgroundColor: `${typeInfo.hex}15` }}
                    >
                      {day.hours}h
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
