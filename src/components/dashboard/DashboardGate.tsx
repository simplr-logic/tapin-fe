"use client";

import { LayoutDashboard } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { DashboardStats } from "@/components/dashboard/DashboardStats";
import WelcomeChooserFlow from "@/components/welcome/WelcomeChooserFlow";
import { WelcomeUnlockOverlay } from "@/components/welcome/WelcomeUnlockOverlay";
import { seedWelcomePending, useWelcomePending } from "@/hooks/useWelcomeGate";

export function DashboardGate({
  isNewAccount,
  hasOnboarded,
  suggestedDisplayName,
}: {
  isNewAccount: boolean;
  hasOnboarded: boolean;
  suggestedDisplayName?: string;
}) {
  const pending = useWelcomePending();
  // Kept mounted independently of `pending` — WelcomeUnlockOverlay flips the
  // gate mid-animation, and if it lived inside the pending-only branch it
  // would get unmounted (cutting its own reveal short) the instant pending
  // becomes false.
  const [unlocking, setUnlocking] = useState(false);
  const handleUnlock = useCallback(() => setUnlocking(true), []);
  const handleUnlockDone = useCallback(() => setUnlocking(false), []);

  useEffect(() => {
    if (isNewAccount) seedWelcomePending();
  }, [isNewAccount]);

  return (
    <>
      {pending ? (
        <WelcomeChooserFlow suggestedDisplayName={suggestedDisplayName} onUnlock={handleUnlock} />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-ink-muted text-xs font-medium tracking-wide">
            <LayoutDashboard className="w-3.5 h-3.5" />
            Dashboard
          </div>
          <DashboardStats hasOnboarded={hasOnboarded} />
        </div>
      )}
      {unlocking && <WelcomeUnlockOverlay onDone={handleUnlockDone} />}
    </>
  );
}
