"use client";

import { MousePointerClick, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { LandingCard } from "@/components/landing/landing-ui";
import LandingBackground from "@/components/landing/LandingBackground";
import { AuthHeader } from "@/components/layout/AuthHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

// A tiny interactive tutorial instead of a form: confirm your name, then
// tap a fake "Practice project" tile the same way the real weekly roster
// tiles work (ProjectGridTile's tap-to-log-an-hour interaction) so the
// first real tap on the dashboard isn't the first time you've seen it.
// No "Continue" button after tapping — it just moves on, same as the
// reference flow this was modeled on.
export default function OnboardingIntroFlow({
  suggestedDisplayName,
  isNewAccount = false,
}: {
  suggestedDisplayName?: string;
  isNewAccount?: boolean;
}) {
  const router = useRouter();
  const [name, setName] = useState(suggestedDisplayName ?? "");
  const [editingName, setEditingName] = useState(false);
  const [tapped, setTapped] = useState(false);

  async function handleTap() {
    if (tapped) return;
    setTapped(true);

    await fetch("/me/onboarding/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: name.trim() || "there" }),
    });

    setTimeout(
      () => router.push(isNewAccount ? "/dashboard?is_new_account=1" : "/dashboard"),
      1400
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-linear-to-b from-canvas to-kale-accent/18">
      <AuthHeader showLogout />
      <LandingBackground />

      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <LandingCard className="w-full max-w-md p-8">
          <div className="flex items-center gap-2">
            {editingName ? (
              <Input
                autoFocus
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => setEditingName(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
                placeholder="Your name"
                className="h-auto px-2 py-1 text-2xl font-bold"
              />
            ) : (
              <h1 className="text-2xl font-bold text-ink tracking-tight">
                Hey {name.trim() || "there"}
              </h1>
            )}
            {!tapped && !editingName && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => setEditingName(true)}
                aria-label="Edit your name"
              >
                <Pencil className="w-3.5 h-3.5 text-ink-subtle" />
              </Button>
            )}
          </div>
          {!editingName && !tapped && (
            <p className="mt-1 text-xs text-ink-subtle">
              Guessed from your email — tap the pencil to fix it
            </p>
          )}

          {!tapped ? (
            <>
              <p className="mt-6 text-sm text-ink-muted">One tap = one hour. Try it out.</p>
              <Button
                type="button"
                variant="outline"
                onClick={handleTap}
                className="mt-3 h-auto w-full flex-col gap-3 rounded-lg border-2 border-dashed border-garden-border-strong bg-transparent p-6 hover:border-link hover:bg-link/5"
              >
                <span className="text-sm font-semibold text-ink">Practice project</span>
                <span className="flex size-16 items-center justify-center rounded-xl bg-surface-2">
                  <MousePointerClick className="size-6 text-ink-subtle" />
                </span>
                <span className="text-xs font-normal text-ink-subtle">
                  Tap the card to feel how it works
                </span>
              </Button>
            </>
          ) : (
            <div
              className={cn(
                "mt-6 flex flex-col items-center gap-3 rounded-lg border p-6",
                "border-link/30 bg-link/10"
              )}
            >
              <span className="text-sm font-semibold text-link">Practice project</span>
              <span className="flex size-16 items-center justify-center rounded-xl bg-card shadow-card">
                <span className="text-sm font-bold text-link">+1 hr</span>
              </span>
              <span className="text-xs font-medium text-link">Nice — that&apos;s the idea</span>
            </div>
          )}
        </LandingCard>
      </main>
    </div>
  );
}
