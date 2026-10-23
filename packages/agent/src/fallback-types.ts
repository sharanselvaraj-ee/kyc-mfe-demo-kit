export interface BlueprintResult {
  source: "live" | "cache" | "recorded" | "default";
  messages: unknown[];
  model?: string;
  latencyMs?: number;
  inputTokens?: number;
  outputTokens?: number;
  fallbackReason?: string;
}
