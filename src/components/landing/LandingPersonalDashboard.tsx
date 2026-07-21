import { landingContainerClass, landingSectionClass } from "@/components/landing/landing-ui";

export default function LandingPersonalDashboard() {
  return (
    <section className={landingSectionClass} aria-labelledby="landing-dashboard-heading">
      <div className={landingContainerClass}>
        <div className="max-w-3xl mx-auto text-center md:text-left">
          <h2
            id="landing-dashboard-heading"
            className="text-2xl md:text-3xl font-bold text-ink tracking-tight text-balance"
          >
            Your work, seen the way you&apos;d want to see it.
          </h2>
          <p className="mt-4 text-sm md:text-base text-ink-muted leading-relaxed text-balance">
            Work streaks. Deep-work hours. Career milestones as they add up. The same taps that log
            your time also become a picture of how you actually work — for you first, not for a
            manager&apos;s report.
          </p>
        </div>
      </div>
    </section>
  );
}
