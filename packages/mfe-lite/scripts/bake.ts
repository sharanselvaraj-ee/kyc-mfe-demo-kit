// SLIDE: "Runtime streaming vs static compilation" (pnpm lite:bake — same agent, called at build time)
import { writeFile } from "node:fs/promises";
import process from "node:process";
import Anthropic from "@anthropic-ai/sdk";
import { computePolicy } from "@kyc/core";
import { inFeatures } from "@kyc/mocks";
// Build-time only: the bake script reuses the same agent logic that serves the
// runtime blueprint endpoint, so the lite bundle is provably the same agent,
// same catalog, same encoding — just called once, here, instead of per request.
// (A devDependency-only exception to the mfe-lite import list in CLAUDE.md §2 —
// see docs/VERSIONS.md.)
import { requestLayoutPlan } from "../../agent/src/claude-client.js";
import { encodeLayoutPlanAsA2ui, toJsonl } from "../../agent/src/encode-a2ui.js";

try {
  process.loadEnvFile(new URL("../../../.env.local", import.meta.url));
} catch {
  // optional
}

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY is not set — can't bake the lite blueprint. Set it in .env.local.");
  process.exit(1);
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const model = process.env.KYC_AGENT_MODEL ?? "claude-haiku-5-5";
const maxTokens = Number(process.env.KYC_AGENT_MAX_TOKENS ?? 4096);

const policy = computePolicy(inFeatures);
console.log("[lite:bake] requesting live layout for IN…");
const result = await requestLayoutPlan(client, model, maxTokens, "IN", policy);
const { messages } = encodeLayoutPlanAsA2ui(result.plan, "IN");

const outPath = new URL("../src/blueprint.generated.jsonl", import.meta.url);
await writeFile(outPath, toJsonl(messages));
console.log(`[lite:bake] wrote ${outPath.pathname} (${result.latencyMs}ms, ${result.inputTokens}/${result.outputTokens} tokens)`);
