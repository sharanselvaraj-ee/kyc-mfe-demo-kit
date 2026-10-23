// @vitest-environment node
// SLIDE: "A2UI: agents declare UI as data" (RT-006: cache -> live -> recorded -> default, never silent)
// Forced to the node environment: recorded.ts resolves its file path from
// import.meta.url, which jsdom/vite-plugin-svelte rewrite to a virtual "/@fs/..."
// URL under the default jsdom environment, breaking the relative file read.
import { describe, it, expect } from "vitest";
import type Anthropic from "@anthropic-ai/sdk";
import { getBlueprint } from "@kyc/agent/src/fallback.js";
import { readRecordedBlueprint } from "@kyc/agent/src/recorded.js";
import { computeDefaultLayoutPlan } from "@kyc/core";
import { computePolicy } from "@kyc/core";
import { gbFeatures } from "@kyc/mocks";

function failingClient(): Anthropic {
  return {
    messages: {
      parse: async () => {
        throw new Error("simulated live failure");
      },
    },
  } as unknown as Anthropic;
}

describe("getBlueprint (RT-006 fallback chain)", () => {
  it("[RT-006] falls back to the recorded blueprint when the live call fails", async () => {
    const result = await getBlueprint({
      client: failingClient(),
      model: "claude-haiku-5-5",
      maxTokens: 100,
      geo: "GB",
      features: gbFeatures,
      cacheEnabled: false,
      injectUnknownComponentToggle: false,
      mode: "live",
    });
    expect(result.source).toBe("recorded");
    expect(result.fallbackReason).toContain("simulated live failure");
    expect(result.messages.length).toBeGreaterThan(0);
  });

  it("[RT-006] falls back to the core's deterministic default when no recording exists either", async () => {
    // readRecordedBlueprint resolves a real file path per geo; an unrecognised
    // geo has none on disk, which is exactly the "both prior steps failed" case.
    const recorded = await readRecordedBlueprint("ZZ" as never);
    expect(recorded).toBeNull();

    const defaultPlan = computeDefaultLayoutPlan(computePolicy(gbFeatures));
    expect(defaultPlan.steps).toHaveLength(1);
    expect(defaultPlan.steps[0]?.items.length).toBeGreaterThan(0);
  });

  it("[RT-006] forced recorded mode never calls the client", async () => {
    const result = await getBlueprint({
      client: failingClient(), // would throw if ever called
      model: "claude-haiku-5-5",
      maxTokens: 100,
      geo: "GB",
      features: gbFeatures,
      cacheEnabled: false,
      injectUnknownComponentToggle: false,
      mode: "recorded",
    });
    expect(result.source).toBe("recorded");
  });
});
