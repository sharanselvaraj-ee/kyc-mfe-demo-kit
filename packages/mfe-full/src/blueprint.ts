// SLIDE: "A2UI: agents declare UI as data" (plain streamed fetch of JSONL — the AG-UI decision)
export interface BlueprintFetchResult {
  messages: unknown[];
  surfaceIds: string[];
  headers: {
    source: string | null;
    model: string | null;
    latencyMs: string | null;
    inputTokens: string | null;
    outputTokens: string | null;
    fallbackReason: string | null;
  };
}

export async function fetchBlueprint(
  geo: string,
  apiBase: string,
  options?: { injectUnknownComponent?: boolean },
): Promise<BlueprintFetchResult> {
  const query = options?.injectUnknownComponent ? "&inject-unknown=1" : "";
  const response = await fetch(`${apiBase}/agent/blueprint?geo=${geo}${query}`);
  const headers = {
    source: response.headers.get("x-agent-source"),
    model: response.headers.get("x-agent-model"),
    latencyMs: response.headers.get("x-agent-latency-ms"),
    inputTokens: response.headers.get("x-agent-input-tokens"),
    outputTokens: response.headers.get("x-agent-output-tokens"),
    fallbackReason: response.headers.get("x-agent-fallback-reason"),
  };
  console.info(`[kyc-onboarding] blueprint source=${headers.source} model=${headers.model} latencyMs=${headers.latencyMs}`);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`blueprint request failed (${response.status}): ${body}`);
  }
  const text = await response.text();
  const messages: unknown[] = text
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line));

  const surfaceIds = messages
    .map((message) => (message as { createSurface?: { surfaceId: string } }).createSurface?.surfaceId)
    .filter((id): id is string => Boolean(id));

  return { messages, surfaceIds, headers };
}
