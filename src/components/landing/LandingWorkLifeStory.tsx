import { landingContainerClass, landingSectionClass } from "@/components/landing/landing-ui";

export default function LandingWorkLifeStory() {
  return (
    <section id="story" className={landingSectionClass} aria-labelledby="landing-story-heading">
      <div className={landingContainerClass}>
        <div className="max-w-3xl mx-auto text-center md:text-left">
          <h2
            id="landing-story-heading"
            className="text-2xl md:text-3xl font-bold text-ink tracking-tight text-balance"
          >
            Companies come and go. Your story doesn&apos;t.
          </h2>
          <p className="mt-4 text-sm md:text-base text-ink-muted leading-relaxed text-balance">
            Every job you take becomes a chapter — but the record is yours. Tap through a role at
            one company, move to the next, and your history travels with you: every hour, every
            project, every streak. When employment ends, that company keeps its own records. You
            keep everything.
          </p>
          <p className="mt-4 text-sm text-ink-subtle italic text-balance">
            No account deletion, no starting over. Change jobs as many times as your career needs.
          </p>
        </div>
      </div>
    </section>
  );
}
