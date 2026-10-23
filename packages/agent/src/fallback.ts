// SLIDE: "A2UI: agents declare UI as data" (RT-006 — cache -> live -> recorded -> default; never silent)
import type Anthropic from "@anthropic-ai/sdk";
import type { FeaturesResponse, Geo } from "@kyc/contracts";
import { computePolicy, computeDefaultLayoutPlan } from "@kyc/core";
import { requestLayoutPlan } from "./claude-client.js";
import { encodeLayoutPlanAsA2ui, injectUnknownComponent } from "./encode-a2ui.js";
import { readRecordedBlueprint } from "./recorded.js";
import { getCached, setCached } from "./cache.js";
import type { BlueprintResult } from "./fallback-types.js";

export interface GetBlueprintOptions {
  client: Anthropic;
  model: string;
  maxTokens: number;
  geo: Geo;
  features: FeaturesResponse;
  cacheEnabled: boolean;
  injectUnknownComponentToggle: boolean;
  /** CLAUDE.md §3: tests force this so they never call Claude. */
  mode: "live" | "recorded";
}

export async function getBlueprint(opts: GetBlueprintOptions): Promise<BlueprintResult> {
  const { client, model, maxTokens, geo, features, cacheEnabled, injectUnknownComponentToggle, mode } = opts;
  const policy = computePolicy(features);

  if (mode === "recorded") {
    const recorded = await readRecordedBlueprint(geo);
    if (recorded) return { source: "recorded", messages: recorded, fallbackReason: "KYC_AGENT_MODE=recorded" };
    const { messages } = encodeLayoutPlanAsA2ui(computeDefaultLayoutPlan(policy), geo);
    return { source: "default", messages, fallbackReason: `KYC_AGENT_MODE=recorded, no recording for ${geo}` };
  }

  // 1. cache (opt-in)
  if (cacheEnabled && !injectUnknownComponentToggle) {
    const cached = getCached(geo);
    if (cached) return { ...cached, source: "cache" };
  }

  // 2. live
  try {
    const result = await requestLayoutPlan(client, model, maxTokens, geo, policy);
    const { surfaceIds, messages } = encodeLayoutPlanAsA2ui(result.plan, geo);
    const finalMessages = injectUnknownComponentToggle ? injectUnknownComponent(messages, surfaceIds) : messages;
    const blueprint: BlueprintResult = {
      source: "live",
      messages: finalMessages,
      model: result.model,
      latencyMs: result.latencyMs,
      inputTokens: result.inputTokens,
      outputTokens: result.outputTokens,
    };
    if (cacheEnabled && !injectUnknownComponentToggle) setCached(geo, blueprint);
    return blueprint;
  } catch (liveError) {
    const fallbackReason = liveError instanceof Error ? liveError.message : String(liveError);
    console.warn(`[agent] live call failed for ${geo}, falling back:`, fallbackReason);

    // 3. recorded
    const recorded = await readRecordedBlueprint(geo);
    if (recorded) {
      return { source: "recorded", messages: recorded, fallbackReason };
    }

    // 4. core's deterministic default
    console.warn(`[agent] no recording for ${geo} either, using the deterministic default layout`);
    const { messages } = encodeLayoutPlanAsA2ui(computeDefaultLayoutPlan(policy), geo);
    return { source: "default", messages, fallbackReason };
  }
}
