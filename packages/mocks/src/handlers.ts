// SLIDE: "Two cadences, one architecture: shell and slot" (MSW mocks everything except the agent)
import { http, HttpResponse, passthrough } from "msw";
import { gbFeatures } from "./fixtures/gb.js";
import type { Geo } from "@kyc/contracts";

const FIXTURES: Partial<Record<Geo, typeof gbFeatures>> = {
  GB: gbFeatures,
};

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
];
