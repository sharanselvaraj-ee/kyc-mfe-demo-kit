// SLIDE: "Headless core: logic without a framework" (the mocked KYC API client, against the real MSW handlers)
import { describe, it, expect, beforeAll, afterAll, afterEach } from "vitest";
import { setupServer } from "msw/node";
import { handlers } from "@kyc/mocks";
import { uploadDocument, requestOtp, fetchPrefill, submitKyc } from "@kyc/core";

const server = setupServer(...handlers);
beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

describe("mocked KYC API (packages/mocks' real handlers)", () => {
  it("[ONB-DOC-001] upload returns a documentId after a simulated delay", async () => {
    const result = await uploadDocument("/api", "passport.pdf");
    expect(result.documentId).toMatch(/^doc_/);
  });

  it("[ONB-OTP-001] requesting a code succeeds (the code 123456 itself is checked client-side)", async () => {
    await expect(requestOtp("/api")).resolves.toBeUndefined();
  });

  it("[ONB-PREFILL-001] prefill returns a hardcoded mock government record", async () => {
    const record = await fetchPrefill("/api");
    expect(record.name).toBeTruthy();
    expect(record.dateOfBirth).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("[ONB-SUBMIT-001] submission returns a referenceId", async () => {
    const result = await submitKyc("/api", { geo: "GB", values: { name: "Ada" }, consent: true });
    expect(result.referenceId).toMatch(/^ref_/);
  });
});
