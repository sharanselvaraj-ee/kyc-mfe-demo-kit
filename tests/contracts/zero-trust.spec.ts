// SLIDE: "The flag that was off, but still on" (FLG-002: flags read only by the adapter)
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { describe, it, expect } from "vitest";

const ROOT = join(import.meta.dirname, "../..");

function walkSource(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    const stat = statSync(path);
    if (stat.isDirectory()) {
      if (name === "node_modules" || name.startsWith(".")) continue;
      walkSource(path, out);
    } else if (/\.(ts|tsx|svelte)$/.test(name) && !name.endsWith(".d.ts")) {
      out.push(path);
    }
  }
  return out;
}

describe("zero-trust / flags boundary", () => {
  it("[FLG-002] .flags[...] is indexed only in packages/core/src/flags.ts", () => {
    const offenders: string[] = [];
    for (const path of walkSource(join(ROOT, "packages"))) {
      if (path.includes("/gen/react/") || path.includes("/gen/svelte/")) continue; // generated output
      const relPath = relative(ROOT, path);
      if (relPath === "packages/core/src/flags.ts") continue;
      const content = readFileSync(path, "utf8");
      if (/\.flags\s*[[?]/.test(content)) offenders.push(relPath);
    }
    expect(offenders).toEqual([]);
  });

  it("[RT-007] the agent's request to Claude carries only geo + policy metadata, never a user value key", () => {
    const source = readFileSync(join(ROOT, "packages/agent/src/claude-client.ts"), "utf8");
    // The user message is built from policy.fields (fieldId/label/hint) — it must
    // never reference a submission-shaped object (consent / a KycSubmission) that
    // could carry what a user typed. ("values" alone is too generic a word to check —
    // Object.values(CATALOG) is a legitimate, unrelated use.)
    expect(source).not.toMatch(/\bconsent\b|\bsubmission\b|KycSubmission/i);
  });

  it("[RT-007] the agent's blueprint endpoint only accepts GET (no request body to leak user data through)", () => {
    const source = readFileSync(join(ROOT, "packages/agent/src/server.ts"), "utf8");
    expect(source).toMatch(/req\.method\s*!==\s*"GET"/);
  });

  it("[RT-010] ANTHROPIC_API_KEY is never read from browser-shipped runtime source", () => {
    // Scoped to each package's src/ (what actually ends up in a browser bundle) —
    // build-time-only scripts/ (e.g. mfe-lite's lite:bake, which legitimately calls
    // live Claude once at build time, same as packages/agent/src/record.ts) are not
    // bundled to the browser and are exempt.
    const offenders: string[] = [];
    for (const dir of [
      "packages/contracts/src",
      "packages/core/src",
      "packages/ir/src",
      "packages/catalog/src",
      "packages/mfe-full/src",
      "packages/mfe-lite/src",
      "packages/loader/src",
      "packages/mocks/src",
      "apps/host/src",
    ]) {
      const full = join(ROOT, dir);
      try {
        for (const path of walkSource(full)) {
          if (readFileSync(path, "utf8").includes("ANTHROPIC_API_KEY")) offenders.push(relative(ROOT, path));
        }
      } catch {
        // directory may not exist in a partial checkout; not this test's concern
      }
    }
    expect(offenders).toEqual([]);
  });
});
