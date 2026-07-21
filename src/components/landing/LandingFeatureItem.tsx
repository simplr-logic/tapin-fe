"use client";

import { useCallback, useState } from "react";

import { cn } from "@/lib/utils";

import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";

type LandingFeatureItemProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  rotate: number;
  delay: string;
  duration: string;
  featured?: boolean;
};

export default function LandingFeatureItem({
  icon: Icon,
  title,
  description,
  rotate,
  delay,
  duration,
  featured = false,
}: LandingFeatureItemProps) {
  const [tapping, setTapping] = useState(false);

  const handleTap = useCallback(() => {
    setTapping(true);
  }, []);

  const handleTapEnd = useCallback(() => {
    setTapping(false);
  }, []);

  return (
    <div
      className="animate-landing-float text-left max-w-sm"
      style={
        {
          "--landing-tilt": `${rotate}deg`,
          animationDelay: delay,
          animationDuration: duration,
        } as CSSProperties
      }
    >
      <button
        type="button"
        onClick={handleTap}
        className="group w-full rounded-lg text-left outline-none focus-visible:ring-3 focus-visible:ring-link/50"
      >
        <span
          onAnimationEnd={handleTapEnd}
          className={cn(
            "inline-flex items-center justify-center rounded-md bg-surface-2/80 transition-colors duration-200",
            featured ? "size-16" : "size-14",
            tapping && "landing-feature-tap",
            !tapping && "group-hover:bg-surface-2"
          )}
        >
          <Icon
            className={cn(
              "transition-colors duration-200",
              featured ? "size-9" : "size-8",
              tapping ? "text-link landing-feature-icon-glow" : "text-kale"
            )}
            aria-hidden
          />
        </span>
        <p
          className={cn(
            "mt-3 font-semibold tracking-tight text-balance",
            featured ? "text-xl md:text-2xl" : "text-lg md:text-xl",
            tapping ? "landing-feature-text-glow landing-feature-title-glow" : "text-ink"
          )}
        >
          {title}
        </p>
        <p
          className={cn(
            "mt-2 text-sm leading-relaxed text-balance",
            tapping ? "landing-feature-text-glow landing-feature-desc-glow" : "text-ink-muted"
          )}
        >
          {description}
        </p>
      </button>
    </div>
  );
}
