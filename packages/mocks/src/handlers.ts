// SLIDE: "Two cadences, one architecture: shell and slot" (MSW mocks everything except the agent)
import { http, HttpResponse, passthrough } from "msw";
import { gbFeatures } from "./fixtures/gb.js";
import { inFeatures } from "./fixtures/in.js";
import { aeFeatures } from "./fixtures/ae.js";
import { sgFeatures } from "./fixtures/sg.js";
import type { Geo } from "@kyc/contracts";

const FIXTURES: Record<Geo, typeof gbFeatures> = {
  GB: gbFeatures,
  IN: inFeatures,
  AE: aeFeatures,
  SG: sgFeatures,
};

let uploadCounter = 0;
let submissionCounter = 0;

export const handlers = [
  http.get("/api/agent/*", () => passthrough()),

  http.get("/api/features", ({ request }) => {
    const geo = new URL(request.url).searchParams.get("geo") as Geo | null;
    const fixture = geo ? FIXTURES[geo] : undefined;
    if (!fixture) {
      return HttpResponse.json({ error: `no fixture for geo ${geo}` }, { status: 404 });
    }
    return HttpResponse.json(fixture);
  }),

  // [ONB-DOC-001] mocked upload: a short simulated delay, then a documentId.
  http.post("/api/kyc/upload", async () => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    uploadCounter += 1;
    return HttpResponse.json({ documentId: `doc_${uploadCounter}` });
  }),

  // [ONB-OTP-001] mocked send — the code itself (123456) is checked client-side.
  http.post("/api/kyc/otp/request", () => HttpResponse.json({ sent: true })),

  // [ONB-PREFILL-001] a hardcoded mock government record.
  http.get("/api/kyc/prefill", () =>
    HttpResponse.json({ name: "Jamie Rivera", dateOfBirth: "1990-05-14", nationalId: "123456789012" }),
  ),

  // [ONB-SUBMIT-001] always succeeds for now; the "simulate error" toggle is M2 (ONB-ERR-001).
  http.post("/api/kyc/submissions", () => {
    submissionCounter += 1;
    return HttpResponse.json({ referenceId: `ref_${submissionCounter}` });
  }),
];
