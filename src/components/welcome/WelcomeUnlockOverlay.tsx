"use client";

import { PartyPopper } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { completeWelcome } from "@/hooks/useWelcomeGate";
import { cn } from "@/lib/utils";

type Phase = "flood" | "hold" | "reveal";

const FLOOD_MS = 550;
const HOLD_MS = 500;
const REVEAL_MS = 650;

// Fullscreen flood-and-reveal: a kale circle expands from the trigger point
// to cover the entire viewport, holds on a "welcome" moment, then fades away
// to reveal the app underneath. completeWelcome() fires mid-hold — while the
// overlay is still fully opaque — so the dashboard swaps in behind it
// unseen, and what the user actually watches is the fade uncovering the
// already-real app rather than a jump cut.
export function WelcomeUnlockOverlay({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>("flood");
  // completeWelcome() below flips the parent's pending state mid-timeline,
  // which re-renders DashboardGate and hands us a new `onDone` closure — if
  // that were a direct effect dependency, the timers would restart from
  // scratch right as "hold" begins, replaying the flood/reveal a second
  // time. Reading it through a ref keeps the schedule tied to mount only.
  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  });

  useEffect(() => {
    const toHold = setTimeout(() => setPhase("hold"), FLOOD_MS);
    const unlock = setTimeout(() => {
      completeWelcome();
      setPhase("reveal");
    }, FLOOD_MS + HOLD_MS);
    const finish = setTimeout(() => onDoneRef.current(), FLOOD_MS + HOLD_MS + REVEAL_MS);
    return () => {
      clearTimeout(toHold);
      clearTimeout(unlock);
      clearTimeout(finish);
    };
  }, []);

  return (
    <div
      aria-hidden
      className={cn(
        "fixed inset-0 z-[100] flex items-center justify-center bg-kale text-white",
        "transition-[clip-path] ease-out",
        phase === "reveal" && "transition-opacity"
      )}
      style={{
        clipPath: phase === "flood" ? "circle(0% at 50% 90%)" : "circle(150% at 50% 90%)",
        transitionDuration: phase === "reveal" ? `${REVEAL_MS}ms` : `${FLOOD_MS}ms`,
        opacity: phase === "reveal" ? 0 : 1,
      }}
    >
      <div
        className={cn(
          "flex flex-col items-center gap-3 transition-all duration-300",
          phase === "flood" ? "scale-75 opacity-0" : "scale-100 opacity-100"
        )}
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/15 ring-2 ring-white/40">
          <PartyPopper className="h-7 w-7" />
        </span>
        <p className="text-sm font-semibold tracking-wide">Welcome aboard</p>
      </div>
    </div>
  );
}
