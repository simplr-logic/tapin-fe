import { CalendarClock } from "lucide-react";
import Link from "next/link";

import {
  LandingCard,
  landingContainerClass,
  landingSectionClass,
} from "@/components/landing/landing-ui";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";

export default function LandingForCompanies() {
  return (
    <section
      id="companies"
      className={landingSectionClass}
      aria-labelledby="landing-companies-heading"
    >
      <div className={landingContainerClass}>
        <div className="max-w-3xl">
          <h2
            id="landing-companies-heading"
            className="text-2xl md:text-3xl font-bold text-ink tracking-tight text-balance"
          >
            Cleaner data, because people actually want to tap.
          </h2>
          <p className="mt-4 text-sm md:text-base text-ink-muted leading-relaxed text-balance">
            Most time-tracking tools get fought against — employees game them, forget them, or
            resent them. Klong flips that: because logging time is something your people actually
            want to do for themselves, you get more accurate, more complete records without policing
            anyone. Add approvals, sign-off, and company rollups on top, whenever you&apos;re ready.
          </p>
        </div>

        <LandingCard className="mt-8 max-w-2xl">
          <CardContent className="flex gap-4 px-6 py-5">
            <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-surface-2">
              <CalendarClock className="size-6 text-kale" aria-hidden />
            </span>
            <div>
              <h3 className="text-lg font-semibold text-ink tracking-tight">
                Sign off timesheets in seconds
              </h3>
              <p className="mt-1.5 text-sm text-ink-muted leading-relaxed">
                Monthly snapshots roll up automatically — review, sign off, done.
              </p>
            </div>
          </CardContent>
        </LandingCard>

        <div className="mt-8">
          <Button
            render={<Link href="#signup" />}
            nativeButton={false}
            variant="outline"
            className="h-11 rounded-md px-6 text-xs font-semibold uppercase tracking-wide"
          >
            Set up your company
          </Button>
        </div>
      </div>
    </section>
  );
}
