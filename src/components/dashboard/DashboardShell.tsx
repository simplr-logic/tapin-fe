"use client";

import { useState } from "react";

import DailyAttendance from "@/components/dashboard/DailyAttendance";
import { getPeriodRange, isSamePeriod } from "@/components/dashboard/roster/utils";
import TimesheetSubmission from "@/components/dashboard/TimesheetSubmission";
import WeeklyRoster from "@/components/dashboard/WeeklyRosterClient";

import type { PeriodView } from "@/config/constants";

export default function DashboardShell() {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [period, setPeriod] = useState<PeriodView>("week");

  const isCurrentPeriod = isSamePeriod(selectedDate, new Date(), period);
  const weekRange = period === "week" ? getPeriodRange("week", selectedDate) : undefined;

  function handleDaySelect(date: Date) {
    setSelectedDate(date);
    if (period !== "week") setPeriod("day");
  }

  function handleTodayClick() {
    setSelectedDate(new Date());
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:h-full">
      <section className="order-first lg:order-2 lg:flex-1 lg:min-w-0 lg:overflow-hidden">
        <WeeklyRoster
          externalDate={selectedDate}
          externalPeriod={period}
          onPeriodChange={setPeriod}
        />
      </section>
      <aside className="order-last lg:order-1 flex flex-col gap-4 lg:w-[320px] lg:shrink-0 lg:overflow-y-auto">
        <div className="hidden lg:block">
          <DailyAttendance
            selectedDate={selectedDate}
            onDaySelect={handleDaySelect}
            period={period}
            onPeriodChange={setPeriod}
            isCurrentPeriod={isCurrentPeriod}
            onTodayClick={handleTodayClick}
            weekRange={weekRange}
          />
        </div>
        <TimesheetSubmission />
      </aside>
    </div>
  );
}
