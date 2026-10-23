// SLIDE: "Headless core: logic without a framework" (validation messages, traced to scenario IDs)
import type { FeaturesResponse } from "@kyc/contracts";

export type Values = Record<string, string | boolean>;

function parseDateOnly(value: string): Date | null {
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

/** [ONB-NAME-001] */
function validateName(value: string): string | null {
  if (value.trim().length < 2) return "Enter your full name";
  return null;
}

/** [ONB-DOB-001][ONB-DOB-002] */
function validateDateOfBirth(value: string, minAgeYears: number): string | null {
  if (!value) return "Enter your date of birth";
  const dob = parseDateOnly(value);
  if (!dob) return "Enter your date of birth";
  const today = new Date();
  if (dob.getTime() > today.getTime()) return "Date of birth cannot be in the future";
  const minBirthDate = new Date(today);
  minBirthDate.setFullYear(minBirthDate.getFullYear() - minAgeYears);
  if (dob.getTime() > minBirthDate.getTime()) return `You must be at least ${minAgeYears} to apply`;
  return null;
}

/** [ONB-ID-001] */
function validateNationalId(value: string, pattern: string | null): string | null {
  if (!pattern) return null;
  if (!new RegExp(pattern).test(value)) return "Enter a valid ID number (illustrative format)";
  return null;
}

/** [ONB-ADDR-001] */
function validatePostcode(value: string, pattern: string | null): string | null {
  if (!pattern) return null;
  if (!new RegExp(pattern, "i").test(value)) return "Enter a valid postcode";
  return null;
}

/** [ONB-OTP-001] */
function validateOtpCode(value: string): string | null {
  if (value !== "123456") return "That code didn't match";
  return null;
}

/** [ONB-RES-001] */
function validateResidencyExpiry(value: string): string | null {
  if (!value) return "Enter the residency permit expiry date";
  const expiry = parseDateOnly(value);
  const today = parseDateOnly(new Date().toISOString().slice(0, 10));
  if (!expiry || !today || expiry.getTime() <= today.getTime()) {
    return "Your residency permit must be valid";
  }
  return null;
}

function requiredText(value: string, message: string): string | null {
  return value.trim().length === 0 ? message : null;
}

/** [ONB-FLOW-001] Validates one field; returns an error message or null. Required fields are decided by `core/policy.ts`. */
export function validateField(fieldId: string, value: string, features: FeaturesResponse): string | null {
  switch (fieldId) {
    case "name":
      return validateName(value);
    case "dateOfBirth":
      return validateDateOfBirth(value, features.config.minAgeYears);
    case "nationalId":
      return validateNationalId(value, features.config.nationalIdPattern);
    case "addressLine1":
      return requiredText(value, "Enter your address");
    case "city":
      return requiredText(value, "Enter your city");
    case "postcode":
      return validatePostcode(value, features.config.postcodePattern);
    case "document":
      return requiredText(value, "Upload an identity document");
    case "otpCode":
      return validateOtpCode(value);
    case "residencyExpiry":
      return validateResidencyExpiry(value);
    default:
      return null;
  }
}

/** [ONB-SUBMIT-002] */
export function validateConsent(checked: boolean): string | null {
  return checked ? null : "You need to agree before we can continue";
}
