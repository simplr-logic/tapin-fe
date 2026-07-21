"use client";

import { Pause, Play, RotateCcw, Settings, SkipForward } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";

import { useProjects } from "@/components/providers/ProjectsProvider";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { APP_NAME } from "@/config/constants";

import { configStore } from "./configStore";
import { PomodoroSettings } from "./PomodoroSettings";
import { timerStore } from "./timerStore";

import type { Phase } from "./timerStore";

const PHASE_LABELS: Record<Phase, string> = {
  work: "Focus",
  "short-break": "Short Break",
  "long-break": "Long Break",
};

const PHASE_STYLES: Record<Phase, { ring: string; badge: string; digit: string }> = {
  work: { ring: "ring-kale/50", badge: "bg-kale/8 text-kale", digit: "text-kale" },
  "short-break": {
    ring: "ring-success/50",
    badge: "bg-success/10 text-success",
    digit: "text-success",
  },
  "long-break": {
    ring: "ring-[#1F73B7]/40",
    badge: "bg-[#1F73B7]/8 text-link",
    digit: "text-link",
  },
};

function fmt(seconds: number): string {
  const m = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function playTone(frequency: number, duration: number, volume: number) {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = frequency;
    osc.type = "sine";
    gain.gain.setValueAtTime(volume, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.start();
    osc.stop(ctx.currentTime + duration);
    osc.addEventListener("ended", () => ctx.close());
  } catch {}
}

const playBeep = () => playTone(528, 1.2, 0.35);
const playTick = () => playTone(880, 0.04, 0.05);

function showNotification(nextPhase: Phase) {
  if (typeof window === "undefined" || Notification.permission !== "granted") return;
  const body: Record<Phase, string> = {
    work: "Break over — time to focus!",
    "short-break": "Session complete! Take a short break.",
    "long-break": "4 sessions done! Take a long break.",
  };
  new Notification(APP_NAME, { body: body[nextPhase], icon: "/favicon.ico" });
}

export function PomodoroTimer() {
  const { phase, secondsLeft, running, sessions, selectedProjectId, tasks } = useSyncExternalStore(
    timerStore.subscribe,
    timerStore.getSnapshot,
    timerStore.getSnapshot
  );
  const config = useSyncExternalStore(
    configStore.subscribe,
    configStore.getSnapshot,
    configStore.getSnapshot
  );
  const { projects, adjustLoggedMinutes } = useProjects();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const styles = PHASE_STYLES[phase];
  const cyclePosition = sessions % config.sessionsPerLongBreak;

  useEffect(() => {
    if (config.notifyOnComplete && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [config.notifyOnComplete]);

  useEffect(() => {
    if (!config.showInTabTitle) return;
    document.title = `${fmt(secondsLeft)} · ${PHASE_LABELS[phase]}`;
    return () => {
      document.title = APP_NAME;
    };
  }, [secondsLeft, phase, config.showInTabTitle]);

  const prevPhaseRef = useRef<Phase>(phase);
  useEffect(() => {
    if (prevPhaseRef.current === phase) return;
    const wasWork = prevPhaseRef.current === "work";
    prevPhaseRef.current = phase;
    if (config.soundOnComplete) playBeep();
    if (config.notifyOnComplete) showNotification(phase);
    if (wasWork && selectedProjectId !== null) {
      const note =
        tasks.length > 0
          ? `Pomodoro: ${tasks.map((t) => t.text).join(", ")} (+${config.workMinutes}m)`
          : `Pomodoro session (+${config.workMinutes}m)`;
      adjustLoggedMinutes(Number(selectedProjectId), config.workMinutes, note);
      timerStore.clearTasks();
    }
  }, [
    phase,
    config.soundOnComplete,
    config.notifyOnComplete,
    selectedProjectId,
    tasks,
    config.workMinutes,
    adjustLoggedMinutes,
  ]);

  const prevSecondsRef = useRef(secondsLeft);
  useEffect(() => {
    const didDecrement = secondsLeft < prevSecondsRef.current;
    prevSecondsRef.current = secondsLeft;
    if (config.tickSound && running && didDecrement) playTick();
  }, [secondsLeft, running, config.tickSound]);

  return (
    <>
      <div className="flex flex-col items-center gap-8 px-6 py-10">
        <div className="w-full flex items-center justify-between">
          <span
            className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider ${styles.badge}`}
          >
            {PHASE_LABELS[phase]}
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-ink-subtle hover:text-ink-muted"
            onClick={() => setSettingsOpen(true)}
            title="Timer settings"
          >
            <Settings className="w-4 h-4" />
          </Button>
        </div>

        <Select
          value={selectedProjectId ?? "none"}
          onValueChange={(v) => timerStore.setProject(v === "none" ? null : v)}
        >
          <SelectTrigger className="h-8 text-sm text-ink-muted w-full">
            <SelectValue placeholder="No project" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">No project</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={String(p.id)}>
                {p.title}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div
          className={`flex items-center justify-center w-72 h-72 rounded-full ring-4 ${styles.ring} bg-white shadow-card`}
        >
          <span className={`text-7xl font-bold tabular-nums tracking-tight ${styles.digit}`}>
            {fmt(secondsLeft)}
          </span>
        </div>

        <div className="flex gap-2.5 items-center">
          {Array.from({ length: config.sessionsPerLongBreak }).map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors duration-300 ${i < cyclePosition ? "bg-kale" : "bg-surface-3"}`}
            />
          ))}
          <span className="ml-1 text-[11px] text-ink-subtle">
            {cyclePosition}/{config.sessionsPerLongBreak}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={timerStore.reset}
            className="h-10 w-10"
            title="Reset"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            onClick={running ? timerStore.pause : timerStore.start}
            className="h-12 w-32 bg-kale hover:bg-kale-hover text-white font-semibold gap-1.5"
          >
            {running ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {running ? "Pause" : "Start"}
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={timerStore.skip}
            className="h-10 w-10"
            title="Skip"
          >
            <SkipForward className="w-4 h-4" />
          </Button>
        </div>

        <p className="text-xs text-ink-subtle">
          {sessions} session{sessions !== 1 ? "s" : ""} completed
        </p>
      </div>

      <PomodoroSettings open={settingsOpen} onOpenChange={setSettingsOpen} />
    </>
  );
}
