import { Building2, Cloud, LayoutGrid, Truck } from "lucide-react";

import type { GridKey } from "./types";

export const PROJECT_ICONS = {
  truck: Truck,
  building: Building2,
  grid: LayoutGrid,
  cloud: Cloud,
} as const;

export const SPECIAL_DAY_AGG_KEY: GridKey = "s-agg" as const;
