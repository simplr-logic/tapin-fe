export const DAILY_LOGS_KEY = "tapin.dailylogs";
export const DAILY_LOGS_EVENT = "tapin:dailylogs-updated";

export function readDailyLogs(): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    return JSON.parse(window.localStorage.getItem(DAILY_LOGS_KEY) ?? "{}") as Record<
      string,
      number
    >;
  } catch {
    return {};
  }
}

export function addDailyMinutes(isoDate: string, minutes: number): void {
  const logs = readDailyLogs();
  const next = Math.max(0, (logs[isoDate] ?? 0) + minutes);
  if (next === 0) {
    delete logs[isoDate];
  } else {
    logs[isoDate] = next;
  }
  window.localStorage.setItem(DAILY_LOGS_KEY, JSON.stringify(logs));
  window.dispatchEvent(new Event(DAILY_LOGS_EVENT));
}
