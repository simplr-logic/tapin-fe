"use client";

import { CAREER_CHAPTERS } from "@/components/landing/landing-mock-data";
import {
  LANDING_WAVE_CAREER_PATH,
  LANDING_WAVE_CAREER_VIEWBOX,
} from "@/components/landing/landing-wave";
import { cn } from "@/lib/utils";

export default function LandingWorkLifeStoryTimeline() {
  return (
    <div className="w-full min-w-0">
      <div className="relative w-full">
        <div className="grid grid-cols-3 gap-2.5 sm:gap-3 md:gap-4">
          {CAREER_CHAPTERS.map((chapter) => {
            const isClosed = chapter.status === "closed";

            return (
              <div key={chapter.id} className="flex min-w-0 flex-col items-center">
                <div
                  className={cn(
                    "relative flex h-full w-full min-h-[5.5rem] flex-col justify-center rounded-lg border px-2.5 py-3 text-center sm:px-3 md:min-h-[6rem] md:px-4 md:py-4 transition-opacity duration-300",
                    isClosed
                      ? "border-garden-border bg-surface-2/70 opacity-70"
                      : "border-kale/25 bg-card shadow-card"
                  )}
                >
                  {isClosed ? (
                    <>
                      <span className="absolute top-2.5 left-2.5 h-3.5 w-0.5 rounded-full bg-garden-border-strong" />
                      <span className="absolute top-2.5 right-2.5 h-3.5 w-0.5 rounded-full bg-garden-border-strong" />
                      <span className="absolute bottom-2.5 left-2.5 right-2.5 h-px bg-garden-border-strong/80" />
                    </>
                  ) : null}
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted leading-snug break-words sm:text-[11px]">
                    {chapter.company}
                  </p>
                  <p className="mt-1 text-[11px] text-ink-subtle leading-snug sm:text-xs md:text-sm">
                    {chapter.period}
                  </p>
                  <p className="mt-1.5 text-[10px] font-medium text-ink-subtle sm:text-[11px]">
                    {isClosed ? "Closed" : "Current"}
                  </p>
                </div>

                <div className="w-px h-5 md:h-6 bg-link/35 shrink-0" aria-hidden />

                <div className="relative z-10 flex h-3 w-full items-center justify-center">
                  <span
                    className={cn(
                      "size-3 rounded-full border-2 border-card shadow-sm",
                      chapter.status === "current" ? "bg-link" : "bg-ink-subtle/80"
                    )}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <svg
          viewBox={LANDING_WAVE_CAREER_VIEWBOX}
          preserveAspectRatio="none"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-3 w-full overflow-visible text-link"
          aria-hidden
        >
          <path
            d={LANDING_WAVE_CAREER_PATH}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.2}
            strokeWidth={4}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={LANDING_WAVE_CAREER_PATH}
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
            className="landing-story-line-draw"
          />
        </svg>
      </div>

      <p className="sr-only">
        Horizontal career timeline with three employer chapters. Each chapter connects to a dot on a
        continuous curved line; closed chapters fade but your personal record continues.
      </p>
    </div>
  );
}
