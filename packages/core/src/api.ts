// SLIDE: "Headless core: logic without a framework" (the mocked KYC API client)
import {
  UploadResponseSchema,
  PrefillResponseSchema,
  SubmissionResponseSchema,
  type KycSubmission,
} from "@kyc/contracts";

async function postJson<T>(url: string, body: unknown): Promise<unknown> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`${url} failed with ${response.status}`);
  }
  return (await response.json()) as T;
}

/** [ONB-DOC-001] */
export async function uploadDocument(apiBase: string, filename: string) {
  return UploadResponseSchema.parse(await postJson(`${apiBase}/kyc/upload`, { filename }));
}

/** [ONB-OTP-001] */
export async function requestOtp(apiBase: string) {
  await postJson(`${apiBase}/kyc/otp/request`, {});
}

/** [ONB-PREFILL-001] */
export async function fetchPrefill(apiBase: string) {
  const response = await fetch(`${apiBase}/kyc/prefill`);
  if (!response.ok) throw new Error(`GET ${apiBase}/kyc/prefill failed with ${response.status}`);
  return PrefillResponseSchema.parse(await response.json());
}

/** [ONB-SUBMIT-001] */
export async function submitKyc(apiBase: string, submission: KycSubmission) {
  return SubmissionResponseSchema.parse(await postJson(`${apiBase}/kyc/submissions`, submission));
}
