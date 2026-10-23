// SLIDE: "A2UI: agents declare UI as data" (the live /api/agent/blueprint response: headers + JSONL)
import { createServer } from "node:http";
import process from "node:process";
import Anthropic from "@anthropic-ai/sdk";
import { GeoSchema } from "@kyc/contracts";
import { gbFeatures, inFeatures, aeFeatures, sgFeatures } from "@kyc/mocks";
import { getBlueprint } from "./fallback.js";
import { toJsonl } from "./encode-a2ui.js";

try {
  process.loadEnvFile(new URL("../../../.env.local", import.meta.url));
} catch {
  // .env.local is optional (e.g. CI); real env vars still work.
}

const PORT = Number(process.env.KYC_AGENT_PORT ?? 8787);
const MODE = (process.env.KYC_AGENT_MODE ?? "live") as "live" | "recorded";
const MODEL = process.env.KYC_AGENT_MODEL ?? "claude-haiku-5-5";
const MAX_TOKENS = Number(process.env.KYC_AGENT_MAX_TOKENS ?? 4096);
const TIMEOUT_MS = Number(process.env.KYC_AGENT_TIMEOUT_MS ?? 10000);
const CACHE_ENABLED = process.env.KYC_AGENT_CACHE === "on";

if (MODE === "live" && !process.env.ANTHROPIC_API_KEY) {
  console.error(
    "KYC_AGENT_MODE=live but ANTHROPIC_API_KEY is not set. Copy .env.example to .env.local and add your key.",
  );
  process.exit(1);
}

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  timeout: TIMEOUT_MS,
  maxRetries: 1,
});

const FIXTURES = { GB: gbFeatures, IN: inFeatures, AE: aeFeatures, SG: sgFeatures };

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);

  if (req.method !== "GET" || url.pathname !== "/api/agent/blueprint") {
    res.writeHead(404).end();
    return;
  }

  const geoResult = GeoSchema.safeParse(url.searchParams.get("geo"));
  if (!geoResult.success) {
    res.writeHead(400, { "content-type": "application/json" }).end(
      JSON.stringify({ error: "geo query param must be one of GB, IN, AE, SG" }),
    );
    return;
  }
  const geo = geoResult.data;
  const features = FIXTURES[geo];
  const injectUnknownComponentToggle = url.searchParams.get("inject-unknown") === "1";

  const blueprint = await getBlueprint({
    client,
    model: MODEL,
    maxTokens: MAX_TOKENS,
    geo,
    features,
    cacheEnabled: CACHE_ENABLED,
    injectUnknownComponentToggle,
    mode: MODE,
  });

  const headers: Record<string, string> = {
    "content-type": "application/x-ndjson",
    "x-agent-source": blueprint.source,
  };
  if (blueprint.model) headers["x-agent-model"] = blueprint.model;
  if (blueprint.latencyMs !== undefined) headers["x-agent-latency-ms"] = String(blueprint.latencyMs);
  if (blueprint.inputTokens !== undefined) headers["x-agent-input-tokens"] = String(blueprint.inputTokens);
  if (blueprint.outputTokens !== undefined) headers["x-agent-output-tokens"] = String(blueprint.outputTokens);
  if (blueprint.fallbackReason) headers["x-agent-fallback-reason"] = blueprint.fallbackReason;

  res.writeHead(200, headers);
  res.end(toJsonl(blueprint.messages));
});

server.listen(PORT, () => {
  console.log(`[agent] listening on :${PORT} (mode=${MODE}, model=${MODEL}, cache=${CACHE_ENABLED})`);
});
