import { POMODORO_CONFIG } from "@/config/constants";

export type PomodoroSettings = typeof POMODORO_CONFIG;

const STORAGE_KEY = "tapin:pomodoro-config";

function load(): PomodoroSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...POMODORO_CONFIG, ...JSON.parse(raw) };
  } catch {}
  return { ...POMODORO_CONFIG };
}

let settings: PomodoroSettings = typeof window !== "undefined" ? load() : { ...POMODORO_CONFIG };

const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

export const configStore = {
  subscribe(cb: () => void): () => void {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  getSnapshot(): PomodoroSettings {
    return settings;
  },
  update(patch: Partial<PomodoroSettings>) {
    settings = { ...settings, ...patch };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {}
    notify();
  },
  reset() {
    settings = { ...POMODORO_CONFIG };
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {}
    notify();
  },
};
