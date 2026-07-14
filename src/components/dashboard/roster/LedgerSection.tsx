"use client";

import { ChevronDown, ClipboardList } from "lucide-react";
import { useState } from "react";

import { gardenColors } from "@/config/theme";

import { PROJECT_ICONS } from "./constants";

import type { LedgerEntry } from "@/components/providers/ProjectsProvider";

interface LedgerSectionProps {
  ledger: LedgerEntry[];
}

export function LedgerSection({ ledger }: LedgerSectionProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const entries = ledger.slice(0, 10);

  function toggle(id: string) {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

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
            const isExpanded = expandedIds.has(entry.id);

            return (
              <div key={entry.id}>
                {/* Header row — always visible, clickable on mobile/tablet */}
                <button
                  type="button"
                  onClick={() => toggle(entry.id)}
                  className="flex items-center gap-3 px-4 py-2.5 w-full text-left lg:cursor-default"
                >
                  <div
                    className="w-2 h-2 rounded-full shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <Icon className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
                  <span className="text-xs font-semibold text-ink truncate flex-1">
                    {entry.projectTitle}
                  </span>
                  {/* Timestamp visible on desktop inline, hidden on mobile (shown in expanded) */}
                  <span className="hidden lg:block text-[11px] text-ink-subtle shrink-0 whitespace-nowrap">
                    {entry.timestamp}
                  </span>
                  <ChevronDown
                    className={[
                      "lg:hidden w-3.5 h-3.5 text-ink-subtle shrink-0 transition-transform duration-150",
                      isExpanded ? "rotate-180" : "",
                    ].join(" ")}
                  />
                </button>

                {/* Expanded detail — hidden on mobile until tapped, always shown on desktop */}
                <div className={isExpanded ? "block" : "hidden lg:block"}>
                  <div className="px-4 pb-2.5 pl-[52px] flex items-center justify-between gap-2">
                    <span className="text-xs text-ink-subtle">{entry.note}</span>
                    <span className="lg:hidden text-[11px] text-ink-subtle shrink-0 whitespace-nowrap">
                      {entry.timestamp}
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
