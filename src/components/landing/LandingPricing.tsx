import { Check, User, Users } from "lucide-react";
import Link from "next/link";

import {
  LandingCard,
  landingContainerClass,
  landingSectionClass,
} from "@/components/landing/landing-ui";
import { Button } from "@/components/ui/button";
import { CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const INDIVIDUAL_FEATURES = [
  "Tap to log time",
  "Weekly roster",
  "Pomodoro timer",
  "Full history, every job",
  "Works everywhere",
] as const;

const COMPANY_FEATURES = [
  "Everything in Individual, for every teammate",
  "Admin dashboard",
  "Approvals & sign-off",
  "Company rollups",
  "No card required",
] as const;

const FAQ = [
  {
    question: "What happens after the 60-day trial?",
    answer:
      "If you haven't subscribed, your company automatically downgrades to individual free accounts — everyone keeps their own history and can keep logging time. You just lose admin/team features until you subscribe. Nothing is deleted, nothing is locked.",
  },
  {
    question: "Will I be charged automatically when the trial ends?",
    answer:
      "No. No card is required to start the trial, and there's no auto-charge — you choose to subscribe when you're ready.",
  },
  {
    question: "What will it cost after the trial?",
    answer:
      "We haven't finalized company pricing yet — we're piloting with early teams first so it reflects real usage. Trial companies get advance notice and preferred pricing before anything is ever charged.",
  },
] as const;

function PlanFeatureList({ items }: { items: readonly string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((item) => (
        <li key={item} className="flex items-start gap-2.5 text-sm text-ink-muted">
          <Check className="size-4 shrink-0 text-success mt-0.5" aria-hidden />
          <span className="leading-relaxed">{item}</span>
        </li>
      ))}
    </ul>
  );
}

type PricingPlanCardProps = {
  plan: "individual" | "company";
  priceTitle: string;
  priceSubtitle?: string;
  features: readonly string[];
  ctaLabel: string;
  ctaVariant?: "default" | "outline";
};

function PricingPlanCard({
  plan,
  priceTitle,
  priceSubtitle,
  features,
  ctaLabel,
  ctaVariant = "default",
}: PricingPlanCardProps) {
  const PlanIcon = plan === "individual" ? User : Users;
  const planLabel = plan === "individual" ? "Individual" : "Company";

  return (
    <LandingCard
      className={cn("flex h-full flex-col", plan === "company" && "border-kale/25 shadow-elevated")}
    >
      <CardHeader className="px-6 pt-6 pb-0">
        <div className="flex items-center gap-2.5">
          <span className="flex size-9 items-center justify-center rounded-md bg-surface-2">
            <PlanIcon className="size-4 text-kale" aria-hidden />
          </span>
          <p className="text-sm font-semibold uppercase tracking-wide text-ink">{planLabel}</p>
        </div>
        <div className="mt-4 min-h-16">
          <p className="text-2xl font-bold text-ink tracking-tight text-balance">{priceTitle}</p>
          {priceSubtitle ? (
            <p className="mt-1 text-sm text-ink-muted leading-relaxed">{priceSubtitle}</p>
          ) : (
            <p className="mt-1 text-sm text-ink-subtle invisible" aria-hidden>
              &nbsp;
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-1 flex-col px-6 pt-5 pb-0">
        <PlanFeatureList items={features} />
      </CardContent>

      <CardFooter className="mt-auto border-0 bg-transparent px-6 pb-6 pt-6">
        <Button
          render={<Link href="#signup" />}
          nativeButton={false}
          variant={ctaVariant}
          className="h-11 w-full rounded-md font-semibold uppercase tracking-wide text-xs"
        >
          {ctaLabel}
        </Button>
      </CardFooter>
    </LandingCard>
  );
}

export default function LandingPricing() {
  return (
    <section id="pricing" className={landingSectionClass} aria-labelledby="landing-pricing-heading">
      <div className={landingContainerClass}>
        <div className="mb-6 md:mb-8 text-center md:text-left">
          <h2
            id="landing-pricing-heading"
            className="text-2xl md:text-3xl font-bold text-ink tracking-tight text-balance"
          >
            Pricing
          </h2>
          <p className="mt-2 text-sm md:text-base text-ink-muted text-balance max-w-2xl">
            Free for individuals, always. Nothing breaks after 60 days.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 items-stretch">
          <PricingPlanCard
            plan="individual"
            priceTitle="Free — always"
            features={INDIVIDUAL_FEATURES}
            ctaLabel="Start clocking"
            ctaVariant="outline"
          />
          <PricingPlanCard
            plan="company"
            priceTitle="Free for 60 days"
            priceSubtitle="then simple per-seat pricing (TBA)"
            features={COMPANY_FEATURES}
            ctaLabel="Start your 60-day trial"
          />
        </div>

        <LandingCard className="mt-5">
          <CardContent className="px-5 py-4 text-center">
            <p className="text-sm text-ink-muted text-balance">
              No card required · Nothing breaks after 60 days · Cancel anytime
            </p>
          </CardContent>
        </LandingCard>

        <p className="mt-5 text-sm md:text-base text-ink-muted text-center text-balance leading-relaxed max-w-3xl mx-auto">
          If your company doesn&apos;t subscribe by day 60, nothing breaks — everyone on the team
          automatically keeps their free Individual plan, no lockout, no surprise charge.
        </p>

        <LandingCard className="mt-6">
          <CardContent className="px-6 md:px-8 py-6 md:py-8">
            <dl className="space-y-0">
              {FAQ.map(({ question, answer }, index) => (
                <div
                  key={question}
                  className={cn(index > 0 && "border-t border-garden-border pt-6 mt-6")}
                >
                  <dt className="text-base font-semibold text-ink tracking-tight leading-snug">
                    {question}
                  </dt>
                  <dd className="mt-2 text-sm text-ink-muted leading-relaxed break-words">
                    {answer}
                  </dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </LandingCard>
      </div>
    </section>
  );
}
