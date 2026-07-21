import { BarChart3, CalendarClock, Workflow } from "lucide-react";
import Link from "next/link";

import {
  LandingCard,
  landingContainerClass,
  landingSectionClass,
} from "@/components/landing/landing-ui";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

import type { LucideIcon } from "lucide-react";

type TeamFeature = {
  icon: LucideIcon;
  iconClassName: string;
  iconBoxClassName: string;
  title: string;
  description: string;
};

const TEAM_FEATURES: TeamFeature[] = [
  {
    icon: CalendarClock,
    iconBoxClassName: "bg-link/10",
    iconClassName: "text-link",
    title: "Sign off timesheets in seconds",
    description: "Monthly snapshots roll up automatically — review, sign off, done.",
  },
  {
    icon: Workflow,
    iconBoxClassName: "bg-kale-accent/12",
    iconClassName: "text-kale-accent",
    title: "Approvals that never bottleneck the team",
    description:
      "Managers review and approve on their own schedule — but your team never waits on them. Submitting a period is enough to unblock the next one, so a slow approval never becomes a slow team.",
  },
  {
    icon: BarChart3,
    iconBoxClassName: "bg-success/10",
    iconClassName: "text-success",
    title: "See where your team's hours go",
    description:
      'A live rollup of hours by project and by person — the same picture "sign-off" gives you, but available any day you want to check in, not just at period end.',
  },
];

export default function LandingForCompanies() {
  return (
    <section
      id="companies"
      className={cn(landingSectionClass, "bg-surface-2")}
      aria-labelledby="landing-companies-heading"
    >
      <div className={landingContainerClass}>
        <div className="mx-auto w-full max-w-3xl text-center">
          <h2
            id="landing-companies-heading"
            className="text-2xl md:text-3xl font-bold text-ink tracking-tight text-pretty"
          >
            Cleaner data, because people actually want to tap.
          </h2>
          <p className="mt-4 text-sm md:text-base text-ink-muted leading-relaxed">
            Most time-tracking tools get fought against — employees game them, forget them, or
            resent them. Klong flips that: because logging time is something your people actually
            want to do for themselves, you get more accurate, more complete records without policing
            anyone. Add approvals, sign-off, and company rollups on top, whenever you&apos;re ready.
          </p>
        </div>

        <ul className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5 list-none p-0 m-0">
          {TEAM_FEATURES.map(
            ({ icon: Icon, iconBoxClassName, iconClassName, title, description }) => (
              <li key={title} className="min-w-0">
                <LandingCard className="h-full">
                  <CardContent className="flex h-full flex-col items-center px-5 py-6 text-center md:px-6 md:py-7">
                    <span
                      className={cn(
                        "flex size-12 shrink-0 items-center justify-center rounded-md",
                        iconBoxClassName
                      )}
                    >
                      <Icon className={cn("size-6", iconClassName)} aria-hidden />
                    </span>
                    <h3 className="mt-4 text-base font-semibold text-ink tracking-tight text-balance md:text-lg">
                      {title}
                    </h3>
                    <p className="mt-2 text-sm text-ink-muted leading-relaxed">{description}</p>
                  </CardContent>
                </LandingCard>
              </li>
            )
          )}
        </ul>

        <div className="mt-8 flex justify-center">
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
