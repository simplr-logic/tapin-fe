import { landingContainerClass, landingSectionClass } from "@/components/landing/landing-ui";
import LandingTapDemo from "@/components/landing/LandingTapDemo";

export default function LandingCheckpoint() {
  return (
    <section className={landingSectionClass} aria-labelledby="landing-checkpoint-heading">
      <div className={landingContainerClass}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div>
            <h2
              id="landing-checkpoint-heading"
              className="text-2xl md:text-3xl font-bold text-ink tracking-tight text-balance"
            >
              Every tap is a checkpoint
            </h2>
            <p className="mt-4 text-sm md:text-base text-ink-muted leading-relaxed text-balance">
              No stopwatch to start. No form to fill. Tap a project, and it&apos;s logged —
              instantly, satisfyingly, done. Your brain doesn&apos;t file it as admin work. It files
              it as progress.
            </p>
          </div>

          <LandingTapDemo />
        </div>
      </div>
    </section>
  );
}
