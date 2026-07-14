"use client";

import { AlertTriangle, CheckCircle2, FileText, History, RotateCcw } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import {
  type PreviewProject,
  TimesheetSignOffDialog,
} from "@/components/dashboard/TimesheetSignOffDialog";
import { sumLogs, useProjects } from "@/components/providers/ProjectsProvider";
import { getMonthLabel, useTimesheets } from "@/components/providers/TimesheetProvider";
import { TARGET_SCALE } from "@/config/constants";
import { gardenColors } from "@/config/theme";

function MonthStats({ label, logged, target }: { label: string; logged: number; target: number }) {
  const pct = target > 0 ? Math.round((logged / target) * 100) : 0;
  const color =
    pct >= 115 ? gardenColors.error : pct >= 100 ? gardenColors.success : gardenColors.yellow;

  return (
    <div className="rounded-md bg-surface-2 border border-garden-border p-3.5 space-y-2.5">
      <p className="text-[10px] text-ink-subtle uppercase tracking-wide font-medium">{label}</p>
      <div className="flex items-end justify-between gap-2">
        <span className="text-2xl font-semibold text-ink tracking-tight tabular-nums">
          {logged.toFixed(1)}h
        </span>
        <span className="text-xs text-ink-subtle mb-0.5">of {Math.round(target)}h target</span>
      </div>
      <div className="space-y-1">
        <div className="h-1.5 rounded-full bg-surface-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${Math.min(100, pct)}%`, backgroundColor: color }}
          />
        </div>
        <p className="text-[11px] font-semibold tabular-nums" style={{ color }}>
          {pct}%
        </p>
      </div>
    </div>
  );
}

export default function TimesheetSubmission() {
  const { projects } = useProjects();
  const { currentMonthRecord, lastMonthSubmitted, submitTimesheet, unsubmitTimesheet } =
    useTimesheets();

  const [isSignOffOpen, setIsSignOffOpen] = useState(false);

  const now = new Date();

  // Last month
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthStart = lastMonthDate.toLocaleDateString("en-CA").slice(0, 7) + "-01";
  const lastMonthEnd = new Date(
    lastMonthDate.getFullYear(),
    lastMonthDate.getMonth() + 1,
    0
  ).toLocaleDateString("en-CA");
  const lastMonthLabel = getMonthLabel(lastMonthDate);
  const lastMonthLogged = projects.reduce(
    (sum, p) => sum + sumLogs(p.logs, lastMonthStart, lastMonthEnd) / 60,
    0
  );
  const lastMonthTarget = projects.reduce((sum, p) => sum + p.targetHours, 0) * TARGET_SCALE.month;

  // Current month
  const thisMonthStart = now.toLocaleDateString("en-CA").slice(0, 7) + "-01";
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toLocaleDateString(
    "en-CA"
  );
  const thisMonthLabel = getMonthLabel(now);
  const thisMonthLogged = projects.reduce(
    (sum, p) => sum + sumLogs(p.logs, thisMonthStart, thisMonthEnd) / 60,
    0
  );
  const thisMonthTarget = projects.reduce((sum, p) => sum + p.targetHours, 0) * TARGET_SCALE.month;

  const showingLastMonth = !lastMonthSubmitted;

  const previewStart = showingLastMonth ? lastMonthStart : thisMonthStart;
  const previewEnd = showingLastMonth ? lastMonthEnd : thisMonthEnd;
  const previewProjects: PreviewProject[] = projects.map((p) => ({
    id: p.id,
    title: p.title,
    company: p.company,
    loggedMinutes: sumLogs(p.logs, previewStart, previewEnd),
    targetHours: Math.round(p.targetHours * TARGET_SCALE.month),
  }));
  const previewTotalTarget = previewProjects.reduce((s, p) => s + p.targetHours, 0);

  return (
    <div className="bg-white rounded-lg border border-garden-border shadow-card">
      <div className="px-5 py-4 border-b border-garden-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-ink-muted text-xs font-medium tracking-wide uppercase">
          <FileText className="w-3.5 h-3.5" />
          Timesheet
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/timesheets"
            className="text-ink-subtle hover:text-ink-muted transition-colors"
          >
            <History className="w-3.5 h-3.5" />
          </Link>
          {showingLastMonth ? (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-error/10 text-error border border-error/25 tracking-wide">
              OVERDUE
            </span>
          ) : currentMonthRecord ? (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-success/10 text-success border border-success/25 tracking-wide">
              SUBMITTED
            </span>
          ) : (
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/25 tracking-wide">
              DRAFT
            </span>
          )}
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {showingLastMonth ? (
          <>
            <div className="flex items-start gap-2.5 rounded-md bg-error/8 border border-error/20 px-3.5 py-2.5">
              <AlertTriangle className="w-4 h-4 text-error shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-error">{lastMonthLabel} not submitted</p>
                <p className="text-[11px] text-error/80 mt-0.5 leading-snug">
                  Submit to unlock logging for {getMonthLabel(now).split(" ")[0]}.
                </p>
              </div>
            </div>

            <MonthStats label={lastMonthLabel} logged={lastMonthLogged} target={lastMonthTarget} />

            <button
              onClick={() => setIsSignOffOpen(true)}
              className="w-full h-9 flex items-center justify-center gap-2 bg-error hover:bg-error/90 text-white rounded-md text-xs font-semibold uppercase tracking-wide transition-colors"
            >
              Submit {lastMonthLabel.split(" ")[0]} Timesheet
            </button>
          </>
        ) : (
          <>
            <MonthStats label={thisMonthLabel} logged={thisMonthLogged} target={thisMonthTarget} />

            {currentMonthRecord ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2.5 rounded-md bg-success/8 border border-success/20 px-3.5 py-2.5">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <p className="text-xs text-success">
                    Submitted by{" "}
                    <span className="font-semibold">{currentMonthRecord.submittedBy}</span>
                  </p>
                </div>
                <button
                  onClick={() => unsubmitTimesheet(currentMonthRecord.monthKey)}
                  className="w-full h-9 flex items-center justify-center gap-2 border border-error/40 hover:bg-error/8 text-error rounded-md text-xs font-semibold uppercase tracking-wide transition-colors"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Revoke Submission
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsSignOffOpen(true)}
                className="w-full h-9 flex items-center justify-center gap-2 bg-kale hover:bg-kale-hover text-white rounded-md text-xs font-semibold uppercase tracking-wide transition-colors"
              >
                Submit Timesheet
              </button>
            )}
          </>
        )}
      </div>

      <TimesheetSignOffDialog
        open={isSignOffOpen}
        onOpenChange={setIsSignOffOpen}
        totalHours={showingLastMonth ? lastMonthLogged : thisMonthLogged}
        totalTarget={previewTotalTarget}
        monthLabel={showingLastMonth ? lastMonthLabel : thisMonthLabel}
        projects={previewProjects}
        onVerify={(sig) =>
          submitTimesheet(sig, projects, showingLastMonth ? lastMonthDate : undefined)
        }
      />
    </div>
  );
}
