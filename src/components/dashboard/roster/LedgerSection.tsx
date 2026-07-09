"use client";

import { ClipboardList } from "lucide-react";

import { gardenColors } from "@/config/theme";

import { PROJECT_ICONS } from "./constants";

import type { LedgerEntry } from "@/components/providers/ProjectsProvider";

interface LedgerSectionProps {
  ledger: LedgerEntry[];
}

export function LedgerSection({ ledger }: LedgerSectionProps) {
  const entries = ledger.slice(0, 10);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[10px] text-ink-subtle uppercase tracking-wide font-medium">
          <ClipboardList className="w-3.5 h-3.5" />
          Recent Adjustments
        </div>
        <span className="text-[10px] font-semibold text-ink-muted bg-surface-2 px-2 py-0.5 rounded-full">
          {entries.length} of {ledger.length}
        </span>
      </div>

      {entries.length === 0 ? (
        <div className="rounded-lg border border-dashed border-garden-border bg-surface-2/50 px-4 py-3 text-center text-xs text-ink-subtle">
          No adjustments yet. Use the adjust panel on any project to log changes here.
        </div>
      ) : (
        <div className="rounded-lg border border-garden-border bg-white divide-y divide-garden-border overflow-hidden">
          {entries.map((entry) => {
            const Icon = PROJECT_ICONS[entry.icon];
            const isDeduction = entry.note.startsWith("−");
            const color = isDeduction ? gardenColors.error : gardenColors.success;
            return (
              <div key={entry.id} className="flex items-center gap-3 px-4 py-3">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                <Icon className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
                <div className="min-w-0 flex-1">
                  <span className="text-xs font-semibold text-ink">{entry.projectTitle}</span>
                  <span className="text-xs text-ink-subtle ml-2">{entry.note}</span>
                </div>
                <span className="text-[11px] text-ink-subtle shrink-0 whitespace-nowrap">
                  {entry.timestamp}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
