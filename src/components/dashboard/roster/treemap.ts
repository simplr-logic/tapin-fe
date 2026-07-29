import { MAX_TILE_RATIO } from "@/config/constants";

import type { GridKey } from "./types";

// Squarified treemap (Bruls, Huizing & van Wijk, 1999) — same family of
// layout used by market-cap / liquidation heatmaps (Finviz, CoinMarketCap,
// etc). Items are laid out row by row along whichever side of the remaining
// rectangle is currently shorter, greedily adding items to the current row
// as long as doing so doesn't make the row's worst aspect ratio worse. This
// keeps every tile close to square — no thin slivers, and no risk of an
// axis choice that only makes sense in an abstract square coordinate space
// (the old binary-split approach's failure mode). Must be called with the
// *real* container width/height for the squareness optimization to mean
// anything; pass percentages of a fake 100x100 space and it degenerates.
//
// Weights are scaled into [1, MAX_TILE_RATIO] (see computeBoundedWeights)
// instead of used raw, so the biggest tile is never more than that ratio
// bigger than the smallest — real proportional sizing, capped short of ever
// looking like a market dominated by one entry.

export interface TreemapNode {
  key: GridKey;
  x: number;
  y: number;
  w: number;
  h: number;
}

export function computeBoundedWeights(
  values: { key: GridKey; raw: number }[]
): Map<GridKey, number> {
  const map = new Map<GridKey, number>();
  if (values.length === 0) return map;
  const min = Math.min(...values.map((v) => v.raw));
  const max = Math.max(...values.map((v) => v.raw));
  for (const v of values) {
    if (max === min) {
      map.set(v.key, 1);
      continue;
    }
    const t = (v.raw - min) / (max - min);
    map.set(v.key, 1 + (MAX_TILE_RATIO - 1) * t);
  }
  return map;
}

interface AreaItem {
  key: GridKey;
  area: number;
}

// Worst aspect ratio achievable across a row of items (given as areas)
// if laid out along a side of the given length — lower is better, 1 is a
// perfect square. Formula from the original squarified-treemaps paper.
function worstAspectRatio(row: AreaItem[], side: number): number {
  if (row.length === 0 || side <= 0) return Infinity;
  const sum = row.reduce((s, r) => s + r.area, 0);
  if (sum <= 0) return Infinity;
  const maxA = Math.max(...row.map((r) => r.area));
  const minA = Math.min(...row.map((r) => r.area));
  const side2 = side * side;
  return Math.max((side2 * maxA) / (sum * sum), (sum * sum) / (side2 * minA));
}

// Places one completed row into the current remaining rectangle and returns
// its tiles. The row always spans the full length of whichever side is
// currently shorter (that's what "along the shorter side" means); its
// thickness in the other dimension is derived from the row's total area.
function layoutRow(row: AreaItem[], x: number, y: number, w: number, h: number): TreemapNode[] {
  const rowArea = row.reduce((s, r) => s + r.area, 0);
  const rects: TreemapNode[] = [];
  if (w >= h) {
    const bandWidth = h > 0 ? rowArea / h : 0;
    let cy = y;
    for (const item of row) {
      const itemHeight = bandWidth > 0 ? item.area / bandWidth : 0;
      rects.push({ key: item.key, x, y: cy, w: bandWidth, h: itemHeight });
      cy += itemHeight;
    }
  } else {
    const bandHeight = w > 0 ? rowArea / w : 0;
    let cx = x;
    for (const item of row) {
      const itemWidth = bandHeight > 0 ? item.area / bandHeight : 0;
      rects.push({ key: item.key, x: cx, y, w: itemWidth, h: bandHeight });
      cx += itemWidth;
    }
  }
  return rects;
}

// Lays out `items` (any order in — sorted internally, largest weight
// first, which is what the squarify algorithm expects for good results)
// into the rectangle (x, y, w, h), in the SAME units as w/h — pass real
// pixels for a real container, or percentages for an abstract one.
export function squarify(
  items: { key: GridKey; weight: number }[],
  x: number,
  y: number,
  w: number,
  h: number
): TreemapNode[] {
  if (items.length === 0 || w <= 0 || h <= 0) return [];
  const totalWeight = items.reduce((s, i) => s + i.weight, 0);
  if (totalWeight <= 0) return [];

  const scale = (w * h) / totalWeight;
  let remaining: AreaItem[] = [...items]
    .sort((a, b) => b.weight - a.weight)
    .map((i) => ({ key: i.key, area: i.weight * scale }));

  const nodes: TreemapNode[] = [];
  let rx = x;
  let ry = y;
  let rw = w;
  let rh = h;

  while (remaining.length > 0) {
    const side = Math.min(rw, rh);
    let row: AreaItem[] = [remaining[0]];
    let i = 1;
    while (i < remaining.length) {
      const nextRow = [...row, remaining[i]];
      if (worstAspectRatio(nextRow, side) <= worstAspectRatio(row, side)) {
        row = nextRow;
        i++;
      } else {
        break;
      }
    }

    nodes.push(...layoutRow(row, rx, ry, rw, rh));

    const rowArea = row.reduce((s, r) => s + r.area, 0);
    if (rw >= rh) {
      const bandWidth = rh > 0 ? rowArea / rh : 0;
      rx += bandWidth;
      rw -= bandWidth;
    } else {
      const bandHeight = rw > 0 ? rowArea / rw : 0;
      ry += bandHeight;
      rh -= bandHeight;
    }
    remaining = remaining.slice(row.length);
  }

  return nodes;
}
