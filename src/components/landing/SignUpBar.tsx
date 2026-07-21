"use client";

import { AlertTriangle, Check } from "lucide-react";
import { useState } from "react";

import LandingWavePath from "@/components/landing/LandingWavePath";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default function SignUpBar() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/auth/magic-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });

    setLoading(false);

    if (res.status === 429) {
      setError("Too many requests for this email. Try again in a few minutes.");
      return;
    }
    if (!res.ok) {
      setError("Couldn't send the link. Check the email address and try again.");
      return;
    }
    setSent(true);
  }

  return (
    <section
      id="signup"
      className="relative scroll-mt-[4.5rem] border-t border-kale-hover bg-kale shadow-elevated"
      aria-labelledby="landing-signup-heading"
    >
      <div className="max-w-xl mx-auto px-4 md:px-6 py-14 md:py-16 text-center">
        <h2
          id="landing-signup-heading"
          className="text-2xl md:text-3xl font-bold text-white tracking-tight text-balance"
        >
          Start your story
        </h2>
        <p
          id="landing-signup-description"
          className="mt-3 text-sm md:text-base text-white/80 text-balance"
        >
          Sign up in seconds — no password, just your email.
        </p>

        <div className="mt-8">
          {sent ? (
            <div className="space-y-4" aria-live="polite">
              <LandingWavePath
                variant="accent"
                animate
                className="mx-auto h-4 max-w-xs opacity-90"
              />
              <div className="inline-flex items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-3 text-sm text-white">
                <Check className="w-4 h-4 text-success shrink-0" aria-hidden />
                Check <span className="font-semibold">{email}</span> for your sign-in link.
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="flex flex-col gap-2 text-left"
              aria-describedby="landing-signup-description"
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <Input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="h-11 flex-1 rounded-md border-garden-border-strong bg-white text-ink placeholder:text-ink-subtle"
                  aria-label="Email address"
                />
                <Button
                  type="submit"
                  disabled={loading || !email}
                  className={cn(
                    "h-11 shrink-0 rounded-md px-6 text-xs font-semibold uppercase tracking-wide",
                    "bg-white text-kale hover:bg-white/90"
                  )}
                >
                  {loading ? "Sending…" : "Start your story"}
                </Button>
              </div>
              {error ? (
                <p
                  role="alert"
                  className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-white"
                >
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-error" aria-hidden />
                  {error}
                </p>
              ) : (
                <p className="text-xs text-white/70 text-center sm:text-left">
                  No password — we&apos;ll email you a one-time link.
                </p>
              )}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
