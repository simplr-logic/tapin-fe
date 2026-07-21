import {
  LANDING_WAVE_CAREER_PATH,
  LANDING_WAVE_CAREER_VIEWBOX,
  LANDING_WAVE_DIVIDER_PATH,
} from "@/components/landing/landing-wave";
import { cn } from "@/lib/utils";

type LandingWavePathProps = {
  path?: string;
  viewBox?: string;
  /** Draw animation on mount or when `animate` class is applied. */
  animate?: boolean;
  /** Soft halo stroke behind the primary line. */
  glow?: boolean;
  className?: string;
  /** Thinner stroke for dividers and card accents. */
  variant?: "timeline" | "divider" | "accent";
};

const VIEWBOX_BY_VARIANT = {
  timeline: LANDING_WAVE_CAREER_VIEWBOX,
  divider: "0 0 960 32",
  accent: "0 0 960 24",
} as const;

export default function LandingWavePath({
  path,
  viewBox,
  animate = false,
  glow = true,
  className,
  variant = "divider",
}: LandingWavePathProps) {
  const d = path ?? (variant === "timeline" ? LANDING_WAVE_CAREER_PATH : LANDING_WAVE_DIVIDER_PATH);
  const box = viewBox ?? VIEWBOX_BY_VARIANT[variant];
  const primaryWidth = variant === "timeline" ? 3 : variant === "accent" ? 2 : 2.5;
  const glowWidth = variant === "timeline" ? 6 : 5;

  return (
    <svg
      viewBox={box}
      preserveAspectRatio="none"
      className={cn("w-full overflow-visible text-link", className)}
      aria-hidden
    >
      {glow ? (
        <path
          d={d}
          fill="none"
          stroke="currentColor"
          strokeOpacity={0.18}
          strokeWidth={glowWidth}
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      ) : null}
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={primaryWidth}
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
        className={cn(
          animate && variant === "timeline" && "landing-story-line-draw",
          animate && variant !== "timeline" && "landing-wave-divider-draw"
        )}
      />
    </svg>
  );
}
