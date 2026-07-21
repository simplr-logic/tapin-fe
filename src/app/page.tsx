import {
  CalendarClock,
  LayoutGrid,
  ShieldCheck,
  Smartphone,
  Timer as TimerIcon,
  Zap,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import SignUpBar from "@/components/landing/SignUpBar";
import { APP_NAME } from "@/config/constants";

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${APP_NAME} — Time tracking, without the timesheet dread`,
};

const FEATURES = [
  {
    icon: Zap,
    title: "Tap to log time",
    description: "30 minutes, an hour, or two — one tap, no stopwatch, no manual entry.",
    rotate: "-rotate-2",
    delay: "0s",
    duration: "5s",
  },
  {
    icon: LayoutGrid,
    title: "Weekly roster at a glance",
    description: "A live treemap sized by hours logged, so you see where the week went.",
    rotate: "rotate-1",
    delay: "0.6s",
    duration: "6s",
  },
  {
    icon: CalendarClock,
    title: "Sign off timesheets in seconds",
    description: "Monthly snapshots roll up automatically — review, sign off, done.",
    rotate: "rotate-2",
    delay: "1.2s",
    duration: "5.5s",
  },
  {
    icon: TimerIcon,
    title: "Built-in Pomodoro focus timer",
    description: "Work in focused sprints with automatic breaks, next to the ledger.",
    rotate: "-rotate-1",
    delay: "1.8s",
    duration: "6.5s",
  },
  {
    icon: Smartphone,
    title: "Works everywhere",
    description: "Desktop or mobile, same ledger, same tap-to-log flow.",
    rotate: "rotate-3",
    delay: "0.9s",
    duration: "5.8s",
  },
  {
    icon: ShieldCheck,
    title: "Audit-ready history",
    description: "Every log entry keeps its own immutable record of who, what, when.",
    rotate: "-rotate-3",
    delay: "1.5s",
    duration: "6.2s",
  },
];

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col overflow-hidden bg-linear-to-b from-canvas from-0% via-kale/30 via-100%">
      <div
        aria-hidden
        className="animate-float-slow absolute -top-16 -left-20 w-80 h-80 rounded-full bg-link/15 blur-3xl"
      />
      <div
        aria-hidden
        className="animate-float-slow absolute top-10 -right-20 w-96 h-96 rounded-full bg-kale/10 blur-3xl"
        style={{ animationDelay: "2s" }}
      />
      <div
        aria-hidden
        className="animate-float absolute top-112 left-1/4 w-56 h-56 rounded-full bg-kale-accent/10 blur-3xl"
        style={{ animationDelay: "1s" }}
      />
      <div
        aria-hidden
        className="animate-float-slow absolute bottom-0 right-1/4 w-72 h-72 rounded-full bg-white/10 blur-3xl"
        style={{ animationDelay: "3s" }}
      />
      <div
        aria-hidden
        className="animate-float absolute top-1/2 -left-24 w-64 h-64 rounded-full bg-link/10 blur-3xl"
        style={{ animationDelay: "2.5s" }}
      />
      <div
        aria-hidden
        className="animate-float-slow absolute bottom-40 right-1/3 w-60 h-60 rounded-full bg-kale/10 blur-3xl"
        style={{ animationDelay: "4s" }}
      />
      <div
        aria-hidden
        className="animate-float absolute top-1/4 left-1/2 w-48 h-48 rounded-full bg-kale-accent/15 blur-3xl"
        style={{ animationDelay: "1.5s" }}
      />

      <header className="relative z-10 shrink-0">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Image src="/logo.svg" alt="" width={28} height={28} className="object-contain" />
            <span className="font-semibold text-ink tracking-tight text-sm">{APP_NAME}</span>
          </div>
          <Link
            href="/login"
            className="text-xs font-medium text-ink-muted hover:text-ink transition-colors"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main className="relative flex-1">
        <section className="pt-16 md:pt-24 pb-16 px-4 md:px-6">
          <div className="relative max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-ink tracking-tight text-balance">
              Time tracking that fits in a tap.
            </h1>
            <p className="mt-5 text-base md:text-lg text-ink-muted max-w-xl mx-auto text-balance">
              {APP_NAME} is a lightweight attendance ledger for teams who bill by the hour — log
              time against projects, review the week as a roster, and sign off timesheets without
              ever opening a spreadsheet.
            </p>
          </div>
        </section>

        <section className="relative py-16 px-4 md:px-6">
          <div className="relative max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-16 gap-y-20">
            {FEATURES.map(({ icon: Icon, title, description, rotate, delay, duration }) => (
              <div
                key={title}
                className={`animate-float text-left ${rotate}`}
                style={{ animationDelay: delay, animationDuration: duration }}
              >
                <Icon className="w-6 h-6 text-kale" />
                <p className="mt-2.5 text-xl font-semibold text-ink tracking-tight text-balance">
                  {title}
                </p>
                <p className="mt-1.5 text-sm text-ink-muted leading-relaxed text-balance">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </section>

        <SignUpBar />
      </main>

      <footer className="relative z-10 shrink-0 border-t border-white/10">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-12 flex items-center">
          <p className="text-xs text-white/60">
            © {new Date().getFullYear()} {APP_NAME}
          </p>
        </div>
      </footer>
    </div>
  );
}
