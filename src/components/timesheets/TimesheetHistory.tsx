"use client";

import { CheckCircle2, History } from "lucide-react";
import { useState } from "react";

import { type TimesheetRecord, useTimesheets } from "@/components/providers/TimesheetProvider";
import { TimesheetDetailPanel } from "@/components/timesheets/TimesheetDetailPanel";
import { getComplianceColor } from "@/config/theme";

function RecordListItem({ record, onSelect }: { record: TimesheetRecord; onSelect: () => void }) {
  const pct =
    record.totalTargetHours > 0
      ? Math.round((record.totalLoggedHours / record.totalTargetHours) * 100)
      : 0;
  const color = getComplianceColor(pct);

  return (
    <button
      type="button"
      onClick={onSelect}
      className="w-full px-5 py-4 flex items-center gap-4 hover:bg-surface-2/60 transition-colors text-left"
    >
      <div className="w-9 h-9 rounded-md bg-success/10 flex items-center justify-center shrink-0">
        <CheckCircle2 className="w-4 h-4 text-success" />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{record.monthLabel}</p>
        <p className="text-[11px] text-ink-muted">
          Signed by {record.submittedBy} ·{" "}
          {new Date(record.submittedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </div>

      <div className="text-right shrink-0">
        <p className="text-xs font-semibold text-ink tabular-nums">
          {record.totalLoggedHours.toFixed(1)}h
          <span className="text-ink-subtle font-normal"> / {record.totalTargetHours}h</span>
        </p>
        <p className="text-[10px] font-bold tabular-nums" style={{ color }}>
          {pct}%
        </p>
      </div>
    </button>
  );
}

export function TimesheetHistory() {
  const { records } = useTimesheets();
  const [selected, setSelected] = useState<TimesheetRecord | null>(null);

  if (selected) {
    return <TimesheetDetailPanel record={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="bg-white rounded-lg border border-garden-border shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-garden-border flex items-center gap-3">
        <div className="flex items-center gap-2 text-ink-muted text-xs font-medium tracking-wide uppercase">
          <History className="w-3.5 h-3.5" />
          Submitted Timesheets
        </div>
        <span className="text-[10px] font-semibold text-ink-muted bg-surface-2 px-2 py-0.5 rounded-full normal-case tracking-normal">
          {records.length}
        </span>
      </div>

      {records.length === 0 ? (
        <div className="px-5 py-10 text-center text-xs text-ink-subtle">
          No submitted timesheets yet. Submit the current month from the dashboard to archive it
          here.
        </div>
      ) : (
        <div className="divide-y divide-garden-border">
          {records.map((record) => (
            <RecordListItem key={record.id} record={record} onSelect={() => setSelected(record)} />
          ))}
        </div>
      )}
    </div>
  );
}
