// SLIDE: "The flag that was off, but still on" (one fixture per geo, matching the flag matrix)
import { FeaturesResponseSchema, type FeaturesResponse } from "@kyc/contracts";

export const inFeatures: FeaturesResponse = FeaturesResponseSchema.parse({
  geo: "IN",
  schemaVersion: 1,
  flags: {
    "kyc.field.national_id": true,
    "kyc.step.otp": true,
    "kyc.prefill.gov": false,
    "kyc.field.residency_expiry": false,
    "kyc.lite.available": true,
  },
  config: {
    minAgeYears: 18,
    postcodePattern: "^\\d{6}$",
    nationalIdPattern: "^\\d{12}$",
    documentTypes: ["passport", "national_id"],
  },
});
