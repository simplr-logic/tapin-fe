"use client";

import { useCallback, useSyncExternalStore } from "react";

import type { FontFamilyId, FontSizeId, PaletteId } from "@/config/theme";

// Same same-tab-update problem as TimesheetProvider's localStorage store —
// the native "storage" event only fires in *other* tabs.
const EVENT = "tapin:appearance-updated";

function readAttr(attr: string, fallback: string): string {
  if (typeof document === "undefined") return fallback;
  return document.documentElement.getAttribute(`data-${attr}`) ?? fallback;
}

function writeAttr(attr: string, storageKey: string, value: string) {
  document.documentElement.setAttribute(`data-${attr}`, value);
  window.localStorage.setItem(storageKey, value);
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useAppearance() {
  const palette = useSyncExternalStore(
    subscribe,
    () => readAttr("palette", "garden"),
    () => "garden"
  ) as PaletteId;
  const fontFamily = useSyncExternalStore(
    subscribe,
    () => readAttr("font", "sans"),
    () => "sans"
  ) as FontFamilyId;
  const fontSize = useSyncExternalStore(
    subscribe,
    () => readAttr("font-size", "comfortable"),
    () => "comfortable"
  ) as FontSizeId;

  const setPalette = useCallback(
    (value: PaletteId) => writeAttr("palette", "tapin:palette", value),
    []
  );
  const setFontFamily = useCallback(
    (value: FontFamilyId) => writeAttr("font", "tapin:font", value),
    []
  );
  const setFontSize = useCallback(
    (value: FontSizeId) => writeAttr("font-size", "tapin:font-size", value),
    []
  );

  return { palette, setPalette, fontFamily, setFontFamily, fontSize, setFontSize };
}
