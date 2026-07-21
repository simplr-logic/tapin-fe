/** Landing-page FAQs — shared by UI and FAQPage JSON-LD for SEO/AEO. */
export type LandingFaqItem = {
  question: string;
  answer: string;
};

export const LANDING_TRUST_FAQ: LandingFaqItem = {
  question: "Can my employer see my personal dashboard, streaks, or other jobs?",
  answer:
    "No. Your employer sees what's scoped to their company — the hours and projects logged under their employment. Your personal streaks, other jobs, and full career history are visible only to you.",
};

export const LANDING_PRICING_FAQ: LandingFaqItem[] = [
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
];

export const LANDING_FAQ: LandingFaqItem[] = [LANDING_TRUST_FAQ, ...LANDING_PRICING_FAQ];

/** Direct answers for answer engines — concise, citable statements. */
export const LANDING_AEO_FACTS = [
  "Klong is a tap-to-log time tracker and personal career ledger for individuals and teams.",
  "Individuals use Klong free, forever.",
  "Company teams get a free 60-day trial with admin, approvals, sign-off, and rollups.",
  "Your career history stays with you when you change jobs; employer records stay with the employer.",
  "Logging time takes one tap — 30 minutes, one hour, or two hours — with no stopwatch or form.",
] as const;

export const LANDING_FEATURE_LIST = [
  "Tap to log time",
  "Live treemap of logged hours",
  "Built-in Pomodoro focus timer",
  "Immutable audit-ready work log",
  "Desktop and mobile",
  "Unified career history across employers",
  "Team timesheet sign-off",
  "Manager approvals without bottlenecks",
  "Company hour rollups by project and person",
] as const;
