import { Building2, Mail, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type Choice = "invite" | "company" | "solo";

const CHOICES: Array<{
  value: Choice;
  icon: typeof Mail;
  title: string;
  description: string;
}> = [
  {
    value: "invite",
    icon: Mail,
    title: "I have an invite from my company",
    description: "Check your work inbox for a link",
  },
  {
    value: "company",
    icon: Building2,
    title: "I'm setting up a company",
    description: "Invite your team and manage projects",
  },
  {
    value: "solo",
    icon: UserRound,
    title: "I'm working solo",
    description: "Track your own time and projects",
  },
];

export function WelcomeChoiceCards({
  choice,
  onSelect,
}: {
  choice: Choice | null;
  onSelect: (choice: Choice) => void;
}) {
  return (
    <div className="mt-5 space-y-2.5">
      {CHOICES.map(({ value, icon: Icon, title, description }) => {
        const selected = choice === value;
        return (
          <Button
            key={value}
            type="button"
            variant="outline"
            onClick={() => onSelect(value)}
            aria-pressed={selected}
            className={cn(
              "h-auto w-full items-start justify-start gap-3 whitespace-normal rounded-lg px-4 py-3.5 text-left",
              "focus-visible:ring-3 focus-visible:ring-link/50",
              selected
                ? "border-link bg-link/8 ring-1 ring-link hover:bg-link/8"
                : "border-garden-border bg-transparent hover:bg-surface-2"
            )}
          >
            <Icon
              className={cn("w-5 h-5 mt-0.5 shrink-0", selected ? "text-link" : "text-ink-subtle")}
            />
            <span>
              <span className="block text-sm font-semibold text-ink">{title}</span>
              <span className="block text-xs text-ink-muted mt-0.5">{description}</span>
            </span>
          </Button>
        );
      })}
    </div>
  );
}
