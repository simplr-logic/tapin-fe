import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { ComponentProps } from "react";

type LandingCardProps = ComponentProps<typeof Card>;

/** White surface card for pricing / FAQ blocks on the gradient canvas. */
export function LandingCard({ className, ...props }: LandingCardProps) {
  return (
    <Card
      className={cn(
        "rounded-lg border border-garden-border bg-card shadow-card ring-0 gap-0 overflow-visible py-0",
        className
      )}
      {...props}
    />
  );
}

/** Offset anchored sections below the sticky landing header (up to 4.5rem tall). */
export const landingSectionClass = "relative px-4 md:px-6 py-12 md:py-16 scroll-mt-[4.5rem]";

export const landingContainerClass = "max-w-6xl mx-auto";

export const landingNavLinkClass = cn(
  "rounded-md px-3 py-2 min-h-11 inline-flex items-center font-medium",
  "text-ink-muted hover:text-ink hover:bg-surface-2 transition-colors duration-100",
  "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-link/50"
);

export const landingSkipLinkClass = cn(
  "sr-only focus:not-sr-only focus:fixed focus:z-[100] focus:top-4 focus:left-4",
  "rounded-md bg-card px-4 py-2.5 text-sm font-semibold text-ink shadow-elevated",
  "focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-link/50"
);
