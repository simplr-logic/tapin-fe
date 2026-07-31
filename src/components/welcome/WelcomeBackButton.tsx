"use client";

import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

export function WelcomeBackButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="h-auto -ml-2 mb-3 gap-1.5 px-2 py-1 text-xs font-medium text-ink-muted hover:text-ink"
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      Back
    </Button>
  );
}
