export type CareerChapter = {
  id: string;
  company: string;
  period: string;
  status: "closed" | "current";
};

export const CAREER_CHAPTERS: CareerChapter[] = [
  { id: "axon", company: "AxonTech", period: "2022 – 2024", status: "closed" },
  { id: "vanguard", company: "Vanguard Retail", period: "2024 – 2025", status: "closed" },
  { id: "meridian", company: "Meridian Logistics", period: "2025 – now", status: "current" },
];

export type LandingTreemapProject = {
  slot: number;
  title: string;
  company: string;
  minutes: number;
  targetHours: number;
};

/** Representative week slice — shaped like seed data, static for the landing preview. */
export const LANDING_WEEK_PROJECTS: LandingTreemapProject[] = [
  {
    slot: 0,
    title: "Platform Revamp",
    company: "Vanguard Retail",
    minutes: 960,
    targetHours: 18,
  },
  {
    slot: 1,
    title: "Fleet Routing Optimization",
    company: "Meridian Logistics",
    minutes: 720,
    targetHours: 15,
  },
  {
    slot: 2,
    title: "Cloud Migration",
    company: "AxonTech",
    minutes: 540,
    targetHours: 11,
  },
  {
    slot: 3,
    title: "Ad Campaign Analytics",
    company: "Optic Media",
    minutes: 300,
    targetHours: 9,
  },
];
