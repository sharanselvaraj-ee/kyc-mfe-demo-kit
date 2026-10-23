// SLIDE: "Headless core: logic without a framework" (validation messages, traced to scenario IDs)
import { describe, it, expect } from "vitest";
import { validateField, validateConsent } from "@kyc/core";
import { gbFeatures, inFeatures, aeFeatures } from "@kyc/mocks";

describe("validateField", () => {
  it("[ONB-NAME-001] rejects a name shorter than 2 characters after trimming", () => {
    expect(validateField("name", " a ", gbFeatures)).toBe("Enter your full name");
    expect(validateField("name", "Ada", gbFeatures)).toBeNull();
  });

  it("[ONB-DOB-001] requires a date of birth", () => {
    expect(validateField("dateOfBirth", "", gbFeatures)).toBe("Enter your date of birth");
  });

  it("[ONB-DOB-002] rejects a future date and under-age applicants", () => {
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    expect(validateField("dateOfBirth", future.toISOString().slice(0, 10), gbFeatures)).toBe(
      "Date of birth cannot be in the future",
    );
    expect(validateField("dateOfBirth", "2020-01-01", gbFeatures)).toBe("You must be at least 18 to apply");
    expect(validateField("dateOfBirth", "1990-01-01", gbFeatures)).toBeNull();
  });

  it("[ONB-ID-001] validates the national ID against the geo's illustrative pattern", () => {
    expect(validateField("nationalId", "abc", inFeatures)).toBe("Enter a valid ID number (illustrative format)");
    expect(validateField("nationalId", "123456789012", inFeatures)).toBeNull();
  });

  it("[ONB-ADDR-001] validates the postcode against the geo's pattern, skipped when the geo has none", () => {
    expect(validateField("postcode", "not a postcode", gbFeatures)).toBe("Enter a valid postcode");
    expect(validateField("postcode", "SW1A 2AA", gbFeatures)).toBeNull();
    expect(validateField("postcode", "anything", aeFeatures)).toBeNull(); // AE has no postcodePattern
  });

  it("[ONB-DOC-001] requires a document to have been selected", () => {
    expect(validateField("document", "", gbFeatures)).toBe("Upload an identity document");
    expect(validateField("document", "passport.pdf", gbFeatures)).toBeNull();
  });

  it("[ONB-OTP-001] accepts only the mocked code 123456", () => {
    expect(validateField("otpCode", "000000", inFeatures)).toBe("That code didn't match");
    expect(validateField("otpCode", "123456", inFeatures)).toBeNull();
  });

  it("[ONB-RES-001] rejects a residency expiry that is today or earlier", () => {
    expect(validateField("residencyExpiry", new Date().toISOString().slice(0, 10), aeFeatures)).toBe(
      "Your residency permit must be valid",
    );
    const future = new Date();
    future.setFullYear(future.getFullYear() + 1);
    expect(validateField("residencyExpiry", future.toISOString().slice(0, 10), aeFeatures)).toBeNull();
  });
});

describe("validateConsent", () => {
  it("[ONB-SUBMIT-002] requires consent before submission", () => {
    expect(validateConsent(false)).toBe("You need to agree before we can continue");
    expect(validateConsent(true)).toBeNull();
  });
});
