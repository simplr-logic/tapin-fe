import { configStore } from "./configStore";

export type Phase = "work" | "short-break" | "long-break";

export type PomodoroTask = { id: number; text: string };

export type TimerSnapshot = {
  phase: Phase;
  secondsLeft: number;
  running: boolean;
  sessions: number;
  selectedProjectId: string | null;
  tasks: PomodoroTask[];
};

function cfg() {
  return configStore.getSnapshot();
}

function phaseDuration(phase: Phase): number {
  const c = cfg();
  if (phase === "work") return c.workMinutes * 60;
  if (phase === "short-break") return c.shortBreakMinutes * 60;
  return c.longBreakMinutes * 60;
}

let state: TimerSnapshot = {
  phase: "work",
  secondsLeft: phaseDuration("work"),
  running: false,
  sessions: 0,
  selectedProjectId: null,
  tasks: [],
};

let intervalId: ReturnType<typeof setInterval> | null = null;
const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

function advance(): { phase: Phase; sessions: number } {
  if (state.phase !== "work") return { phase: "work", sessions: state.sessions };
  const sessions = state.sessions + 1;
  const phase = sessions % cfg().sessionsPerLongBreak === 0 ? "long-break" : "short-break";
  return { phase, sessions };
}

function tick() {
  if (state.secondsLeft > 1) {
    state = { ...state, secondsLeft: state.secondsLeft - 1 };
    notify();
    return;
  }
  const { phase, sessions } = advance();
  const running = cfg().autoStart;
  state = { ...state, phase, secondsLeft: phaseDuration(phase), running, sessions };
  clearInterval(intervalId!);
  intervalId = null;
  if (running) intervalId = setInterval(tick, 1000);
  notify();
}

export const timerStore = {
  subscribe(callback: () => void): () => void {
    listeners.add(callback);
    return () => listeners.delete(callback);
  },
  getSnapshot(): TimerSnapshot {
    return state;
  },
  start() {
    if (state.running) return;
    state = { ...state, running: true };
    intervalId = setInterval(tick, 1000);
    notify();
  },
  pause() {
    if (!state.running) return;
    clearInterval(intervalId!);
    intervalId = null;
    state = { ...state, running: false };
    notify();
  },
  reset() {
    clearInterval(intervalId!);
    intervalId = null;
    state = { ...state, secondsLeft: phaseDuration(state.phase), running: false };
    notify();
  },
  skip() {
    clearInterval(intervalId!);
    intervalId = null;
    const { phase, sessions } = advance();
    state = { ...state, phase, secondsLeft: phaseDuration(phase), running: false, sessions };
    notify();
  },
  setProject(id: string | null) {
    state = { ...state, selectedProjectId: id };
    notify();
  },
  addTask(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;
    state = { ...state, tasks: [...state.tasks, { id: Date.now(), text: trimmed }] };
    notify();
  },
  removeTask(id: number) {
    state = { ...state, tasks: state.tasks.filter((t) => t.id !== id) };
    notify();
  },
  clearTasks() {
    state = { ...state, tasks: [] };
    notify();
  },
};
