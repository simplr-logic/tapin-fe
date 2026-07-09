"use client";

import { AlertTriangle, Timer } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { Suspense, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("demo@tapin.app");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-kale flex items-center justify-center shadow-card">
            <Timer className="w-5 h-5 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-lg font-semibold text-ink tracking-tight">Sign in to TapIn</h1>
            <p className="text-xs text-ink-muted mt-1">Time Tracker &amp; Attendance Ledger</p>
          </div>
        </div>

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

          <div className="space-y-1.5">
            <Label
              htmlFor="password"
              className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide"
            >
              Password
            </Label>
            <Input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full h-9 text-xs font-semibold uppercase tracking-wide"
          >
            {loading ? "Signing in…" : "Sign In"}
          </Button>

          <div className="rounded-md bg-surface-2 border border-garden-border px-3 py-2.5">
            <p className="text-[10px] text-ink-subtle leading-relaxed">
              <span className="font-semibold text-ink-muted">Demo mode</span> — no backend yet. Use{" "}
              <code className="font-mono text-ink">demo@tapin.app</code> /{" "}
              <code className="font-mono text-ink">demo1234</code>.
            </p>
          </div>
        </form>
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
