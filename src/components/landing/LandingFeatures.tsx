"use client";

import { Layers, LayoutGrid, ShieldCheck, Smartphone, Timer as TimerIcon, Zap } from "lucide-react";

import LandingFeatureItem from "@/components/landing/LandingFeatureItem";

const FEATURES = [
  {
    icon: Zap,
    preview: "tap" as const,
    iconTone: "link" as const,
    title: "Tap to log time",
    description: "30 minutes, an hour, or two — one tap, no stopwatch, no manual entry.",
    rotate: -1.5,
    delay: "0s",
    duration: "5s",
    featured: true,
  },
  {
    icon: LayoutGrid,
    preview: "treemap" as const,
    iconTone: "success" as const,
    title: "See your story take shape",
    description:
      "A live treemap sized by hours logged, so you see where your week — and your career — went.",
    rotate: 1.2,
    delay: "0.5s",
    duration: "5.5s",
    featured: false,
  },
  {
    icon: TimerIcon,
    iconTone: "warning" as const,
    title: "Built-in Pomodoro focus timer",
    description: "Work in focused sprints with automatic breaks, next to the ledger.",
    rotate: -1.1,
    delay: "1s",
    duration: "6s",
    featured: false,
  },
  {
    icon: ShieldCheck,
    iconTone: "accent" as const,
    title: "Audit-ready, and yours",
    description:
      "Every log entry keeps its own immutable record — proof for an employer if they need it, a permanent record for you either way.",
    rotate: -0.9,
    delay: "1.25s",
    duration: "5.8s",
    featured: false,
  },
  {
    icon: Smartphone,
    iconTone: "link" as const,
    title: "Works everywhere",
    description: "Desktop or mobile, same ledger, same tap-to-log flow.",
    rotate: 1.4,
    delay: "0.75s",
    duration: "5.2s",
    featured: false,
  },
  {
    icon: Layers,
    iconTone: "open" as const,
    title: "See your whole career, in one view",
    description:
      "Every job, every personal project, one unified breakdown — filter by date, by employer, or see it all at once. Nobody else gets this view. It's yours alone.",
    rotate: 0.6,
    delay: "1.5s",
    duration: "5.6s",
    featured: false,
  },
] as const;

export default function LandingFeatures() {
  return (
    <section
      className="relative py-10 md:py-12 px-4 md:px-6"
      aria-labelledby="landing-features-heading"
    >
      <div className="max-w-6xl mx-auto">
        <h2 id="landing-features-heading" className="sr-only">
          Features
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10 md:gap-x-10 md:gap-y-12 list-none p-0 m-0">
          {FEATURES.map((feature) => (
            <li key={feature.title}>
              <LandingFeatureItem {...feature} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
