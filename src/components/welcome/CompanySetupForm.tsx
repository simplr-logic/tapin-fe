"use client";

import {
  AlertTriangle,
  Briefcase,
  Check,
  Clock,
  Coins,
  FileText,
  Globe,
  Image as ImageIcon,
  Link2,
  Users,
} from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn, slugify } from "@/lib/utils";

import { CompanyDetailsFields, EMPTY_COMPANY_DETAILS } from "./CompanyDetailsFields";
import { CompanyNamePreview } from "./CompanyNamePreview";
import { WelcomeBackButton } from "./WelcomeBackButton";

interface ApiErrorBody {
  error?: { code?: string; message?: string };
}

const DETAIL_ROWS: Record<
  string,
  { icon: typeof FileText; label: string; format?: (v: string) => string }
> = {
  legalName: { icon: FileText, label: "Legal name" },
  country: { icon: Globe, label: "Country" },
  industry: { icon: Briefcase, label: "Industry" },
  companySize: { icon: Users, label: "Company size", format: (v) => `${v} employees` },
  currency: { icon: Coins, label: "Currency" },
  timezone: { icon: Clock, label: "Timezone" },
  websiteUrl: { icon: Link2, label: "Website" },
  logoUrl: { icon: ImageIcon, label: "Logo", format: () => "Added" },
};

type Step = "details" | "confirm";

const STEPS: { id: Step; label: string }[] = [
  { id: "details", label: "Details" },
  { id: "confirm", label: "Confirm" },
];

function StepIndicator({ step }: { step: Step }) {
  const activeIndex = STEPS.findIndex((s) => s.id === step);
  return (
    <div className="mb-5 flex items-center">
      {STEPS.map((s, i) => {
        const isDone = i < activeIndex;
        const isActive = i === activeIndex;
        return (
          <div key={s.id} className="flex flex-1 items-center last:flex-none">
            <div className="flex items-center gap-1.5">
              <span
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-semibold",
                  isDone
                    ? "bg-kale text-white"
                    : isActive
                      ? "bg-kale/10 text-kale ring-1 ring-kale"
                      : "bg-surface-2 text-ink-subtle"
                )}
              >
                {isDone ? <Check className="h-3 w-3" /> : i + 1}
              </span>
              <span
                className={cn(
                  "text-[10px] font-semibold tracking-wide",
                  isActive || isDone ? "text-ink" : "text-ink-subtle"
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && <div className="mx-3 h-px flex-1 bg-garden-border" />}
          </div>
        );
      })}
    </div>
  );
}

// Display name is already known by this point — onboarding (OnboardingIntroFlow)
// collects and saves it before the welcome chooser ever renders, so this only
// asks for company-specific fields. Two screens, not a modal: fill details,
// then confirm — swapped in place with a small stepper, the same technique
// the rest of the welcome flow uses to move between screens.
export function CompanySetupForm({
  onBack,
  onCreated,
}: {
  onBack: () => void;
  onCreated: () => void;
}) {
  const [step, setStep] = useState<Step>("details");
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

  function handleReview(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSlugError(null);
    setStep("confirm");
  }

  async function handleConfirm() {
    setLoading(true);

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
      setStep("details");
      return;
    }

    onCreated();
  }

  const canSubmit = companyName.trim() && slug;
  const filledDetails = Object.entries(details).filter(([, v]) => v.trim() !== "");

  if (step === "confirm") {
    return (
      <div>
        <StepIndicator step={step} />

        <p className="text-center text-sm text-ink-muted">
          Here&apos;s what your workspace will look like
        </p>

        <div className="mt-3">
          <CompanyNamePreview name={companyName} />
        </div>

        <div className="mt-4 rounded-lg border border-garden-border divide-y divide-garden-border overflow-hidden">
          <div className="flex items-center gap-2.5 px-3 py-2.5">
            <Link2 className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
            <span className="text-xs text-ink-subtle">Company URL</span>
            <span className="ml-auto text-xs font-medium text-ink">klong.app/{slug}</span>
          </div>
          {filledDetails.map(([key, value]) => {
            const row = DETAIL_ROWS[key];
            const Icon = row?.icon ?? FileText;
            return (
              <div key={key} className="flex items-center gap-2.5 px-3 py-2.5">
                <Icon className="w-3.5 h-3.5 text-ink-subtle shrink-0" />
                <span className="text-xs text-ink-subtle">{row?.label ?? key}</span>
                <span className="ml-auto text-xs font-medium text-ink text-right">
                  {row?.format ? row.format(value) : value}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-6 flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep("details")}
            disabled={loading}
            className="flex-1"
          >
            Let me tweak it
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={loading} className="flex-1">
            {loading ? "Creating…" : "Looks good, create it"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleReview} className="space-y-4">
      <WelcomeBackButton onClick={onBack} />
      <StepIndicator step={step} />

      {error && (
        <div className="flex items-start gap-2 rounded-md bg-error/8 border border-error/25 px-3 py-2.5">
          <AlertTriangle className="w-3.5 h-3.5 text-error mt-0.5 shrink-0" />
          <p className="text-xs text-error">{error}</p>
        </div>
      )}

      <div className="space-y-1.5">
        <Label
          htmlFor="companyName"
          className="text-[10px] font-semibold text-ink-subtle tracking-wide"
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

      <div className="space-y-1.5">
        <Label className="text-[10px] font-semibold text-ink-subtle tracking-wide">Preview</Label>
        <CompanyNamePreview name={companyName} />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="companySlug"
          className="text-[10px] font-semibold text-ink-subtle tracking-wide"
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

      <Button
        type="submit"
        disabled={!canSubmit}
        className="w-full h-11 rounded-md text-xs font-semibold tracking-wide focus-visible:ring-3 focus-visible:ring-link/50"
      >
        Review details
      </Button>
    </form>
  );
}
