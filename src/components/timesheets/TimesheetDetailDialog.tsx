"use client";

import { CalendarClock, UserCheck } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { TimesheetRecord } from "@/components/providers/TimesheetProvider";
import { getComplianceColor } from "@/config/theme";

function formatHours(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function TimesheetDetailDialog({
  record,
  onOpenChange,
}: {
  record: TimesheetRecord | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Dialog open={record !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        {record && (
          <>
            <DialogHeader>
              <span className="text-[10px] font-semibold text-link uppercase tracking-wide">
                Archived Ledger Snapshot
              </span>
              <DialogTitle>{record.weekLabel}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1.5 text-ink-muted">
                  <UserCheck className="w-3.5 h-3.5 shrink-0" />
                  Signed by <span className="font-semibold text-ink">{record.submittedBy}</span>
                </div>
                <div className="flex items-center gap-1.5 text-ink-muted justify-end">
                  <CalendarClock className="w-3.5 h-3.5 shrink-0" />
                  {new Date(record.submittedAt).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>

              <div className="rounded-md bg-surface-2 border border-garden-border px-3.5 py-2.5 flex items-center justify-between">
                <span className="text-xs text-ink-muted">Total Certified</span>
                <span className="text-sm font-semibold text-ink">
                  {record.totalLoggedHours.toFixed(1)}h / {record.totalTargetHours}h
                </span>
              </div>

              <div className="space-y-2 max-h-64 overflow-y-auto">
                {record.projects.map((p) => {
                  const pct =
                    p.targetHours > 0
                      ? Math.round((p.loggedMinutes / 60 / p.targetHours) * 100)
                      : 0;
                  const color = getComplianceColor(pct);
                  return (
                    <div
                      key={p.id}
                      className="rounded-md border border-garden-border px-3 py-2 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-ink truncate">{p.title}</p>
                        <p className="text-[10px] text-ink-subtle truncate">{p.company}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-semibold text-ink">
                          {formatHours(p.loggedMinutes)}
                          <span className="text-ink-subtle font-normal"> / {p.targetHours}h</span>
                        </p>
                        <p className="text-[10px] font-semibold" style={{ color }}>
                          {pct}%
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
