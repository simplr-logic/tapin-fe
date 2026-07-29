"use client";

import { AlertTriangle, ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { LandingCard } from "@/components/landing/landing-ui";
import LandingBackground from "@/components/landing/LandingBackground";
import { AuthHeader } from "@/components/layout/AuthHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { APP_NAME } from "@/config/constants";
import { cn, slugify } from "@/lib/utils";

import { CompanyDetailsFields, EMPTY_COMPANY_DETAILS } from "./CompanyDetailsFields";
import { CompanyNamePreview } from "./CompanyNamePreview";

interface ApiErrorBody {
  error?: { code?: string; message?: string };
}

export default function WelcomeCompanyFlow({
  suggestedDisplayName,
}: {
  suggestedDisplayName?: string;
}) {
  const router = useRouter();
  const [displayName, setDisplayName] = useState(suggestedDisplayName ?? "");
  const [companyName, setCompanyName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [details, setDetails] = useState(EMPTY_COMPANY_DETAILS);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slugError, setSlugError] = useState<string | null>(null);

  function handleCompanyNameChange(value: string) {
    setCompanyName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  function handleSlugChange(value: string) {
    setSlugTouched(true);
    setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSlugError(null);
    setLoading(true);

    const onboardingRes = await fetch("/me/onboarding/complete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: displayName.trim() }),
    });

    if (!onboardingRes.ok) {
      setLoading(false);
      setError("Couldn't save that. Try again.");
      return;
    }

    const companyRes = await fetch("/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: companyName.trim(),
        slug,
        legal_name: details.legalName.trim() || undefined,
        country: details.country.trim() || undefined,
        website_url: details.websiteUrl.trim() || undefined,
        logo_url: details.logoUrl.trim() || undefined,
        industry: details.industry.trim() || undefined,
        company_size: details.companySize || undefined,
        timezone: details.timezone.trim() || undefined,
        currency: details.currency || undefined,
      }),
    });

    setLoading(false);

    if (!companyRes.ok) {
      const body = (await companyRes.json().catch(() => null)) as ApiErrorBody | null;
      const code = body?.error?.code;
      if (code === "employment.slug_taken") {
        setSlugError("That slug is already taken — try another.");
      } else if (code === "employment.slug_invalid" || code === "employment.slug_reserved") {
        setSlugError(body?.error?.message ?? "That slug isn't available.");
      } else {
        setError(body?.error?.message ?? "Couldn't create the company. Try again.");
      }
      return;
    }

    router.push("/dashboard");
  }

  const canSubmit = displayName.trim() && companyName.trim() && slug;

  return (
    <div className="relative min-h-screen flex flex-col bg-linear-to-b from-canvas to-kale-accent/18">
      <AuthHeader showLogout />
      <LandingBackground />

      <main className="relative z-10 flex-1 flex items-start md:items-center justify-center p-4 py-8">
        <div className="w-full max-w-2xl">
          <Link
            href="/welcome"
            className="mb-4 inline-flex items-center gap-1.5 text-xs font-semibold text-ink-muted hover:text-ink transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back
          </Link>

          <LandingCard className="p-6 md:p-8">
            <div className="flex flex-col items-center text-center">
              <Image
                src="/klong-logo-lockup.jpg"
                alt={APP_NAME}
                width={72}
                height={72}
                className="size-18 object-contain"
              />
            </div>

            <h1 className="mt-4 text-2xl font-bold text-ink tracking-tight text-center">
              Set up your company
            </h1>
            <p className="mt-1.5 text-sm text-ink-muted text-center">
              Fill in as much as you have — you can edit these details anytime from the company
              page.
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              {error && (
                <div className="flex items-start gap-2 rounded-md bg-error/8 border border-error/25 px-3 py-2.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-error mt-0.5 shrink-0" />
                  <p className="text-xs text-error">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label
                    htmlFor="displayName"
                    className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide"
                  >
                    What should we call you?
                  </Label>
                  <Input
                    id="displayName"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Jane"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label
                    htmlFor="companyName"
                    className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide"
                  >
                    Company name
                  </Label>
                  <Input
                    id="companyName"
                    required
                    value={companyName}
                    onChange={(e) => handleCompanyNameChange(e.target.value)}
                    placeholder="Acme Inc."
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide">
                  Preview
                </Label>
                <CompanyNamePreview name={companyName} />
              </div>

              <div className="space-y-1.5">
                <Label
                  htmlFor="companySlug"
                  className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide"
                >
                  Company URL
                </Label>
                <Input
                  id="companySlug"
                  required
                  value={slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                  placeholder="acme"
                  aria-invalid={Boolean(slugError)}
                />
                <p className={cn("text-[11px]", slugError ? "text-error" : "text-ink-subtle")}>
                  {slugError ?? `klong.app/${slug || "acme"}`}
                </p>
              </div>

              <div className="border-t border-garden-border pt-4">
                <CompanyDetailsFields
                  show
                  alwaysExpanded
                  onShow={() => {}}
                  details={details}
                  onChange={(patch) => setDetails((d) => ({ ...d, ...patch }))}
                />
              </div>

              <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-2">
                <Button variant="outline" render={<Link href="/welcome" />} nativeButton={false}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading || !canSubmit}
                  className="h-11 sm:h-9 rounded-md text-xs font-semibold uppercase tracking-wide focus-visible:ring-3 focus-visible:ring-link/50"
                >
                  {loading ? "Creating…" : "Create company"}
                </Button>
              </div>
            </form>
          </LandingCard>
        </div>
      </main>
    </div>
  );
}
