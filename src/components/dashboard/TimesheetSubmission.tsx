"use client";

import { FileText, CheckCircle2, History } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { TimesheetSignOffDialog } from "@/components/dashboard/TimesheetSignOffDialog";
import { useProjects } from "@/components/providers/ProjectsProvider";
import { useTimesheets } from "@/components/providers/TimesheetProvider";
import compliance from "@/data/compliance.json";

export default function TimesheetSubmission() {
  const { projects } = useProjects();
  const { currentWeekRecord, submitTimesheet } = useTimesheets();

  const [isSignOffOpen, setIsSignOffOpen] = useState(false);

  const totalLogged = projects.reduce((sum, p) => sum + p.loggedMinutes / 60, 0);
  const totalTarget = projects.reduce((sum, p) => sum + p.targetHours, 0);

  return (
    <div className="bg-white rounded-lg border border-garden-border shadow-card">
      <div className="px-5 py-4 border-b border-garden-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-ink-muted text-xs font-medium tracking-wide uppercase">
          <FileText className="w-3.5 h-3.5" />
          Timesheet Submission
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/timesheets"
            title="View previous weeks"
            className="text-ink-subtle hover:text-ink-muted transition-colors"
          >
            <History className="w-3.5 h-3.5" />
          </Link>
          {currentWeekRecord ? (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/25 tracking-wide">
              CERTIFIED
            </span>
          ) : (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/25 tracking-wide">
              DRAFT
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div className="rounded-md bg-surface-2 border border-garden-border p-3.5 space-y-1">
          <p className="text-[10px] text-ink-subtle uppercase tracking-wide font-medium">
            Weekly Total
          </p>
          <p className="text-2xl font-semibold text-ink tracking-tight">
            {totalLogged.toFixed(1)}h
          </p>
          <p className="text-[10px] text-ink-subtle leading-tight">
            {totalLogged.toFixed(1)}h of {totalTarget}h allotted
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-[10px] text-ink-subtle uppercase tracking-wide font-medium flex items-center justify-between">
            Compliance History
            <span>2026 Season</span>
          </p>

          <div className="space-y-2.5">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-ink-muted font-medium">Monthly</span>
                <span className="font-semibold text-ink">{compliance.monthly.label}</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-success transition-all"
                  style={{ width: `${compliance.monthly.pct}%` }}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs">
                <span className="text-ink-muted font-medium">Yearly</span>
                <span className="font-semibold text-ink">{compliance.yearly.label}</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-2 overflow-hidden">
                <div
                  className="h-full rounded-full bg-success transition-all"
                  style={{ width: `${compliance.yearly.pct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {currentWeekRecord ? (
          <div className="flex items-center gap-2.5 rounded-md bg-success/8 border border-success/20 px-3.5 py-2.5">
            <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
            <p className="text-xs text-success">
              Certified by <span className="font-semibold">{currentWeekRecord.submittedBy}</span>
            </p>
          </div>
        ) : (
          <button
            onClick={() => setIsSignOffOpen(true)}
            className="w-full h-9 flex items-center justify-center gap-2 bg-kale hover:bg-kale-hover text-white rounded-md text-xs font-semibold uppercase tracking-wide transition-colors"
          >
            Certify Timesheet
          </button>
        )}
      </div>

      <TimesheetSignOffDialog
        open={isSignOffOpen}
        onOpenChange={setIsSignOffOpen}
        totalHours={totalLogged}
        onVerify={(signature) => submitTimesheet(signature, projects)}
      />
    </div>
  );
}
