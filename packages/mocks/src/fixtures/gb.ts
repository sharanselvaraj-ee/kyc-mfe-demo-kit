// SLIDE: "The flag that was off, but still on" (one fixture per geo, matching the flag matrix)
import { FeaturesResponseSchema, type FeaturesResponse } from "@kyc/contracts";

export const gbFeatures: FeaturesResponse = FeaturesResponseSchema.parse({
  geo: "GB",
  schemaVersion: 1,
  flags: {
    "kyc.field.national_id": false,
    "kyc.step.otp": false,
    "kyc.prefill.gov": false,
    "kyc.field.residency_expiry": false,
    "kyc.lite.available": false,
  },
  config: {
    minAgeYears: 18,
    postcodePattern: "^[A-Z]{1,2}\\d[A-Z\\d]? ?\\d[A-Z]{2}$",
    nationalIdPattern: null,
    documentTypes: ["passport", "driving_licence"],
  },
});
