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
import countries from "@/data/countries.json";
import { cn } from "@/lib/utils";

import { CountryCombobox } from "./CountryCombobox";

export const COMPANY_SIZE_OPTIONS = ["1-10", "11-50", "51-200", "201-500", "500+"];

// Every currency that appears in countries.json, so autofilling from a
// country selection always lands on a value this list actually contains.
export const CURRENCY_OPTIONS = Array.from(new Set(countries.map((c) => c.currency))).sort();

export interface CompanyDetails {
  legalName: string;
  country: string;
  websiteUrl: string;
  logoUrl: string;
  industry: string;
  companySize: string;
  timezone: string;
  currency: string;
}

export const EMPTY_COMPANY_DETAILS: CompanyDetails = {
  legalName: "",
  country: "",
  websiteUrl: "",
  logoUrl: "",
  industry: "",
  companySize: "",
  timezone: "",
  currency: "",
};

export function CompanyDetailsFields({
  show,
  onShow,
  details,
  onChange,
  alwaysExpanded = false,
}: {
  show: boolean;
  onShow: () => void;
  details: CompanyDetails;
  onChange: (patch: Partial<CompanyDetails>) => void;
  alwaysExpanded?: boolean;
}) {
  if (!alwaysExpanded && !show) {
    return (
      <Button
        type="button"
        variant="link"
        onClick={onShow}
        className="h-auto p-0 text-[11px] font-medium text-link hover:text-link-hover"
      >
        + Add company details (optional)
      </Button>
    );
  }

  return (
    <div className={cn("space-y-3", !alwaysExpanded && "border-t border-garden-border pt-3")}>
      <div className="space-y-1.5">
        <Label
          htmlFor="legalName"
          className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide"
        >
          Legal name
        </Label>
        <Input
          id="legalName"
          value={details.legalName}
          onChange={(e) => onChange({ legalName: e.target.value })}
          placeholder="Acme Incorporated Sdn Bhd"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide">
            Country
          </Label>
          <CountryCombobox
            value={details.country}
            onSelect={(country) =>
              onChange({
                country: country.name,
                timezone: country.timezone,
                currency: country.currency,
              })
            }
          />
        </div>
        <div className="space-y-1.5">
          <Label
            htmlFor="industry"
            className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide"
          >
            Industry
          </Label>
          <Input
            id="industry"
            value={details.industry}
            onChange={(e) => onChange({ industry: e.target.value })}
            placeholder="Logistics"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide">
            Company size
          </Label>
          <Select
            value={details.companySize}
            onValueChange={(v) => onChange({ companySize: v ?? "" })}
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
            Currency
          </Label>
          <Select value={details.currency} onValueChange={(v) => onChange({ currency: v ?? "" })}>
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
        <Label
          htmlFor="timezone"
          className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide"
        >
          Timezone
        </Label>
        <Input
          id="timezone"
          value={details.timezone}
          onChange={(e) => onChange({ timezone: e.target.value })}
          placeholder="Asia/Kuala_Lumpur"
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="websiteUrl"
          className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide"
        >
          Website
        </Label>
        <Input
          id="websiteUrl"
          type="url"
          value={details.websiteUrl}
          onChange={(e) => onChange({ websiteUrl: e.target.value })}
          placeholder="https://acme.com"
        />
      </div>

      <div className="space-y-1.5">
        <Label
          htmlFor="logoUrl"
          className="text-[10px] font-semibold text-ink-subtle uppercase tracking-wide"
        >
          Logo URL
        </Label>
        <Input
          id="logoUrl"
          type="url"
          value={details.logoUrl}
          onChange={(e) => onChange({ logoUrl: e.target.value })}
          placeholder="https://acme.com/logo.png"
        />
      </div>
    </div>
  );
}
