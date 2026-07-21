import LandingBackground from "@/components/landing/LandingBackground";
import LandingCheckpoint from "@/components/landing/LandingCheckpoint";
import LandingFeatures from "@/components/landing/LandingFeatures";
import LandingForCompanies from "@/components/landing/LandingForCompanies";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingHero from "@/components/landing/LandingHero";
import LandingPersonalDashboard from "@/components/landing/LandingPersonalDashboard";
import LandingPricing from "@/components/landing/LandingPricing";
import LandingShare from "@/components/landing/LandingShare";
import LandingSkipLink from "@/components/landing/LandingSkipLink";
import LandingStructuredData from "@/components/landing/LandingStructuredData";
import LandingWorkLifeStory from "@/components/landing/LandingWorkLifeStory";
import SignUpBar from "@/components/landing/SignUpBar";
import { APP_NAME } from "@/config/constants";
import { buildLandingMetadata } from "@/lib/seo/metadata";

export const metadata = buildLandingMetadata();

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col bg-linear-to-b from-canvas to-kale-accent/18">
      <LandingStructuredData />
      <LandingSkipLink />
      <LandingBackground />

      <LandingHeader />

      <main id="main-content" className="relative flex-1">
        <LandingHero />
        <LandingWorkLifeStory />
        <LandingCheckpoint />
        <LandingPersonalDashboard />
        <LandingFeatures />
        <LandingForCompanies />
        <LandingPricing />
        <SignUpBar />
        <LandingShare />
      </main>

      <footer className="relative z-10 shrink-0 border-t border-garden-border/60">
        <div className="max-w-6xl mx-auto px-4 md:px-6 py-4 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-subtle">
            © {new Date().getFullYear()} {APP_NAME}
          </p>
          <p className="text-xs text-ink-subtle">
            A product of{" "}
            <a
              href="https://www.simplr.com.my"
              target="_blank"
              rel="noopener noreferrer"
              className="text-link hover:text-link-hover transition-colors duration-100 rounded-sm focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-link/50"
            >
              Simplr Logic Sdn Bhd
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
