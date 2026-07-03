"use client";

import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  const id = setInterval(callback, 1000);
  return () => clearInterval(id);
}

function getSnapshot() {
  return Date.now();
}

// Server has no notion of "now" for a live clock — render a stable placeholder
// there and let the client take over on the first paint.
function getServerSnapshot() {
  return 0;
}

export default function LiveClock() {
  const now = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  if (now === 0) return <span className="tabular-nums">--:--:--</span>;

  return (
    <span className="tabular-nums">
      {new Date(now).toLocaleTimeString("en-US", { hour12: false })}
    </span>
  );
}
