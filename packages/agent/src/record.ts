// SLIDE: "A2UI: agents declare UI as data" (RT-008 — recordings refreshed from real runs)
import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import process from "node:process";
import Anthropic from "@anthropic-ai/sdk";
import { GeoSchema, type Geo } from "@kyc/contracts";
import { computePolicy } from "@kyc/core";
import { gbFeatures, inFeatures, aeFeatures, sgFeatures } from "@kyc/mocks";
import { requestLayoutPlan } from "./claude-client.js";
import { encodeLayoutPlanAsA2ui, toJsonl } from "./encode-a2ui.js";
import { recordedPath } from "./recorded.js";

try {
  process.loadEnvFile(new URL("../../../.env.local", import.meta.url));
} catch {
  // optional
}

const FIXTURES = { GB: gbFeatures, IN: inFeatures, AE: aeFeatures, SG: sgFeatures };
const ALL_GEOS: Geo[] = ["GB", "IN", "AE", "SG"];

const requested = process.argv.slice(2);
const geos: Geo[] = requested.length > 0 ? requested.map((g) => GeoSchema.parse(g)) : ALL_GEOS;

if (!process.env.ANTHROPIC_API_KEY) {
  console.error("ANTHROPIC_API_KEY is not set — can't record from live Claude. Set it in .env.local.");
  process.exit(1);
}

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
const model = process.env.KYC_AGENT_MODEL ?? "claude-haiku-5-5";
const maxTokens = Number(process.env.KYC_AGENT_MAX_TOKENS ?? 4096);

for (const geo of geos) {
  const features = FIXTURES[geo];
  const policy = computePolicy(features);
  console.log(`[agent:record] requesting live layout for ${geo}…`);
  const result = await requestLayoutPlan(client, model, maxTokens, geo, policy);
  const { messages } = encodeLayoutPlanAsA2ui(result.plan, geo);
  const path = fileURLToPath(recordedPath(geo));
  await mkdir(dirname(path), { recursive: true });
  await writeFile(path, toJsonl(messages));
  console.log(`[agent:record] wrote ${path} (${result.latencyMs}ms, ${result.inputTokens}/${result.outputTokens} tokens)`);
}
