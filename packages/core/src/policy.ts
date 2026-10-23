// SLIDE: "Headless core: logic without a framework" (geo -> fields; no geo code here, FLG-005)
import type { CatalogComponentName } from "@kyc/contracts";
import type { FeaturesResponse } from "@kyc/contracts";

export interface PolicyField {
  fieldId: string;
  component: CatalogComponentName;
  label: string;
  hint?: string;
}

export interface Policy {
  fields: PolicyField[];
}

/**
 * Personal-details fields for the current M1 thin slice. Driven entirely by
 * flags/config, never by geo code (FLG-005) — a new geo changes the fixture,
 * not this function.
 */
export function computePolicy(features: FeaturesResponse): Policy {
  const fields: PolicyField[] = [
    { fieldId: "name", component: "TextField", label: "Full name" },
    {
      fieldId: "dateOfBirth",
      component: "DateField",
      label: "Date of birth",
      hint: `You must be at least ${features.config.minAgeYears} to apply`,
    },
  ];

  if (features.flags["kyc.field.national_id"]) {
    fields.push({ fieldId: "nationalId", component: "TextField", label: "National ID number" });
  }

  return { fields };
}
