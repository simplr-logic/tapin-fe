"use client";

import { AlertTriangle } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { LandingCard } from "@/components/landing/landing-ui";
import LandingBackground from "@/components/landing/LandingBackground";
import { AuthHeader } from "@/components/layout/AuthHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME } from "@/config/constants";

import { type Choice, WelcomeChoiceCards } from "./WelcomeChoiceCards";

export default function WelcomeChooserFlow({
  suggestedDisplayName,
}: {
  suggestedDisplayName?: string;
}) {
  const router = useRouter();
  const [choice, setChoice] = useState<Choice | null>(null);
  const [displayName, setDisplayName] = useState(suggestedDisplayName ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChoice(next: Choice) {
    if (next === "company") {
      router.push("/welcome/company");
      return;
    }
    setChoice(next);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const onboardingRes = await fetch("/me/onboarding/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: displayName.trim() }),
    });

    setLoading(false);

    if (!onboardingRes.ok) {
      setError("Couldn't save that. Try again.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <div className="relative min-h-screen flex flex-col bg-linear-to-b from-canvas to-kale-accent/18">
      <AuthHeader showLogout />
      <LandingBackground />

      <main className="relative z-10 flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <LandingCard className="p-6 md:p-7">
            <div className="flex flex-col items-center text-center">
              <Image
                src="/klong-logo-lockup.jpg"
                alt={APP_NAME}
                width={88}
                height={88}
                className="size-22 object-contain"
              />
            </div>

            <h1 className="mt-4 text-2xl font-bold text-ink tracking-tight text-center">
              {suggestedDisplayName
                ? `${suggestedDisplayName}, welcome to ${APP_NAME}`
                : `Welcome to ${APP_NAME}`}
            </h1>
            <p className="mt-1.5 text-sm text-ink-muted text-center">What brings you here today?</p>

            <WelcomeChoiceCards choice={choice} onSelect={handleChoice} />

            {choice === "invite" && (
              <div className="mt-5 space-y-3 text-center">
                <p className="text-xs text-ink-muted">
                  Look for an email from your company admin and open the invite link there.
                </p>
                <Button
                  type="button"
                  variant="link"
                  onClick={() => setChoice("solo")}
                  className="h-auto p-0 text-[11px] text-link hover:text-link-hover font-medium"
                >
                  I&apos;ll set up my own account instead
                </Button>
              </div>
            )}

            {choice === "solo" && (
              <form
                onSubmit={handleSubmit}
                className="mt-5 space-y-3 border-t border-garden-border pt-5"
              >
                {error && (
                  <div className="flex items-start gap-2 rounded-md bg-error/8 border border-error/25 px-3 py-2.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-error mt-0.5 shrink-0" />
                    <p className="text-xs text-error">{error}</p>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label
                    htmlFor="displayName"
                    className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide"
                  >
                    What should we call you?
                  </Label>
                  <Input
                    id="displayName"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Jane"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading || !displayName.trim()}
                  className="w-full h-11 rounded-md text-xs font-semibold uppercase tracking-wide focus-visible:ring-3 focus-visible:ring-link/50"
                >
                  {loading ? "Saving…" : "Continue"}
                </Button>
              </form>
            )}
          </LandingCard>
        </div>
      </main>
    </div>
  );
}
