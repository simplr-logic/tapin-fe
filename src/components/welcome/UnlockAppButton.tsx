"use client";

import { Lock } from "lucide-react";

import { Button } from "@/components/ui/button";

// Trigger only — WelcomeUnlockOverlay owns the actual flood/reveal
// animation and the completeWelcome() call, mounted by the parent
// (DashboardGate) so it survives the pending -> not-pending swap underneath.
export function UnlockAppButton({
  label = "Enter Klong",
  onClick,
}: {
  label?: string;
  onClick: () => void;
}) {
  return (
    <Button
      type="button"
      onClick={onClick}
      className="h-11 gap-2 rounded-md px-6 text-xs font-semibold tracking-wide"
    >
      <Lock className="w-4 h-4" />
      {label}
    </Button>
  );
}
