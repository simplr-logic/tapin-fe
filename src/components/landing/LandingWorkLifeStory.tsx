import { landingContainerClass, landingSectionClass } from "@/components/landing/landing-ui";
import LandingWorkLifeStoryTimeline from "@/components/landing/LandingWorkLifeStoryTimeline";

export default function LandingWorkLifeStory() {
  return (
    <section id="story" className={landingSectionClass} aria-labelledby="landing-story-heading">
      <div className={landingContainerClass}>
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-x-12 gap-y-8 lg:items-start">
          <div className="order-2 lg:order-none min-w-0 lg:col-start-1 lg:row-start-1">
            <LandingWorkLifeStoryTimeline />
          </div>

          <div className="order-1 lg:order-none w-full min-w-[min(100%,18rem)] lg:col-start-2 lg:row-start-1">
            <h2
              id="landing-story-heading"
              className="text-2xl md:text-3xl font-bold text-ink tracking-tight text-pretty"
            >
              <span className="block">Companies come and go.</span>
              <span className="block">Your story doesn&apos;t.</span>
            </h2>
            <p className="mt-4 text-sm md:text-base text-ink-muted leading-relaxed">
              Every job you take becomes a chapter — but the record is yours. Tap through a role at
              one company, move to the next, and your history travels with you: every hour, every
              project, every streak. When employment ends, that company keeps its own records. You
              keep everything.
            </p>
            <p className="mt-4 text-sm text-ink-subtle italic leading-relaxed">
              No account deletion, no starting over. Change jobs as many times as your career needs.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
