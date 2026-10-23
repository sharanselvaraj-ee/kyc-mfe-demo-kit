// SLIDE: "A2UI: agents declare UI as data" (RT-006 step 1 — opt-in, in-memory, per process)
import type { Geo } from "@kyc/contracts";
import type { BlueprintResult } from "./fallback-types.js";

const cache = new Map<Geo, BlueprintResult>();

export function getCached(geo: Geo): BlueprintResult | undefined {
  return cache.get(geo);
}

export function setCached(geo: Geo, result: BlueprintResult): void {
  cache.set(geo, result);
}
