// SLIDE: "Anatomy of a living spec" (every fixture is enforced by the Zod schema — FLG-003)
import { describe, it, expect } from "vitest";
import { FeaturesResponseSchema, GeoSchema, type Geo } from "@kyc/contracts";
import { gbFeatures, inFeatures, aeFeatures, sgFeatures } from "@kyc/mocks";
import { computePolicy } from "@kyc/core";

const FIXTURES: Record<Geo, unknown> = { GB: gbFeatures, IN: inFeatures, AE: aeFeatures, SG: sgFeatures };

describe("every /features fixture", () => {
  for (const geo of GeoSchema.options) {
    it(`[FLG-003] ${geo} parses against FeaturesResponseSchema`, () => {
      const result = FeaturesResponseSchema.safeParse(FIXTURES[geo]);
      expect(result.success).toBe(true);
    });

    it(`[FLG-005] ${geo}'s policy has no geo-specific branching artefacts (name + dateOfBirth always present)`, () => {
      const parsed = FeaturesResponseSchema.parse(FIXTURES[geo]);
      const policy = computePolicy(parsed);
      const fieldIds = policy.fields.map((f) => f.fieldId);
      expect(fieldIds).toContain("name");
      expect(fieldIds).toContain("dateOfBirth");
    });
  }

  it("[FLG-003] every flag the policy depends on is present for every geo, true or false", () => {
    const depended = [
      "kyc.field.national_id",
      "kyc.step.otp",
      "kyc.prefill.gov",
      "kyc.field.residency_expiry",
      "kyc.lite.available",
    ];
    for (const geo of GeoSchema.options) {
      const parsed = FeaturesResponseSchema.parse(FIXTURES[geo]);
      for (const flag of depended) {
        expect(typeof parsed.flags[flag]).toBe("boolean");
      }
    }
  });
});
