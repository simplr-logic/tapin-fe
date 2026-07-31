"use client";

import { useSyncExternalStore } from "react";

// There's no persistent backend flag for "has this person finished the
// welcome/company-setup step" (only needs_onboarding exists server-side) —
// this is tracked client-side, seeded only from is_new_account (the
// one-time post-login query param a real new signup gets). Existing users
// never see is_new_account again, so they never get gated retroactively.
const STORAGE_KEY = "tapin:welcome-pending";
const EVENT = "tapin:welcome-gate-updated";

function readPending(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(STORAGE_KEY) === "1";
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useWelcomePending(): boolean {
  return useSyncExternalStore(subscribe, readPending, () => false);
}

/** Idempotent — safe to call every time is_new_account=1 is seen. */
export function seedWelcomePending(): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, "1");
  window.dispatchEvent(new Event(EVENT));
}

export function completeWelcome(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(EVENT));
}
