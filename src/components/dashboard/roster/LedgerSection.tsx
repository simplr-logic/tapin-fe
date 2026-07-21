"use client";

import { ChevronDown, ClipboardList } from "lucide-react";
import { useState, useSyncExternalStore } from "react";

import { gardenColors } from "@/config/theme";

import { PROJECT_ICONS } from "./constants";

import type { LedgerEntry } from "@/components/providers/ProjectsProvider";

interface LedgerSectionProps {
  ledger: LedgerEntry[];
}

function subscribeToDesktop(onChange: () => void) {
  const mq = window.matchMedia("(min-width: 1024px)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

export function LedgerSection({ ledger }: LedgerSectionProps) {
  const isDesktop = useSyncExternalStore(
    subscribeToDesktop,
    () => window.matchMedia("(min-width: 1024px)").matches,
    () => false
  );
  const [manualOpen, setManualOpen] = useState<boolean | null>(null);
  const open = manualOpen ?? isDesktop;
  const entries = ledger.slice(0, 10);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setManualOpen(!open)}
        className="flex items-center justify-between w-full"
      >
        <div className="flex items-center gap-2 text-[10px] text-ink-subtle uppercase tracking-wide font-medium">
          <ClipboardList className="w-3.5 h-3.5" />
          Recent Adjustments
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold text-ink-muted bg-surface-2 px-2 py-0.5 rounded-full">
            {entries.length} of {ledger.length}
          </span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-ink-subtle transition-transform duration-150 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {open && (
        <>
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
                  <div key={entry.id}>
                    <div className="flex items-center gap-3 px-4 py-2.5">
                      <div
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <Icon className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
                      <span className="text-xs font-semibold text-ink truncate flex-1">
                        {entry.projectTitle}
                      </span>
                      <span className="text-[11px] text-ink-subtle shrink-0 whitespace-nowrap">
                        {entry.timestamp}
                      </span>
                    </div>
                    <div className="px-4 pb-2.5 pl-13">
                      <span className="text-xs text-ink-subtle">{entry.note}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
