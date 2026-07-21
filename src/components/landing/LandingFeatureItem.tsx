"use client";

import { useCallback, useState, useSyncExternalStore } from "react";

import {
  getReducedMotionServerSnapshot,
  getReducedMotionSnapshot,
  subscribeReducedMotion,
} from "@/components/landing/landing-motion";
import LandingFeaturePreview from "@/components/landing/LandingFeaturePreview";
import LandingTapRipple from "@/components/landing/LandingTapRipple";
import { cn } from "@/lib/utils";

import type { LucideIcon } from "lucide-react";
import type { CSSProperties } from "react";

type FeaturePreview = "tap" | "treemap";

type FeatureIconTone = "link" | "success" | "warning" | "accent" | "open";

const ICON_TONE_CLASSES: Record<FeatureIconTone, { box: string; boxHover: string; icon: string }> =
  {
    link: {
      box: "bg-link/10",
      boxHover: "group-hover:bg-link/15",
      icon: "text-link",
    },
    success: {
      box: "bg-success/10",
      boxHover: "group-hover:bg-success/15",
      icon: "text-success",
    },
    warning: {
      box: "bg-warning/10",
      boxHover: "group-hover:bg-warning/15",
      icon: "text-warning",
    },
    accent: {
      box: "bg-kale-accent/12",
      boxHover: "group-hover:bg-kale-accent/18",
      icon: "text-kale-accent",
    },
    open: {
      box: "bg-open/10",
      boxHover: "group-hover:bg-open/15",
      icon: "text-open",
    },
  };

type LandingFeatureItemProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  rotate: number;
  delay: string;
  duration: string;
  featured?: boolean;
  preview?: FeaturePreview;
  iconTone?: FeatureIconTone;
};

export default function LandingFeatureItem({
  icon: Icon,
  title,
  description,
  rotate,
  delay,
  duration,
  featured = false,
  preview,
  iconTone = "link",
}: LandingFeatureItemProps) {
  const [tapping, setTapping] = useState(false);
  const [ripples, setRipples] = useState<{ id: number }[]>([]);

  const reducedMotion = useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  const handleTap = useCallback(() => {
    setTapping(true);
    if (!reducedMotion) {
      setRipples((current) => [...current, { id: Date.now() }]);
    }
  }, [reducedMotion]);

  const handleTapEnd = useCallback(() => {
    setTapping(false);
  }, []);

  const handleRippleEnd = useCallback((id: number) => {
    setRipples((current) => current.filter((ripple) => ripple.id !== id));
  }, []);

  const iconSize = featured ? "size-16" : "size-14";
  const rippleSize = featured ? "size-16" : "size-14";
  const tone = ICON_TONE_CLASSES[iconTone];

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
        <span className="relative inline-flex">
          <span
            onAnimationEnd={handleTapEnd}
            className={cn(
              "relative inline-flex items-center justify-center rounded-md transition-colors duration-200 overflow-hidden",
              iconSize,
              tone.box,
              tone.boxHover,
              tapping && "landing-feature-tap"
            )}
          >
            {preview ? (
              <LandingFeaturePreview type={preview} active={tapping} />
            ) : (
              <Icon
                className={cn(
                  "transition-colors duration-200",
                  featured ? "size-9" : "size-8",
                  tapping ? cn(tone.icon, "landing-feature-icon-glow") : tone.icon
                )}
                aria-hidden
              />
            )}
            {!reducedMotion ? (
              <LandingTapRipple
                ripples={ripples}
                onEnd={handleRippleEnd}
                className={cn(rippleSize)}
              />
            ) : null}
          </span>
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
