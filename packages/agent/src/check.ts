// pnpm agent:check — one tiny Claude call, prints model/latency/tokens, proves the key works.
import process from "node:process";
import Anthropic from "@anthropic-ai/sdk";

try {
  process.loadEnvFile(new URL("../../../.env.local", import.meta.url));
} catch {
  // optional
}

const model = process.env.KYC_AGENT_MODEL ?? "claude-haiku-5-5";
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const start = Date.now();
const response = await client.messages.create({
  model,
  max_tokens: 32,
  messages: [{ role: "user", content: "Reply with exactly the word: pong" }],
});
const latencyMs = Date.now() - start;

console.log(
  JSON.stringify(
    {
      model: response.model,
      latencyMs,
      stopReason: response.stop_reason,
      inputTokens: response.usage.input_tokens,
      outputTokens: response.usage.output_tokens,
    },
    null,
    2,
  ),
);
