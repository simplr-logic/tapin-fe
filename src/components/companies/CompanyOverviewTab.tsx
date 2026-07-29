"use client";

import { Pencil, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { COMPANY_SIZE_OPTIONS, CURRENCY_OPTIONS } from "@/components/welcome/CompanyDetailsFields";

import type { Company, PersonEmployment } from "@/types/company";

const DISPLAY_FIELDS: { key: keyof Company; label: string }[] = [
  { key: "legal_name", label: "Legal name" },
  { key: "country", label: "Country" },
  { key: "industry", label: "Industry" },
  { key: "company_size", label: "Company size" },
  { key: "timezone", label: "Timezone" },
  { key: "currency", label: "Currency" },
  { key: "website_url", label: "Website" },
];

function formFromCompany(company: Company) {
  return {
    name: company.name,
    legal_name: company.legal_name ?? "",
    country: company.country ?? "",
    industry: company.industry ?? "",
    company_size: company.company_size ?? "",
    timezone: company.timezone ?? "",
    currency: company.currency ?? "",
    website_url: company.website_url ?? "",
    logo_url: company.logo_url ?? "",
  };
}

export function CompanyOverviewTab({
  company,
  employment,
  adminRoles,
  isAdmin,
  onUpdated,
}: {
  company: Company;
  employment?: PersonEmployment;
  adminRoles: string[];
  isAdmin: boolean;
  onUpdated: (company: Company) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(() => formFromCompany(company));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function startEdit() {
    setForm(formFromCompany(company));
    setError(null);
    setEditing(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const res = await fetch(`/companies/${company.id}/admin/details`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name.trim(),
        legal_name: form.legal_name.trim() || undefined,
        country: form.country.trim() || undefined,
        industry: form.industry.trim() || undefined,
        company_size: form.company_size || undefined,
        timezone: form.timezone.trim() || undefined,
        currency: form.currency || undefined,
        website_url: form.website_url.trim() || undefined,
        logo_url: form.logo_url.trim() || undefined,
      }),
    });

    setSaving(false);

    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
      setError(body?.error?.message ?? "Couldn't save changes. Try again.");
      return;
    }

    const body = (await res.json()) as { company: Company };
    onUpdated(body.company);
    setEditing(false);
  }

  if (editing) {
    return (
      <div className="bg-card rounded-lg border border-garden-border shadow-card p-5">
        <form onSubmit={handleSave} className="space-y-3">
          {error && (
            <div className="rounded-md bg-error/8 border border-error/25 px-3 py-2.5">
              <p className="text-xs text-error">{error}</p>
            </div>
          )}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide">
              Company name
            </Label>
            <Input
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide">
                Legal name
              </Label>
              <Input
                value={form.legal_name}
                onChange={(e) => setForm((f) => ({ ...f, legal_name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide">
                Country
              </Label>
              <Input
                value={form.country}
                onChange={(e) => setForm((f) => ({ ...f, country: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide">
                Industry
              </Label>
              <Input
                value={form.industry}
                onChange={(e) => setForm((f) => ({ ...f, industry: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide">
                Company size
              </Label>
              <Select
                value={form.company_size}
                onValueChange={(v) => setForm((f) => ({ ...f, company_size: v ?? "" }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {COMPANY_SIZE_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt} employees
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide">
                Timezone
              </Label>
              <Input
                value={form.timezone}
                onChange={(e) => setForm((f) => ({ ...f, timezone: e.target.value }))}
                placeholder="Asia/Kuala_Lumpur"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide">
                Currency
              </Label>
              <Select
                value={form.currency}
                onValueChange={(v) => setForm((f) => ({ ...f, currency: v ?? "" }))}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  {CURRENCY_OPTIONS.map((opt) => (
                    <SelectItem key={opt} value={opt}>
                      {opt}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide">
              Website
            </Label>
            <Input
              type="url"
              value={form.website_url}
              onChange={(e) => setForm((f) => ({ ...f, website_url: e.target.value }))}
              placeholder="https://acme.com"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide">
              Logo URL
            </Label>
            <Input
              type="url"
              value={form.logo_url}
              onChange={(e) => setForm((f) => ({ ...f, logo_url: e.target.value }))}
              placeholder="https://acme.com/logo.png"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={() => setEditing(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || !form.name.trim()}>
              {saving ? "Saving…" : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border border-garden-border shadow-card p-5 space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {adminRoles.length > 0 && (
            <span className="flex items-center gap-1 text-[9px] font-semibold uppercase tracking-wide text-primary bg-primary/8 border border-primary/20 rounded-full px-1.5 py-0.5">
              <ShieldCheck className="w-2.5 h-2.5" />
              {adminRoles.join(", ")}
            </span>
          )}
          {employment && (
            <span className="text-[9px] font-semibold uppercase tracking-wide text-ink-subtle bg-surface-2 border border-garden-border-strong rounded-full px-1.5 py-0.5">
              {employment.employment_type} · {employment.status}
            </span>
          )}
        </div>
        {isAdmin && (
          <Button
            type="button"
            variant="outline"
            onClick={startEdit}
            className="h-auto gap-1.5 text-xs px-3 py-1.5 font-medium"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit details
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {DISPLAY_FIELDS.map(({ key, label }) => (
          <div key={key}>
            <p className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide">
              {label}
            </p>
            <p className="text-sm text-ink mt-0.5">{company[key] ?? "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
