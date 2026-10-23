// SLIDE: "Headless core: logic without a framework" (the only place flags are read, FLG-002)
import { FeaturesResponseSchema, type FeaturesResponse, type Geo } from "@kyc/contracts";

export async function fetchFeatures(geo: Geo, apiBase: string): Promise<FeaturesResponse> {
  const response = await fetch(`${apiBase}/features?geo=${geo}`);
  if (!response.ok) {
    throw new Error(`GET /features?geo=${geo} failed with ${response.status}`);
  }
  const body = await response.json();
  return FeaturesResponseSchema.parse(body);
}
