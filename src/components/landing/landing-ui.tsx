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

export const landingSectionClass = "relative px-4 md:px-6 py-12 md:py-16 scroll-mt-16";

export const landingContainerClass = "max-w-6xl mx-auto";
