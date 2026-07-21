import { landingContainerClass, landingSectionClass } from "@/components/landing/landing-ui";
import LandingTreemapPreview from "@/components/landing/LandingTreemapPreview";

export default function LandingPersonalDashboard() {
  return (
    <section className={landingSectionClass} aria-labelledby="landing-dashboard-heading">
      <div className={landingContainerClass}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          <div className="order-2 lg:order-1">
            <LandingTreemapPreview />
          </div>

          <div className="order-1 lg:order-2">
            <h2
              id="landing-dashboard-heading"
              className="text-2xl md:text-3xl font-bold text-ink tracking-tight text-balance"
            >
              Your work, seen the way you&apos;d want to see it.
            </h2>
            <p className="mt-4 text-sm md:text-base text-ink-muted leading-relaxed text-balance">
              Work streaks. Deep-work hours. Career milestones as they add up. The same taps that
              log your time also become a picture of how you actually work — for you first, not for
              a manager&apos;s report.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
