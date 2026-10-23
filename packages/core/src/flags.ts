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

// [FLG-002] The only place `.flags[...]` is indexed. Everything else (policy.ts,
// the shells) calls one of these named accessors instead of touching the raw
// dictionary — the thing that was off, but still on, was a raw flag read like
// this scattered across the codebase instead of funnelled through one place.
export function isNationalIdRequired(features: FeaturesResponse): boolean {
  return features.flags["kyc.field.national_id"] === true;
}

export function isOtpRequired(features: FeaturesResponse): boolean {
  return features.flags["kyc.step.otp"] === true;
}

export function isGovPrefillAvailable(features: FeaturesResponse): boolean {
  return features.flags["kyc.prefill.gov"] === true;
}

export function isResidencyExpiryRequired(features: FeaturesResponse): boolean {
  return features.flags["kyc.field.residency_expiry"] === true;
}

export function isLiteAvailable(features: FeaturesResponse): boolean {
  return features.flags["kyc.lite.available"] === true;
}
