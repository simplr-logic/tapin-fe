"use client";

import { useState } from "react";

import DailyAttendance from "@/components/dashboard/DailyAttendance";
import TimesheetSubmission from "@/components/dashboard/TimesheetSubmission";
import WeeklyRoster from "@/components/dashboard/WeeklyRosterClient";

export default function DashboardShell() {
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  return (
    <div className="flex flex-col gap-4 md:flex-row md:h-full">
      <aside className="flex flex-col gap-4 md:w-[320px] md:shrink-0 md:overflow-y-auto">
        <DailyAttendance selectedDate={selectedDate} onDaySelect={setSelectedDate} />
        <TimesheetSubmission />
      </aside>
      <section className="md:flex-1 md:min-w-0 md:overflow-hidden">
        <WeeklyRoster externalDate={selectedDate} />
      </section>
    </div>
  );
}
