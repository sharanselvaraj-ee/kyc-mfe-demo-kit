// DEMO (deliberate CI failure #3): a new test tagged with a scenario ID that
// was never added to any openspec/specs/**/spec.md file. The assertion itself
// is fine — pnpm test passes — but pnpm trace fails, because TRC-001 requires
// every tagged ID to be a real scenario the spec actually defines. This is the
// "someone wrote a test for behaviour the spec never asked for" failure mode,
// distinct from the FLG-002 lint failure and the ONB-NAME-001 test failure
// already on this PR.
import { describe, it, expect } from "vitest";
import { validateField } from "@kyc/core";
import { gbFeatures } from "@kyc/mocks";

describe("an extra validation rule nobody put in the spec", () => {
  it("[ONB-NAME-002] also rejects a name that is all whitespace", () => {
    expect(validateField("name", "   ", gbFeatures)).toBe("Enter your full name");
  });
});
