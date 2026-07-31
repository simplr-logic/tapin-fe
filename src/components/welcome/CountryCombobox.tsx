"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import countries from "@/data/countries.json";

// Same Select primitive as the Company size / Currency fields right next to
// this one (see CompanyDetailsFields.tsx) — was previously a Popover+Command
// combobox, which handled anchor-width positioning differently and caused a
// visible jump when opened. Countries are pre-sorted alphabetically, so
// Select's built-in typeahead (type a letter to jump) covers search.
export function CountryCombobox({
  value,
  onSelect,
  placeholder = "Select country",
}: {
  value: string;
  onSelect: (country: (typeof countries)[number]) => void;
  placeholder?: string;
}) {
  return (
    <Select
      value={value}
      onValueChange={(name) => {
        const country = countries.find((c) => c.name === name);
        if (country) onSelect(country);
      }}
    >
      <SelectTrigger className="w-full">
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {countries.map((country) => (
          <SelectItem key={country.code} value={country.name}>
            {country.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
