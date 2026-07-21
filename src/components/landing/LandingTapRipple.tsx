import { cn } from "@/lib/utils";

type LandingTapRippleProps = {
  ripples: readonly { id: number }[];
  onEnd: (id: number) => void;
  className?: string;
};

export default function LandingTapRipple({ ripples, onEnd, className }: LandingTapRippleProps) {
  return (
    <>
      {ripples.map((ripple) => (
        <span
          key={ripple.id}
          aria-hidden
          className={cn(
            "landing-hero-ripple pointer-events-none absolute left-1/2 top-1/2 rounded-lg border-2 border-link/40",
            className
          )}
          onAnimationEnd={() => onEnd(ripple.id)}
        />
      ))}
    </>
  );
}
