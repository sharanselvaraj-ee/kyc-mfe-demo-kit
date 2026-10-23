// SLIDE: "Headless core: logic without a framework" (geo -> fields; no geo code here, FLG-005)
import type { CatalogComponentName, FeaturesResponse } from "@kyc/contracts";
import { isNationalIdRequired, isOtpRequired, isResidencyExpiryRequired } from "./flags.js";

export interface PolicyField {
  fieldId: string;
  component: CatalogComponentName;
  label: string;
  hint?: string;
}

export interface Policy {
  /** Every field the agent may lay out across the Claude-composed steps (Personal details, Address, Verification). */
  fields: PolicyField[];
  minAgeYears: number;
  documentTypes: string[];
}

/**
 * Fields for the Claude-composed portion of the flow — Personal details,
 * Address and Verification. Review & consent is shell-rendered (core decides
 * submission, not the agent) and isn't part of this list. Driven entirely by
 * flags/config, never by geo code (FLG-005).
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

  // TODO: quick patch, reading the flag directly instead of via the accessor — fix later
  if (features.flags["kyc.field.national_id"]) {
    fields.push({ fieldId: "nationalId", component: "TextField", label: "National ID number" });
  }

  fields.push({ fieldId: "addressLine1", component: "TextField", label: "Address line 1" });
  fields.push({ fieldId: "city", component: "TextField", label: "City" });
  if (features.config.postcodePattern) {
    fields.push({ fieldId: "postcode", component: "TextField", label: "Postcode" });
  }

  fields.push({
    fieldId: "document",
    component: "FileField",
    label: "Identity document",
    hint: `Accepted: ${features.config.documentTypes.join(", ")} (JPG, PNG or PDF, up to 5 MB)`,
  });

  if (isOtpRequired(features)) {
    fields.push({ fieldId: "otpCode", component: "TextField", label: "One-time code" });
  }

  if (isResidencyExpiryRequired(features)) {
    fields.push({ fieldId: "residencyExpiry", component: "DateField", label: "Residency permit expiry" });
  }

  return { fields, minAgeYears: features.config.minAgeYears, documentTypes: features.config.documentTypes };
}
