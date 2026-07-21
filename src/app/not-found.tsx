"use client";

import { ArrowLeft, Compass, Home } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-canvas flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm text-center space-y-6">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-surface-2 border border-garden-border flex items-center justify-center">
            <Compass className="w-5 h-5 text-ink-subtle" />
          </div>
          <div>
            <p className="text-3xl font-bold text-ink tracking-tight">404</p>
            <p className="text-sm text-ink-muted mt-1">
              This page doesn&apos;t exist, or has moved.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            className="h-9 text-xs font-semibold gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go back
          </Button>
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            className="h-9 text-xs font-semibold gap-1.5"
          >
            <Home className="w-3.5 h-3.5" />
            Home
          </Button>
        </div>
      </div>
    </div>
  );
}
