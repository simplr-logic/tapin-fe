"use client";

import { useState } from "react";
import { History, CheckCircle2 } from "lucide-react";
import { useTimesheets, type TimesheetRecord } from "@/components/providers/TimesheetProvider";
import { TimesheetDetailDialog } from "@/components/timesheets/TimesheetDetailDialog";

export function TimesheetHistory() {
  const { records } = useTimesheets();
  const [viewingRecord, setViewingRecord] = useState<TimesheetRecord | null>(null);

  return (
    <div className="bg-white rounded-lg border border-garden-border shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-garden-border flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-ink-muted text-xs font-medium tracking-wide uppercase">
          <History className="w-3.5 h-3.5" />
          Submitted Timesheets
          <span className="text-[10px] font-semibold text-ink-muted bg-surface-2 px-2 py-0.5 rounded-full normal-case tracking-normal">
            {records.length}
          </span>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="px-5 py-10 text-center text-xs text-ink-subtle">
          No submitted timesheets yet. Certify the current week from the dashboard to archive it
          here.
        </div>
      ) : (
        <div className="divide-y divide-garden-border">
          {records.map((record) => {
            const pct =
              record.totalTargetHours > 0
                ? Math.round((record.totalLoggedHours / record.totalTargetHours) * 100)
                : 0;
            return (
              <button
                key={record.id}
                type="button"
                onClick={() => setViewingRecord(record)}
                className="w-full px-5 py-3.5 flex items-center gap-4 hover:bg-surface-2/60 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-md bg-success/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-4 h-4 text-success" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink truncate">{record.weekLabel}</p>
                  <p className="text-[11px] text-ink-muted truncate">
                    Signed by {record.submittedBy} ·{" "}
                    {new Date(record.submittedAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="hidden sm:flex flex-col items-end w-32 shrink-0">
                  <span className="text-xs font-semibold text-ink">
                    {record.totalLoggedHours.toFixed(1)}h / {record.totalTargetHours}h
                  </span>
                  <span className="text-[10px] font-semibold text-success">{pct}% Certified</span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      <TimesheetDetailDialog
        record={viewingRecord}
        onOpenChange={(open) => !open && setViewingRecord(null)}
      />
    </div>
  );
}
