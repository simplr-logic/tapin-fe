import { MAX_TILE_RATIO } from "@/config/constants";

import type { GridKey } from "./types";

// Binary-split treemap, same shape as a crypto market-cap heatmap: nested
// proportional-area rectangles, not a uniform grid. The split *topology*
// (which entries share a branch, and whether that branch cuts vertically or
// horizontally) is frozen from the current order via buildTreeStructure, and
// only rebuilt when the set of grid entries changes (add/remove). Every
// render then only recomputes the ratio *within* each frozen split from live
// weights (layoutTree) — so a tile can grow or shrink smoothly as it's
// tapped without jumping to a different quadrant, and a manual drag-swap only
// touches the two dragged tiles' geometry.
//
// Weights are scaled into [1, MAX_TILE_RATIO] (see computeBoundedWeights)
// instead of used raw, so the biggest tile is never more than that ratio
// bigger than the smallest — real proportional sizing, capped short of ever
// looking like a 2:1 split.

export interface TreemapNode {
  key: GridKey;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface TreeLeaf {
  type: "leaf";
  slot: number;
}
export interface TreeSplit {
  type: "split";
  axis: "v" | "h";
  leftSlots: number[];
  rightSlots: number[];
  left: TreeStruct;
  right: TreeStruct;
}
export type TreeStruct = TreeLeaf | TreeSplit;

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

export function splitByWeight<T extends { weight: number }>(items: T[]): [T[], T[]] {
  const totalWeight = items.reduce((sum, item) => sum + item.weight, 0);
  let accumulated = 0;
  let splitIndex = 1;
  for (let i = 0; i < items.length - 1; i++) {
    accumulated += items[i].weight;
    if (accumulated >= totalWeight / 2) {
      splitIndex = i + 1;
      break;
    }
  }
  return [items.slice(0, splitIndex), items.slice(splitIndex)];
}

export function buildTreeStructure(
  items: { slot: number; weight: number }[],
  w: number,
  h: number
): TreeStruct {
  if (items.length <= 1) return { type: "leaf", slot: items[0]?.slot ?? 0 };

  const [firstGroup, secondGroup] = splitByWeight(items);
  const firstWeight = firstGroup.reduce((sum, item) => sum + item.weight, 0);
  const secondWeight = secondGroup.reduce((sum, item) => sum + item.weight, 0);
  const ratio = firstWeight / (firstWeight + secondWeight || 1);
  const axis: "v" | "h" = w >= h ? "v" : "h";
  const leftW = axis === "v" ? w * ratio : w;
  const leftH = axis === "h" ? h * ratio : h;

  return {
    type: "split",
    axis,
    leftSlots: firstGroup.map((i) => i.slot),
    rightSlots: secondGroup.map((i) => i.slot),
    left: buildTreeStructure(firstGroup, leftW, leftH),
    right: buildTreeStructure(
      secondGroup,
      w - (axis === "v" ? leftW : 0),
      h - (axis === "h" ? leftH : 0)
    ),
  };
}

export function layoutTree(
  node: TreeStruct,
  weightBySlot: Map<number, number>,
  x: number,
  y: number,
  w: number,
  h: number
): { slot: number; x: number; y: number; w: number; h: number }[] {
  if (node.type === "leaf") return [{ slot: node.slot, x, y, w, h }];

  const leftWeight = node.leftSlots.reduce((sum, s) => sum + (weightBySlot.get(s) ?? 0), 0);
  const rightWeight = node.rightSlots.reduce((sum, s) => sum + (weightBySlot.get(s) ?? 0), 0);
  const ratio = leftWeight / (leftWeight + rightWeight || 1);

  if (node.axis === "v") {
    const leftW = w * ratio;
    return [
      ...layoutTree(node.left, weightBySlot, x, y, leftW, h),
      ...layoutTree(node.right, weightBySlot, x + leftW, y, w - leftW, h),
    ];
  }
  const leftH = h * ratio;
  return [
    ...layoutTree(node.left, weightBySlot, x, y, w, leftH),
    ...layoutTree(node.right, weightBySlot, x, y + leftH, w, h - leftH),
  ];
}
