"use client";

import { Pencil } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { LOCALES } from "@/config/locales";
import countries from "@/data/countries.json";
import { ProfileUpdateError, updateMe } from "@/lib/profileUpdate";

import type { Person } from "@/types/session";

const MAX_BIO_LENGTH = 280;

// No backend timezone list exists — reuse countries.json's real IANA
// timezones (already sourced for company onboarding) instead of inventing a
// separate one, deduped since several countries share a zone.
const TIMEZONES = Array.from(new Map(countries.map((c) => [c.timezone, c])).values()).sort((a, b) =>
  a.timezone.localeCompare(b.timezone)
);

export function ProfileDetailsEditor({
  person,
  onUpdated,
}: {
  person: Person;
  onUpdated: (person: Person) => void;
}) {
  const [open, setOpen] = useState(false);
  const [displayName, setDisplayName] = useState(person.display_name ?? "");
  const [handle, setHandle] = useState(person.handle ?? "");
  const [timezone, setTimezone] = useState(person.timezone ?? "");
  const [locale, setLocale] = useState(person.locale ?? "");
  const [bio, setBio] = useState(person.bio ?? "");
  const [gamificationEnabled, setGamificationEnabled] = useState(person.gamification_enabled);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function openDialog() {
    setDisplayName(person.display_name ?? "");
    setHandle(person.handle ?? "");
    setTimezone(person.timezone ?? "");
    setLocale(person.locale ?? "");
    setBio(person.bio ?? "");
    setGamificationEnabled(person.gamification_enabled);
    setError(null);
    setOpen(true);
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      onUpdated(
        await updateMe({
          display_name: displayName.trim(),
          handle: handle.trim(),
          timezone: timezone.trim(),
          locale: locale.trim(),
          bio: bio.trim(),
          gamification_enabled: gamificationEnabled,
        })
      );
      setOpen(false);
    } catch (err) {
      setError(err instanceof ProfileUpdateError ? err.message : "Couldn't save. Try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={openDialog}
        aria-label="Edit profile details"
        className="h-auto shrink-0 gap-1.5 px-2.5 py-1 text-[11px] font-medium text-ink-muted hover:text-ink"
      >
        <Pencil className="h-3 w-3" />
        Edit profile
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit profile</DialogTitle>
          </DialogHeader>

          <div className="space-y-3.5">
            <div className="space-y-1.5">
              <Label htmlFor="pd-display-name">Display name</Label>
              <Input
                id="pd-display-name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Jane Doe"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pd-handle">Handle</Label>
              <Input
                id="pd-handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="janedoe"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="pd-timezone">Timezone</Label>
                <Select value={timezone} onValueChange={(v) => setTimezone(v ?? "")}>
                  <SelectTrigger id="pd-timezone" className="w-full">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((c) => (
                      <SelectItem key={c.timezone} value={c.timezone}>
                        {c.timezone} — {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pd-locale">Locale</Label>
                <Select value={locale} onValueChange={(v) => setLocale(v ?? "")}>
                  <SelectTrigger id="pd-locale" className="w-full">
                    <SelectValue placeholder="Select locale" />
                  </SelectTrigger>
                  <SelectContent>
                    {LOCALES.map((l) => (
                      <SelectItem key={l.code} value={l.code}>
                        {l.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pd-bio">Bio</Label>
              <Textarea
                id="pd-bio"
                value={bio}
                onChange={(e) => setBio(e.target.value.slice(0, MAX_BIO_LENGTH))}
                placeholder="Tell people a bit about yourself…"
                maxLength={MAX_BIO_LENGTH}
                rows={3}
              />
              <p className="text-right text-[10px] text-ink-subtle">
                {bio.length}/{MAX_BIO_LENGTH}
              </p>
            </div>

            {/* Achievements & levels (gamification_enabled) toggle hidden for
                now — data plumbing (state + save payload) stays wired so this
                is a one-block re-add once it's ready to ship. */}

            {error && <p className="text-xs text-error">{error}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
