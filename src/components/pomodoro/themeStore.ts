// Same subscribe/notify module-store pattern as configStore.ts in this
// folder — kept separate since this is a visual concern, not a timer
// behavior setting.
const STORAGE_KEY = "tapin:pomodoro-theme";

function load(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "none";
  } catch {
    return "none";
  }
}

let theme: string = typeof window !== "undefined" ? load() : "none";

const listeners = new Set<() => void>();

function notify() {
  for (const l of listeners) l();
}

export const themeStore = {
  subscribe(cb: () => void): () => void {
    listeners.add(cb);
    return () => listeners.delete(cb);
  },
  getSnapshot(): string {
    return theme;
  },
  set(id: string) {
    theme = id;
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {}
    notify();
  },
};
