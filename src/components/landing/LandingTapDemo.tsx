"use client";

import { MousePointerClick, Volume2, VolumeX, Zap } from "lucide-react";
import { useCallback, useState, useSyncExternalStore } from "react";

import { formatHours } from "@/components/dashboard/roster/utils";
import {
  getLandingTapSoundEnabled,
  getReducedMotionServerSnapshot,
  getReducedMotionSnapshot,
  playLandingTapSound,
  setLandingTapSoundEnabled,
  subscribeLandingTapSound,
  subscribeReducedMotion,
  triggerLandingTapHaptic,
} from "@/components/landing/landing-motion";
import { LandingCard } from "@/components/landing/landing-ui";
import LandingTapRipple from "@/components/landing/LandingTapRipple";
import { Button } from "@/components/ui/button";
import { TAP_MINUTES } from "@/config/constants";
import { cn } from "@/lib/utils";

const DEMO_PROJECT = "Platform Revamp";
const DEMO_COMPANY = "Vanguard Retail";
const INITIAL_MINUTES = 90;
const TAP_INCREMENT = TAP_MINUTES["30m"];

type Ripple = {
  id: number;
};

function getSoundServerSnapshot() {
  return false;
}

export default function LandingTapDemo() {
  const [loggedMinutes, setLoggedMinutes] = useState(INITIAL_MINUTES);
  const [tapping, setTapping] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const soundEnabled = useSyncExternalStore(
    subscribeLandingTapSound,
    getLandingTapSoundEnabled,
    getSoundServerSnapshot
  );

  const handleTap = useCallback(() => {
    setLoggedMinutes((minutes) => minutes + TAP_INCREMENT);
    setTapping(true);

    if (!reducedMotion) {
      setRipples((current) => [...current, { id: Date.now() }]);
    }

    if (soundEnabled && !reducedMotion) {
      playLandingTapSound();
    }

    triggerLandingTapHaptic();
  }, [reducedMotion, soundEnabled]);

  const handleTapAnimationEnd = useCallback(() => {
    setTapping(false);
  }, []);

  const handleRippleEnd = useCallback((id: number) => {
    setRipples((current) => current.filter((ripple) => ripple.id !== id));
  }, []);

  const toggleSound = useCallback(() => {
    setLandingTapSoundEnabled(!soundEnabled);
  }, [soundEnabled]);

  return (
    <LandingCard className="overflow-hidden text-left">
      <div className="flex items-start justify-between gap-3 border-b border-garden-border px-4 py-3 md:px-5">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Today</p>
          <p className="text-sm font-semibold text-ink truncate">{DEMO_PROJECT}</p>
          <p className="text-xs text-ink-subtle truncate">{DEMO_COMPANY}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-ink-muted">Logged</p>
          <p
            className="text-2xl font-bold tabular-nums text-ink tracking-tight"
            aria-live="polite"
            aria-atomic="true"
          >
            {formatHours(loggedMinutes)}
          </p>
        </div>
      </div>

      <div className="relative px-4 py-5 md:px-5 md:py-6">
        <div className="relative mx-auto flex max-w-xs flex-col items-center">
          <div className="relative">
            <button
              type="button"
              onClick={handleTap}
              aria-label={`Tap to log ${TAP_INCREMENT} minutes to ${DEMO_PROJECT}`}
              className={cn(
                "relative z-10 flex size-28 md:size-32 items-center justify-center rounded-lg border border-garden-border",
                "bg-surface-2/90 outline-none transition-colors duration-100",
                "focus-visible:ring-3 focus-visible:ring-link/50",
                "hover:bg-surface-2 active:scale-[0.98]",
                tapping && "landing-hero-tap-fill"
              )}
              onAnimationEnd={handleTapAnimationEnd}
            >
              <span
                className={cn(
                  "flex size-16 md:size-[4.5rem] items-center justify-center rounded-md bg-white shadow-card",
                  tapping ? "text-link landing-feature-icon-glow" : "text-kale"
                )}
              >
                <Zap className="size-8 md:size-9" aria-hidden />
              </span>
            </button>

            {!reducedMotion ? (
              <LandingTapRipple
                ripples={ripples}
                onEnd={handleRippleEnd}
                className="size-28 md:size-32 -translate-x-1/2 -translate-y-1/2"
              />
            ) : null}
          </div>

          <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-muted">
            <MousePointerClick className="size-3.5 shrink-0" aria-hidden />
            Tap to log {TAP_INCREMENT}m — instant, no form
          </p>
        </div>

        <div className="mt-4 flex items-center justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={toggleSound}
            className="h-8 gap-1.5 rounded-md px-2.5 text-[11px] text-ink-muted hover:text-ink"
            aria-pressed={soundEnabled}
            aria-label={soundEnabled ? "Turn tap sound off" : "Turn tap sound on"}
          >
            {soundEnabled ? (
              <Volume2 className="size-3.5" aria-hidden />
            ) : (
              <VolumeX className="size-3.5" aria-hidden />
            )}
            Tap sound {soundEnabled ? "on" : "off"}
          </Button>
        </div>
      </div>
    </LandingCard>
  );
}
