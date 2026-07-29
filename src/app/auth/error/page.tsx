import { AlertTriangle } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const REASON_MESSAGES: Record<string, string> = {
  invalid_callback: "That sign-in link is missing some required information.",
  auth_failed: "We couldn't verify that sign-in link.",
};

const DEFAULT_MESSAGE = "Something went wrong completing sign-in.";

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const message = (reason && REASON_MESSAGES[reason]) || DEFAULT_MESSAGE;

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-error/8 border border-error/25 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-error" />
          </div>
          <div>
            <p className="text-lg font-semibold text-ink tracking-tight">Sign-in failed</p>
            <p className="text-sm text-ink-muted mt-1">{message}</p>
          </div>
        </div>

        <p className="text-xs text-ink-subtle">
          Sign-in links expire after a while and can only be used once — request a fresh one and try
          again.
        </p>

        <Button
          render={<Link href="/login" />}
          nativeButton={false}
          className="h-9 text-xs font-semibold"
        >
          Back to sign in
        </Button>
      </div>
    </div>
  );
}
