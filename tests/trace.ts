// SLIDE: "Anatomy of a living spec" (scenario ID -> tagged test; TRC-001)
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import process from "node:process";

const ROOT = join(import.meta.dirname, "..");
const SCENARIO_ID = /\b([A-Z]{2,5}-(?:[A-Z0-9]+-)?\d{3})\b/g;

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      if (name === "node_modules" || name === "test-results" || name === "playwright-report") continue;
      walk(path, out);
    } else {
      out.push(path);
    }
  }
  return out;
}

function findIds(text: string): Set<string> {
  return new Set([...text.matchAll(SCENARIO_ID)].map((m) => m[1]));
}

// 1. Every scenario ID the spec defines (catches typos in test tags).
const specIds = new Set<string>();
for (const path of walk(join(ROOT, "openspec/specs"))) {
  if (!path.endsWith("spec.md")) continue;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    if (line.trim().startsWith("#### Scenario:")) {
      for (const id of findIds(line)) specIds.add(id);
    }
  }
}

// 2. Milestones: which scenario IDs belong to which milestone, and which are done.
interface Milestone {
  number: number;
  done: boolean;
  scenarioIds: Set<string>;
}
const milestones: Milestone[] = [];
{
  const text = readFileSync(join(ROOT, "openspec/milestones.md"), "utf8");
  const lines = text.split("\n");
  let current: Milestone | null = null;
  for (const line of lines) {
    const header = line.match(/^## \[([ x])\] M(\d+):/);
    if (header) {
      if (current) milestones.push(current);
      current = { number: Number(header[2]), done: header[1] === "x", scenarioIds: new Set() };
      continue;
    }
    if (current && line.trim().startsWith("-")) {
      for (const id of findIds(line)) current.scenarioIds.add(id);
    }
  }
  if (current) milestones.push(current);
}

// 3. Every scenario ID actually tagged on a test, anywhere under tests/.
const taggedIds = new Set<string>();
for (const path of walk(ROOT)) {
  if (!/\.(spec|test)\.tsx?$/.test(path)) continue;
  for (const id of findIds(readFileSync(path, "utf8"))) taggedIds.add(id);
}

// 4. Resolve the target milestone.
const highestDone = Math.max(0, ...milestones.filter((m) => m.done).map((m) => m.number));
const targetMilestone = Number(process.env.TRACE_MILESTONE ?? highestDone);

let failed = false;

for (const milestone of milestones) {
  const label = `M${milestone.number}`;
  if (milestone.number > targetMilestone) {
    const planned = [...milestone.scenarioIds].sort();
    console.log(`${label}: planned (${planned.length} scenarios) — ${planned.join(", ")}`);
    continue;
  }
  const missing = [...milestone.scenarioIds].filter((id) => !taggedIds.has(id)).sort();
  if (missing.length > 0) {
    failed = true;
    console.error(`${label}: MISSING tagged tests for: ${missing.join(", ")}`);
  } else {
    console.log(`${label}: ok (${milestone.scenarioIds.size} scenarios all tagged)`);
  }
}

const unknown = [...taggedIds].filter((id) => !specIds.has(id)).sort();
if (unknown.length > 0) {
  failed = true;
  console.error(`Tagged in tests but not a real scenario ID in any spec: ${unknown.join(", ")}`);
}

console.log(`\npnpm trace: target milestone M${targetMilestone} (TRACE_MILESTONE=${targetMilestone})`);
if (failed) {
  console.error("pnpm trace: FAILED");
  process.exit(1);
} else {
  console.log("pnpm trace: PASSED");
}
