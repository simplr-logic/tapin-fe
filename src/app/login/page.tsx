"use client";

import { AlertTriangle, Mail, Timer } from "lucide-react";
import { Suspense, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// callbackUrl is preserved for post-login UX but the gateway's magic-link
// callback redirects to a fixed configured path today (POST_LOGIN_REDIRECT_PATH)
// — deep-link return isn't wired through the backend yet.

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
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-kale flex items-center justify-center shadow-card">
            <Timer className="w-5 h-5 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-ink tracking-tight">Sign in to Klong</h1>
            <p className="text-xs text-ink-muted mt-1">Time Tracker &amp; Attendance Ledger</p>
          </div>
        </div>

        {sent ? (
          <div className="bg-white rounded-lg border border-garden-border shadow-card p-6 space-y-3 text-center">
            <div className="w-10 h-10 mx-auto rounded-full bg-link/10 flex items-center justify-center">
              <Mail className="w-4.5 h-4.5 text-link" />
            </div>
            <div>
              <p className="text-sm font-semibold text-ink">Check your inbox</p>
              <p className="text-xs text-ink-muted mt-1">
                We sent a sign-in link to <span className="text-ink font-medium">{email}</span>.
                Click it to continue — this tab will pick up your session automatically.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="text-[11px] text-link hover:text-link-hover font-medium"
            >
              Use a different email
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg border border-garden-border shadow-card p-6 space-y-4"
          >
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
                Email
              </Label>
              <Input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
              />
            </div>

            <Button
              type="submit"
              disabled={loading || !email}
              className="w-full h-9 text-xs font-semibold uppercase tracking-wide"
            >
              {loading ? "Sending…" : "Send sign-in link"}
            </Button>

            <p className="text-[10px] text-ink-subtle leading-relaxed text-center">
              No password needed — we&apos;ll email you a one-time link.
            </p>
          </form>
        )}
      </div>
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
