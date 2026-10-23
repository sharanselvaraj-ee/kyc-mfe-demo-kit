// SLIDE: "A2UI: agents declare UI as data" (the live /api/agent/blueprint response: headers + JSONL)
import { createServer } from "node:http";
import process from "node:process";
import Anthropic from "@anthropic-ai/sdk";
import { GeoSchema } from "@kyc/contracts";
import { computePolicy } from "@kyc/core";
import { gbFeatures } from "@kyc/mocks";
import { requestLayoutPlan } from "./claude-client.js";
import { encodeLayoutPlanAsA2ui, toJsonl } from "./encode-a2ui.js";

try {
  process.loadEnvFile(new URL("../../../.env.local", import.meta.url));
} catch {
  // .env.local is optional (e.g. CI); real env vars still work.
}

const PORT = Number(process.env.KYC_AGENT_PORT ?? 8787);
const MODE = process.env.KYC_AGENT_MODE ?? "live";
const MODEL = process.env.KYC_AGENT_MODEL ?? "claude-haiku-5-5";
const MAX_TOKENS = Number(process.env.KYC_AGENT_MAX_TOKENS ?? 4096);
const TIMEOUT_MS = Number(process.env.KYC_AGENT_TIMEOUT_MS ?? 10000);

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

// Only GB has a fixture so far — IN/AE/SG arrive in Checkpoint 2.
const FIXTURES = { GB: gbFeatures } as const;

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
  const features = FIXTURES[geo as keyof typeof FIXTURES];
  if (!features) {
    res.writeHead(501, { "content-type": "application/json" }).end(
      JSON.stringify({ error: `no fixture for geo ${geo} yet` }),
    );
    return;
  }

  try {
    const policy = computePolicy(features);
    const result = await requestLayoutPlan(client, MODEL, MAX_TOKENS, geo, policy);
    const messages = encodeLayoutPlanAsA2ui(result.plan, `${geo}-personal-details`);

    res.writeHead(200, {
      "content-type": "application/x-ndjson",
      "x-agent-source": "live",
      "x-agent-model": result.model,
      "x-agent-latency-ms": String(result.latencyMs),
      "x-agent-input-tokens": String(result.inputTokens),
      "x-agent-output-tokens": String(result.outputTokens),
    });
    res.end(toJsonl(messages));
  } catch (error) {
    console.error("[agent] blueprint request failed:", error);
    res.writeHead(502, { "content-type": "application/json" }).end(
      JSON.stringify({ error: "live Claude call failed", detail: String(error) }),
    );
  }
});

server.listen(PORT, () => {
  console.log(`[agent] listening on :${PORT} (mode=${MODE}, model=${MODEL})`);
});
