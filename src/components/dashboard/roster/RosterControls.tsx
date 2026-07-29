"use client";

import { CalendarDays, LayoutGrid } from "lucide-react";

import { AttendanceCalendarContent } from "@/components/dashboard/AttendanceCalendarContent";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

import { getPeriodLabel, getPeriodRange } from "./utils";

import type { PeriodView } from "@/config/constants";

interface RosterControlsProps {
  period: PeriodView;
  changePeriod: (p: PeriodView) => void;
  selectedDate: Date;
  setSelectedDate: (d: Date) => void;
  isDatePickerOpen: boolean;
  setIsDatePickerOpen: (open: boolean) => void;
  periodLocked: boolean;
  isCurrentPeriod: boolean;
}

const periodOptions: PeriodView[] = ["day", "week", "month", "year"];

export function RosterControls({
  period,
  changePeriod,
  selectedDate,
  setSelectedDate,
  isDatePickerOpen,
  setIsDatePickerOpen,
  periodLocked,
  isCurrentPeriod,
}: RosterControlsProps) {
  const periodLabel = getPeriodLabel(period, selectedDate);
  const weekRange = period === "week" ? getPeriodRange("week", selectedDate) : undefined;

  return (
    <div className="px-3 py-2.5 lg:px-5 lg:py-3 border-b border-garden-border space-y-2">
      {/* Title — always visible */}
      <div className="flex items-center gap-2 text-ink-muted text-xs font-medium tracking-wide uppercase">
        <LayoutGrid className="w-3.5 h-3.5" />
        Project Roster
      </div>

      {/* Mobile only: period pills + date picker on same row */}
      <div className="lg:hidden flex items-center gap-1.5 flex-nowrap">
        <div className="flex items-center rounded-md border border-garden-border bg-surface-2 p-0.5 shrink-0">
          {periodOptions.map((p) => (
            <Button
              key={p}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => changePeriod(p)}
              className={cn(
                "h-auto rounded-md px-2 py-0.5 text-xs font-medium capitalize",
                period === p
                  ? "bg-card shadow-card text-ink border border-garden-border hover:bg-card"
                  : "text-ink-subtle hover:text-ink-muted"
              )}
            >
              {p}
            </Button>
          ))}
        </div>

        <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
          <PopoverTrigger
            render={
              <Button
                type="button"
                variant="outline"
                className="h-auto py-1 px-2.5 text-xs font-normal text-ink-muted gap-1.5 shrink-0 whitespace-nowrap"
              />
            }
          >
            <CalendarDays className="w-3.5 h-3.5 text-ink-subtle" />
            <span className="font-medium">{periodLabel}</span>
            {periodLocked && (
              <>
                <span className="w-px h-3 bg-garden-border" />
                <span className="text-[10px] font-semibold text-ink-muted">Locked</span>
              </>
            )}
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-auto p-0">
            <AttendanceCalendarContent
              selectedDate={selectedDate}
              weekRange={weekRange}
              onDaySelect={(d) => {
                setSelectedDate(d);
                setIsDatePickerOpen(false);
              }}
            />
          </PopoverContent>
        </Popover>

        {!isCurrentPeriod && (
          <Button
            type="button"
            variant="link"
            onClick={() => setSelectedDate(new Date())}
            className="h-auto text-xs font-medium text-link hover:text-link-hover px-1 shrink-0 whitespace-nowrap"
          >
            Today
          </Button>
        )}
      </div>
    </div>
  );
}
