"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CompanyDetailsFields,
  EMPTY_COMPANY_DETAILS,
} from "@/components/welcome/CompanyDetailsFields";
import { slugify } from "@/lib/utils";

import type { Company } from "@/types/company";

export function CreateCompanyDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (company: Company) => void;
}) {
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [details, setDetails] = useState(EMPTY_COMPANY_DETAILS);
  const [showMoreDetails, setShowMoreDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function reset() {
    setName("");
    setSlug("");
    setSlugTouched(false);
    setDetails(EMPTY_COMPANY_DETAILS);
    setShowMoreDetails(false);
    setError(null);
  }

  function handleNameChange(value: string) {
    setName(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/companies", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name.trim(),
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

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      setError(body?.error?.message ?? "Couldn't create the company. Try again.");
      return;
    }

    const body = (await res.json()) as { company: Company };
    reset();
    onOpenChange(false);
    onCreated(body.company);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) reset();
        onOpenChange(next);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>New company</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="rounded-md bg-error/8 border border-error/25 px-3 py-2.5">
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
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Acme Inc."
            />
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
              onChange={(e) => {
                setSlugTouched(true);
                setSlug(slugify(e.target.value));
              }}
              placeholder="acme"
            />
            <p className="text-[11px] text-ink-subtle">klong.app/{slug || "acme"}</p>
          </div>

          <CompanyDetailsFields
            show={showMoreDetails}
            onShow={() => setShowMoreDetails(true)}
            details={details}
            onChange={(patch) => setDetails((d) => ({ ...d, ...patch }))}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !name.trim() || !slug}>
              {loading ? "Creating…" : "Create company"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
