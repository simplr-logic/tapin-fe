"use client";

import { AlertTriangle, ArrowRight, CheckCircle2, Link2, Mail } from "lucide-react";
import Image from "next/image";
import { Suspense, useState } from "react";

import { LandingCard } from "@/components/landing/landing-ui";
import { AuthHeader } from "@/components/layout/AuthHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { APP_NAME } from "@/config/constants";

// callbackUrl is preserved for post-login UX but the gateway's magic-link
// callback redirects to a fixed configured path today (POST_LOGIN_REDIRECT_PATH)
// — deep-link return isn't wired through the backend yet.

const HOW_IT_WORKS = [
  {
    icon: Mail,
    title: "1. Enter your email",
    description: "We'll send a magic link to your inbox.",
  },
  {
    icon: Link2,
    title: "2. Click the link",
    description: "The link will log you in instantly.",
  },
  {
    icon: CheckCircle2,
    title: "3. You're in!",
    description: "No passwords. No hassle.",
  },
];

function LoginForm() {
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
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-canvas">
      <AuthHeader />
      <div
        aria-hidden
        className="absolute -top-[28rem] -right-[22rem] w-[52rem] h-[52rem] rounded-full bg-kale-accent/12"
      />
      <div
        aria-hidden
        className="absolute -bottom-[26rem] -left-[24rem] w-[50rem] h-[50rem] rounded-full bg-kale/10"
      />
      <div
        aria-hidden
        className="absolute -bottom-[30rem] -right-[26rem] w-[54rem] h-[54rem] rounded-full bg-link/12"
      />

      <main className="relative z-10 flex-1 flex flex-col items-center justify-center gap-4 p-4">
        <LandingCard className="relative w-full max-w-md p-8">
          <div className="flex flex-col items-center text-center">
            <Image
              src="/klong-logo-lockup.jpg"
              alt={APP_NAME}
              width={112}
              height={112}
              className="size-28 object-contain"
            />

            <h1 className="mt-4 text-2xl font-bold text-ink tracking-tight text-balance">
              Log in with Magic Link
            </h1>
            <p className="mt-2 text-sm text-ink-muted text-balance">
              We&apos;ll email you a secure link to log in to your account.
            </p>
          </div>

          {sent ? (
            <div className="mt-6 space-y-3 rounded-md bg-surface-2 border border-garden-border p-4 text-center">
              <div className="w-11 h-11 mx-auto rounded-md bg-link/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-link" />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">Check your inbox</p>
                <p className="text-xs text-ink-muted mt-1">
                  We sent a sign-in link to <span className="text-ink font-medium">{email}</span>.
                  Click it to continue — this tab will pick up your session automatically.
                </p>
              </div>
              <Button
                type="button"
                variant="link"
                onClick={() => setSent(false)}
                className="h-auto p-0 text-[11px] text-link hover:text-link-hover font-medium"
              >
                Use a different email
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && (
                <div className="flex items-start gap-2 rounded-md bg-error/8 border border-error/25 px-3 py-2.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-error mt-0.5 shrink-0" />
                  <p className="text-xs text-error">{error}</p>
                </div>
              )}

              <div className="space-y-1.5">
                <Label
                  htmlFor="email"
                  className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide"
                >
                  Work email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    required
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="h-11 pr-9"
                  />
                  <Mail className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-ink-subtle pointer-events-none" />
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading || !email}
                className="w-full h-11 gap-1.5 rounded-md text-xs font-semibold uppercase tracking-wide focus-visible:ring-3 focus-visible:ring-link/50"
              >
                {loading ? "Sending…" : "Send magic link"}
                {!loading && <ArrowRight className="size-3.5" />}
              </Button>
            </form>
          )}

          <div className="mt-7 flex items-center gap-3">
            <Separator className="flex-1" />
            <span className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide">
              How it works
            </span>
            <Separator className="flex-1" />
          </div>

          <div className="mt-5 grid grid-cols-3 gap-3">
            {HOW_IT_WORKS.map(({ icon: Icon, title, description }) => (
              <div key={title} className="text-center">
                <div className="w-10 h-10 mx-auto rounded-md flex items-center justify-center bg-primary/10 text-primary">
                  <Icon className="w-4 h-4" />
                </div>
                <p className="mt-2 text-[11px] font-semibold text-ink">{title}</p>
                <p className="mt-0.5 text-[10px] text-ink-subtle leading-snug">{description}</p>
              </div>
            ))}
          </div>
        </LandingCard>

        <p className="relative text-xs text-ink-subtle">
          Need help?{" "}
          <Button
            variant="link"
            render={<a href="mailto:support@klong.app" />}
            nativeButton={false}
            className="h-auto p-0 text-xs text-link hover:text-link-hover"
          >
            Contact support
          </Button>
        </p>
      </main>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
