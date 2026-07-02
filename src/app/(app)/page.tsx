import DailyAttendance from "@/components/dashboard/DailyAttendance";
import TimesheetSubmission from "@/components/dashboard/TimesheetSubmission";
import WeeklyRoster from "@/components/dashboard/WeeklyRosterClient";

export default function Home() {
  return (
    <div className="flex gap-4 p-4 max-w-[1500px] mx-auto w-full h-full">
      <aside className="flex flex-col gap-4 w-[320px] shrink-0 overflow-y-auto">
        <DailyAttendance />
        <TimesheetSubmission />
      </aside>
      <section className="flex-1 min-w-0 overflow-hidden">
        <WeeklyRoster />
      </section>
    </div>
  );
}
