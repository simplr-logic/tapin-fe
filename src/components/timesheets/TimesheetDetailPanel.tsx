"use client";

import { ArrowLeft, CalendarClock, UserCheck, X } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { getComplianceBgClass, getComplianceColorClass } from "@/config/theme";

import { TimesheetMonthCalendar } from "./TimesheetMonthCalendar";

import type {
  TimesheetProjectSnapshot,
  TimesheetRecord,
} from "@/components/providers/TimesheetProvider";

function ProjectRow({ p }: { p: TimesheetProjectSnapshot }) {
  const pct = p.targetHours > 0 ? Math.round((p.loggedMinutes / 60 / p.targetHours) * 100) : 0;
  const textCls = getComplianceColorClass(pct);
  const bgCls = getComplianceBgClass(pct);
  const h = Math.floor(p.loggedMinutes / 60);
  const m = p.loggedMinutes % 60;

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-ink truncate">{p.title}</p>
          <p className="text-[10px] text-ink-subtle truncate">{p.company}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs font-semibold text-ink tabular-nums">
            {m > 0 ? `${h}h ${m}m` : `${h}h`}
            <span className="text-ink-subtle font-normal"> / {p.targetHours}h</span>
          </p>
          <p className={`text-[10px] font-bold tabular-nums ${textCls}`}>{pct}%</p>
        </div>
      </div>
      <div className="h-1 rounded-full bg-surface-2 overflow-hidden">
        <div
          className={`h-full rounded-full ${bgCls}`}
          style={{ width: `${Math.min(100, pct)}%` }}
        />
      </div>
    </div>
  );
}

function DayProjectRow({ p, minutes }: { p: TimesheetProjectSnapshot; minutes: number }) {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return (
    <div className="flex items-center justify-between gap-2 py-2">
      <div className="min-w-0">
        <p className="text-xs font-semibold text-ink truncate">{p.title}</p>
        <p className="text-[10px] text-ink-subtle truncate">{p.company}</p>
      </div>
      <span className="text-xs font-semibold text-ink tabular-nums shrink-0">
        {m > 0 ? `${h}h ${m}m` : `${h}h`}
      </span>
    </div>
  );
}

export function TimesheetDetailPanel({
  record,
  onBack,
}: {
  record: TimesheetRecord;
  onBack: () => void;
}) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);

  const pct =
    record.totalTargetHours > 0
      ? Math.round((record.totalLoggedHours / record.totalTargetHours) * 100)
      : 0;
  const textCls = getComplianceColorClass(pct);

  const dateStr = selectedDate ? selectedDate.toLocaleDateString("en-CA") : null;
  const dayProjects = dateStr
    ? record.projects
        .map((p) => ({ p, minutes: p.logs?.[dateStr] ?? 0 }))
        .filter(({ minutes }) => minutes > 0)
    : null;
  const dayTotal = dayProjects ? dayProjects.reduce((s, { minutes }) => s + minutes, 0) : 0;

  return (
    <div className="bg-card rounded-lg border border-garden-border shadow-card overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 border-b border-garden-border flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          onClick={onBack}
          className="text-ink-subtle hover:text-ink shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-ink">{record.monthLabel}</p>
          <div className="flex items-center gap-3 text-[10px] text-ink-subtle mt-0.5 flex-wrap">
            <span className="flex items-center gap-1">
              <UserCheck className="w-3 h-3" />
              {record.submittedBy}
            </span>
            <span className="flex items-center gap-1">
              <CalendarClock className="w-3 h-3" />
              {new Date(record.submittedAt).toLocaleString("en-US", {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className="text-sm font-semibold text-ink tabular-nums">
            {record.totalLoggedHours.toFixed(1)}h
          </p>
          <p className={`text-[10px] font-bold tabular-nums ${textCls}`}>{pct}%</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto lg:overflow-hidden lg:flex lg:flex-row">
        <div className="border-b border-garden-border lg:border-b-0 lg:border-r lg:shrink-0 lg:overflow-y-auto">
          <TimesheetMonthCalendar
            record={record}
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
          />
        </div>

        <div className="p-5 space-y-3 lg:flex-1 lg:overflow-y-auto">
          {dayProjects !== null ? (
            <>
              <div className="flex items-center justify-between">
                <p className="text-[10px] text-ink-subtle tracking-wide font-medium">
                  {selectedDate!.toLocaleDateString("en-US", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                  {" · "}
                  <span className="tabular-nums">{(dayTotal / 60).toFixed(1)}h</span>
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedDate(undefined)}
                  className="h-auto gap-1 px-2 py-0.5 text-[10px] font-medium bg-surface-3 hover:bg-surface-2 text-ink-muted hover:text-ink"
                >
                  <X className="w-3 h-3" /> Clear
                </Button>
              </div>
              {dayProjects.length === 0 ? (
                <p className="text-xs text-ink-subtle py-2">No hours logged this day.</p>
              ) : (
                <div className="divide-y divide-garden-border">
                  {dayProjects.map(({ p, minutes }) => (
                    <DayProjectRow key={p.id} p={p} minutes={minutes} />
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <p className="text-[10px] text-ink-subtle tracking-wide font-medium">
                Projects · {record.projects.length}
              </p>
              <div className="space-y-4">
                {record.projects.map((p) => (
                  <ProjectRow key={p.id} p={p} />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
