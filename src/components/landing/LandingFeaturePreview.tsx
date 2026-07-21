import { cn } from "@/lib/utils";

type LandingFeaturePreviewProps = {
  type: "tap" | "treemap";
  active?: boolean;
};

export default function LandingFeaturePreview({
  type,
  active = false,
}: LandingFeaturePreviewProps) {
  if (type === "tap") {
    return (
      <span className="relative flex size-full items-center justify-center" aria-hidden>
        <span
          className={cn(
            "size-6 rounded-full border-2 transition-colors duration-200",
            active ? "border-link bg-link/20" : "border-link/35 bg-link/10"
          )}
        />
        <span className="absolute size-3 rounded-full bg-link" />
      </span>
    );
  }

  return (
    <span className="grid size-full grid-cols-2 grid-rows-2 gap-0.5 p-1.5" aria-hidden>
      <span className="rounded-sm bg-success/25 border border-success/30" />
      <span className="rounded-sm bg-yellow/20 border border-yellow/25" />
      <span className="rounded-sm bg-yellow/12 border border-yellow/18" />
      <span className="rounded-sm bg-surface-3 border border-garden-border" />
    </span>
  );
}
