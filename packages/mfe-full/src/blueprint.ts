// SLIDE: "A2UI: agents declare UI as data" (plain streamed fetch of JSONL — the AG-UI decision)
export async function fetchBlueprint(geo: string, apiBase: string): Promise<unknown[]> {
  const response = await fetch(`${apiBase}/agent/blueprint?geo=${geo}`);
  console.info(
    `[kyc-onboarding] blueprint source=${response.headers.get("x-agent-source")} model=${response.headers.get("x-agent-model")} latencyMs=${response.headers.get("x-agent-latency-ms")} tokens(in/out)=${response.headers.get("x-agent-input-tokens")}/${response.headers.get("x-agent-output-tokens")}`,
  );
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`blueprint request failed (${response.status}): ${body}`);
  }
  const text = await response.text();
  return text
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => JSON.parse(line));
}
