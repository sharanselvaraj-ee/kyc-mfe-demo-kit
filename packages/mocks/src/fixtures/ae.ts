// SLIDE: "The flag that was off, but still on" (one fixture per geo, matching the flag matrix)
import { FeaturesResponseSchema, type FeaturesResponse } from "@kyc/contracts";

export const aeFeatures: FeaturesResponse = FeaturesResponseSchema.parse({
  geo: "AE",
  schemaVersion: 1,
  flags: {
    "kyc.field.national_id": true,
    "kyc.step.otp": false,
    "kyc.prefill.gov": false,
    "kyc.field.residency_expiry": true,
    "kyc.lite.available": false,
  },
  config: {
    minAgeYears: 21,
    postcodePattern: null,
    nationalIdPattern: "^\\d{15}$",
    documentTypes: ["passport", "national_id"],
  },
});
