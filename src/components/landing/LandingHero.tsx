import Link from "next/link";

import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/config/constants";

export default function LandingHero() {
  return (
    <section className="pt-12 md:pt-16 pb-8 px-4 md:px-6" aria-labelledby="landing-hero-heading">
      <div className="relative max-w-3xl mx-auto text-center">
        <p className="text-sm md:text-base font-medium text-ink-muted tracking-wide text-balance">
          Your career is bigger than your current job.
        </p>
        <h1
          id="landing-hero-heading"
          className="mt-4 text-4xl md:text-6xl font-bold text-ink tracking-tight text-balance"
        >
          Every tap is a line in your career story.
        </h1>
        <p className="mt-5 text-base md:text-lg text-ink-muted max-w-xl mx-auto text-balance leading-relaxed">
          {APP_NAME} logs your work the moment it happens — one tap, no stopwatch, no form. It stays
          with you for as long as you work, across every job you&apos;ll ever have.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            render={<Link href="#signup" />}
            nativeButton={false}
            className="h-11 min-w-44 rounded-md px-6 text-xs font-semibold uppercase tracking-wide"
          >
            Start your story
          </Button>
          <Button
            render={<Link href="#companies" />}
            nativeButton={false}
            variant="outline"
            className="h-11 min-w-44 rounded-md px-6 text-xs font-semibold uppercase tracking-wide"
          >
            For teams
          </Button>
        </div>
      </div>
    </section>
  );
}
