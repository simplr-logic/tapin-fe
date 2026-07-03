import { ShieldCheck, UserCheck, Flame, Check } from "lucide-react";
import LiveClock from "./LiveClock";
import attendance from "@/data/attendance.json";

const { status: attendanceStatus, streakCount, streakDays } = attendance;

export default function DailyAttendance() {
  const today = new Date();
  const dateStr = today
    .toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
    .toUpperCase();

  return (
    <div className="bg-white rounded-lg border border-garden-border shadow-card overflow-hidden">
      <div className="px-5 py-4 border-b border-garden-border flex items-center justify-between">
        <div className="flex items-center gap-2 text-ink-muted text-xs font-medium tracking-wide uppercase">
          <ShieldCheck className="w-3.5 h-3.5" />
          Daily Attendance
        </div>
        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-warning/10 text-warning border border-warning/25 tracking-wide">
          {attendanceStatus}
        </span>
      </div>

      <div className="px-5 py-6 space-y-5">
        <div className="text-center space-y-0.5">
          <p className="text-[10px] text-ink-subtle tracking-widest font-medium">{dateStr}</p>
          <p className="text-[2.75rem] font-light tracking-tight text-ink font-mono leading-none">
            <LiveClock />
          </p>
        </div>

        <button className="w-full h-11 flex items-center justify-center gap-2 bg-kale hover:bg-kale-hover active:bg-kale-hover text-white rounded-md text-sm font-medium transition-colors shadow-card">
          <UserCheck className="w-4 h-4" />
          Perform Daily Check-In
        </button>

        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-ink-subtle tracking-wide uppercase font-medium">
              Streak Progress
            </span>
            <span className="flex items-center gap-1 text-[11px] font-semibold text-warning">
              <Flame className="w-3 h-3" />
              {streakCount} Days
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            {streakDays.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className={[
                    "w-full aspect-square rounded-md flex items-center justify-center text-[10px] font-semibold transition-all",
                    day.status === "done"
                      ? "bg-success text-white"
                      : day.status === "current"
                        ? "ring-2 ring-link ring-offset-1 bg-link/10 text-link"
                        : "bg-surface-2 text-ink-subtle",
                  ].join(" ")}
                >
                  {day.status === "done" ? (
                    <Check className="w-3 h-3" strokeWidth={3} />
                  ) : (
                    day.label
                  )}
                </div>
                <span className="text-[9px] text-ink-subtle font-medium">{day.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
