"use client";

import { LayoutGrid, ChevronRight, MapPin } from "lucide-react";

import { gardenColors } from "@/config/theme";

import { PROJECT_ICONS } from "./constants";

import type { LedgerEntry } from "@/components/providers/ProjectsProvider";

interface LedgerSectionProps {
  ledger: LedgerEntry[];
}

export function LedgerSection({ ledger }: LedgerSectionProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-ink-subtle uppercase tracking-wide font-medium">
          <LayoutGrid className="w-3.5 h-3.5" />
          Roster Ledger Activity
        </div>
        <span className="text-[10px] font-semibold text-ink-muted bg-surface-2 px-2 py-0.5 rounded-full">
          {ledger.length} Records
        </span>
      </div>

      {ledger.length === 0 ? (
        <div className="rounded-lg border border-dashed border-garden-border bg-surface-2/50 px-5 py-4 text-center text-xs text-ink-subtle leading-relaxed">
          No activity yet. Tap a project block or log an adjustment to start the ledger.
        </div>
      ) : (
        <div className="relative space-y-3">
          <div className="absolute left-[9px] top-3 bottom-3 w-px bg-garden-border" />

          {ledger.map((entry) => {
            const Icon = PROJECT_ICONS[entry.icon];
            const isDeduction = entry.note.startsWith("−");
            const color = isDeduction ? gardenColors.error : gardenColors.success;
            return (
              <div key={entry.id} className="relative pl-7">
                <div
                  className="absolute left-0 top-3 w-[18px] h-[18px] rounded-full flex items-center justify-center"
                  style={{ backgroundColor: color }}
                >
                  <ChevronRight className="w-2.5 h-2.5 text-white" />
                </div>

                <div className="rounded-lg border border-garden-border bg-white p-4 space-y-3 hover:border-garden-border-strong transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-ink-muted uppercase tracking-wide border border-garden-border rounded-md px-2 py-0.5 bg-surface-2">
                      {isDeduction ? "Roster Hour Deducted" : "Roster Hour Credited"}
                    </span>
                    <span className="text-[10px] text-ink-subtle">{entry.timestamp}</span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Icon className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
                      <span className="text-sm font-semibold text-ink">{entry.projectTitle}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-ink-subtle pl-5">
                      <MapPin className="w-3 h-3" />
                      {entry.company}
                    </div>
                  </div>

                  <div
                    className="flex items-center gap-2.5 rounded-md px-3 py-2"
                    style={{ backgroundColor: `${color}14`, border: `1px solid ${color}33` }}
                  >
                    <div
                      className="w-4 h-4 rounded-md flex items-center justify-center shrink-0"
                      style={{ backgroundColor: color }}
                    >
                      <span className="text-[8px] text-white font-bold">
                        {isDeduction ? "−" : "✓"}
                      </span>
                    </div>
                    <span className="text-xs italic" style={{ color }}>
                      &quot;{entry.note}&quot;
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
