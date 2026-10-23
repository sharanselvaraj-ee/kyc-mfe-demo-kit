// SLIDE: "The flag that was off, but still on" (one fixture per geo, matching the flag matrix)
import { FeaturesResponseSchema, type FeaturesResponse } from "@kyc/contracts";

export const sgFeatures: FeaturesResponse = FeaturesResponseSchema.parse({
  geo: "SG",
  schemaVersion: 1,
  flags: {
    "kyc.field.national_id": true,
    "kyc.step.otp": false,
    "kyc.prefill.gov": true,
    "kyc.field.residency_expiry": false,
    "kyc.lite.available": false,
  },
  config: {
    minAgeYears: 18,
    postcodePattern: "^\\d{6}$",
    nationalIdPattern: "^[A-Z]\\d{7}[A-Z]$",
    documentTypes: ["passport", "national_id"],
  },
});
