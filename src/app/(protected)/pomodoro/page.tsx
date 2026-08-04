import { PomodoroTaskPanel } from "@/components/pomodoro/PomodoroTaskPanel";
import { PomodoroThemeShell } from "@/components/pomodoro/PomodoroThemeShell";
import { PomodoroTimer } from "@/components/pomodoro/PomodoroTimer";

export default function PomodoroPage() {
  return (
    <PomodoroThemeShell>
      <h1 className="text-base font-semibold text-ink mb-4">Pomodoro Timer</h1>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="bg-card rounded-lg border border-garden-border shadow-card lg:shrink-0 lg:w-2/3">
          <PomodoroTimer />
        </div>
        <div className="bg-card rounded-lg border border-garden-border shadow-card lg:flex-1">
          <PomodoroTaskPanel />
        </div>
      </div>
    </PomodoroThemeShell>
  );
}
