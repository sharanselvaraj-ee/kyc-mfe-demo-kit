// SLIDE: "A2UI: agents declare UI as data" (RT-006 step 3 — recordings refreshed by pnpm agent:record)
import { readFile } from "node:fs/promises";
import type { Geo } from "@kyc/contracts";

function recordedPath(geo: Geo): URL {
  return new URL(`../../mocks/a2ui/recorded/${geo}.jsonl`, import.meta.url);
}

export async function readRecordedBlueprint(geo: Geo): Promise<unknown[] | null> {
  try {
    const text = await readFile(recordedPath(geo), "utf8");
    return text
      .split("\n")
      .filter((line) => line.trim().length > 0)
      .map((line) => JSON.parse(line));
  } catch {
    return null;
  }
}

export { recordedPath };
