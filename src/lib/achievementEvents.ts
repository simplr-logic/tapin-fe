const DRAG_COUNT_KEY = "tapin:drag-count";
// localStorage's native "storage" event only fires in *other* tabs — this
// custom event covers the same-tab case, same pattern as TimesheetProvider.
const DRAG_COUNT_EVENT = "tapin:drag-count-updated";

export function getDragCount(): number {
  if (typeof window === "undefined") return 0;
  return Number(window.localStorage.getItem(DRAG_COUNT_KEY) ?? "0");
}

export function bumpDragCount(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DRAG_COUNT_KEY, String(getDragCount() + 1));
  window.dispatchEvent(new Event(DRAG_COUNT_EVENT));
}

export function subscribeDragCount(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener(DRAG_COUNT_EVENT, callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener(DRAG_COUNT_EVENT, callback);
  };
}
