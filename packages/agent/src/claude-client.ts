// SLIDE: "A2UI: agents declare UI as data" (Claude returns a layout plan, not markup)
import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { buildLayoutPlanSchema, type LayoutPlan } from "@kyc/contracts";
import type { Policy } from "@kyc/core";
import { CATALOG } from "@kyc/catalog";

export interface ClaudeLayoutResult {
  plan: LayoutPlan;
  model: string;
  latencyMs: number;
  inputTokens: number;
  outputTokens: number;
}

const CATALOG_DESCRIPTIONS = Object.values(CATALOG)
  .map((entry) => `- ${entry.name}: ${entry.description}`)
  .join("\n");

const SYSTEM_PROMPT = `You arrange a KYC onboarding form's layout for a single screen ("Personal details").
You do not decide which fields exist — that comes from the policy in the user message.
You may only use these catalog components:
${CATALOG_DESCRIPTIONS}

Rules:
- Every item's "component" must be one of the catalog names above.
- Every item's "fieldId" must be one of the policy's field IDs given in the request — never invent one.
- Group items into one or more steps with short, plain titles.
- Labels and hints must be plain, user-facing text (no markup).`;

export async function requestLayoutPlan(
  client: Anthropic,
  model: string,
  maxTokens: number,
  geo: string,
  policy: Policy,
): Promise<ClaudeLayoutResult> {
  const componentNames = Object.keys(CATALOG) as [string, ...string[]];
  const fieldIds = policy.fields.map((f) => f.fieldId) as [string, ...string[]];
  const schema = buildLayoutPlanSchema(componentNames, fieldIds);

  const userMessage = [
    `Geo: ${geo}`,
    `Policy fields (fieldId: suggested label — hint):`,
    ...policy.fields.map((f) => `- ${f.fieldId}: ${f.label}${f.hint ? ` — ${f.hint}` : ""}`),
  ].join("\n");

  const start = Date.now();
  const response = await client.messages.parse({
    model,
    max_tokens: maxTokens,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
    output_config: { format: zodOutputFormat(schema) },
  });
  const latencyMs = Date.now() - start;

  if (response.stop_reason === "refusal") {
    throw new Error("Claude refused the layout request");
  }
  if (response.stop_reason === "max_tokens") {
    throw new Error("Claude's layout response was truncated (max_tokens)");
  }
  if (!response.parsed_output) {
    throw new Error("Claude's layout response did not parse against the schema");
  }

  return {
    plan: response.parsed_output,
    model: response.model,
    latencyMs,
    inputTokens: response.usage.input_tokens,
    outputTokens: response.usage.output_tokens,
  };
}
