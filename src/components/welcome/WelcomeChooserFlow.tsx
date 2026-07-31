"use client";

import Image from "next/image";
import { useState } from "react";

import { LandingCard } from "@/components/landing/landing-ui";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/config/constants";

import { CompanySetupForm } from "./CompanySetupForm";
import { UnlockAppButton } from "./UnlockAppButton";
import { type Choice, WelcomeChoiceCards } from "./WelcomeChoiceCards";

// Rendered inline inside DashboardGate (src/components/dashboard/DashboardGate.tsx)
// while welcome setup is pending — not a standalone route anymore, so no page
// chrome (AuthHeader/background) and no router navigation. Only "company" is
// a separate multi-step screen (CompanySetupForm owns its own Details/Confirm
// stepper) — invite/solo just reveal their content below the choice cards on
// the same screen, same as before that change. Display name is already known
// by this point (OnboardingIntroFlow collects and saves it before this ever
// renders), so no screen here asks for it again.
export default function WelcomeChooserFlow({
  suggestedDisplayName,
  onUnlock,
}: {
  suggestedDisplayName?: string;
  onUnlock: () => void;
}) {
  const [choice, setChoice] = useState<Choice | null>(null);

  if (choice === "company") {
    return (
      <div className="w-full max-w-md mx-auto">
        <LandingCard className="p-6 md:p-7">
          <CompanySetupForm onBack={() => setChoice(null)} onCreated={onUnlock} />
        </LandingCard>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
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

        <WelcomeChoiceCards choice={choice} onSelect={setChoice} />

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
          <div className="mt-5 flex flex-col items-center gap-4 border-t border-garden-border pt-5 text-center">
            <p className="text-xs text-ink-muted">
              You&apos;re all set to track your own time and projects.
            </p>
            <UnlockAppButton onClick={onUnlock} />
          </div>
        )}
      </LandingCard>
    </div>
  );
}
