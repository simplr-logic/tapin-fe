import { APP_NAME } from "@/config/constants";

/** Public marketing copy — keep in sync with landing hero and page metadata. */
export const SITE = {
  name: APP_NAME,
  title: `${APP_NAME} — Every tap is a line in your career story`,
  description:
    "Tap to log your work instantly. Your career history stays with you across every job — a personal record that's yours, not your employer's timesheet.",
  /** One-sentence definition for answer engines and structured data. */
  definition:
    "Klong is a tap-to-log time tracker and personal career ledger that lets people log work in one tap, keep their history across jobs, and gives teams accurate timesheets with sign-off and rollups.",
  tagline: "Every tap is a line in your career story.",
  companyName: "Simplr Logic Sdn Bhd",
  companyUrl: "https://www.simplr.com.my",
  keywords: [
    "time tracking",
    "attendance ledger",
    "timesheet",
    "career history",
    "work log",
    "tap to log time",
    "personal time tracker",
    "team time tracking",
    "Pomodoro timer",
    "work-life story",
  ],
} as const;

/** Resolve the canonical site origin for metadata, sitemap, and JSON-LD. */
export function getSiteUrl(): string {
  const configured = process.env.SITE_URL?.trim();
  if (configured) {
    return configured.replace(/\/$/, "");
  }

  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) {
    return `https://${vercel.replace(/\/$/, "")}`;
  }

  return "http://localhost:3000";
}
