import { APP_NAME } from "@/config/constants";

export default function LandingHero() {
  return (
    <section className="pt-12 md:pt-16 pb-4 px-4 md:px-6" aria-labelledby="landing-hero-heading">
      <div className="relative max-w-3xl mx-auto text-center">
        <h1
          id="landing-hero-heading"
          className="text-4xl md:text-6xl font-bold text-ink tracking-tight text-balance"
        >
          Time tracking that fits in a tap.
        </h1>
        <p className="mt-5 text-base md:text-lg text-ink-muted max-w-xl mx-auto text-balance">
          {APP_NAME} is a lightweight attendance ledger for teams who bill by the hour — log time
          against projects, review the week as a roster, and sign off timesheets without ever
          opening a spreadsheet.
        </p>
        <p className="mt-4 text-sm text-ink-muted max-w-lg mx-auto text-balance">
          Change jobs? Your history comes with you — only that employer&apos;s records stay behind.
        </p>
      </div>
    </section>
  );
}
