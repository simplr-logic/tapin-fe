"use client";

import { AlertTriangle, Check } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <section className="relative px-4 md:px-6 py-20">
      <div className="max-w-md mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-bold text-ink tracking-tight text-balance">
          Ready to get started?
        </h2>
        <p className="mt-2 text-sm text-ink-muted text-balance">
          Sign up in seconds — no password, just your email.
        </p>

        <div className="mt-7">
          {sent ? (
            <div className="flex items-center justify-center gap-2 text-sm text-ink py-1.5">
              <Check className="w-4 h-4 text-success shrink-0" />
              Check <span className="font-medium">{email}</span> for your sign-in link.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2">
                <Input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="flex-1 bg-white"
                  aria-label="Email address"
                />
                <Button
                  type="submit"
                  disabled={loading || !email}
                  className="h-9 px-5 text-xs font-semibold uppercase tracking-wide shrink-0"
                >
                  {loading ? "Sending…" : "Sign up"}
                </Button>
              </div>
              {error ? (
                <p className="flex items-center gap-1.5 text-[11px] text-error">
                  <AlertTriangle className="w-3 h-3 shrink-0" />
                  {error}
                </p>
              ) : (
                <p className="text-[11px] text-ink-subtle">
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
