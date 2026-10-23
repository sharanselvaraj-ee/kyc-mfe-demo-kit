<!-- SLIDE: "What the demo showed, and what it didn't" (honest limits observed while building) -->
# Limits

Honest gaps between what the spec describes and what's built so far. Updated at each checkpoint.

## As of Checkpoint 1 (thin GB slice)

- **No nested layout yet.** The A2UI encoding only emits a flat list of sibling field components (no `Row`/`Column` containers, no `children` resolution, no `updateDataModel`). Fine for one "Personal details" screen with two fields; revisit when a step needs grouping.
- **No shadow DOM.** `<kyc-onboarding>` renders into light DOM. Shadow-DOM isolation and CSS custom-property theming is MFE-004, scoped to M2.
- **No catalog negotiation handshake.** The real A2UI protocol has the client advertise `supportedCatalogIds` and the agent pick one. We hardcode a single matching `catalogId` (`kyc-catalog-v1`) on both sides instead, since there's only one catalog.
- **Claude's `component`/`fieldId` enum restriction is a soft hint, not a hard schema constraint.** `@anthropic-ai/sdk@1.1.0`'s `zodOutputFormat()` flattens `z.enum(...)` into the JSON schema's `description` text rather than emitting a JSON-Schema `enum` keyword (traced in `transform-json-schema.js`). The real backstop is the browser's own catalog/policy validation (RT-002/RT-003), which does reject anything Claude invents — so the zero-trust property holds, but the server-side schema is weaker than CLAUDE.md's "component restricted to an enum" literally implies. See `docs/VERSIONS.md` Checkpoint 1 log.
- **No fallback chain yet (RT-006).** The agent only does a live Claude call; a failure returns a 502, it doesn't fall back to cache/recorded/default. That's Checkpoint 2 scope.
- **Only GB has a fixture.** IN/AE/SG fixtures, and the full 7-primitive catalog, arrive in Checkpoint 2.
- **No persistence, validation messages, submit flow, or loader package yet.** The custom element is imported directly by the host; `packages/loader`'s full-vs-lite selection is Checkpoint 2.
- **One unresolved IDE-only TS diagnostic.** `packages/mfe-full/src/catalog.ts`'s `new Catalog(...)` call shows a tsserver error about argument types that doesn't match the `.d.ts` constructor signature we verified by hand, and doesn't reproduce running `tsc` in isolation either — looks like a tsserver/project-resolution quirk, not a real type error (runtime behavior is correct, confirmed in the browser). Revisit when `pnpm lint`/`tsc --noEmit` land in Checkpoint 2.
- **No per-package `tsconfig.json` or root-level `tsc --noEmit` wired up yet**, beyond `mfe-full`'s (needed for its JSX). Full strict type-checking across the workspace is part of `pnpm lint`/`pnpm verify`, Checkpoint 2 scope.

## As of Checkpoint 2 (all 4 geos, full onboarding flow, fallback chain)

Resolved from the Checkpoint 1 list above: all 4 geo fixtures exist and are flag-matrix-correct; all 7 primitives are written, compiled and (for the 5 field-bearing ones) live in the agent's catalog; the fallback chain (RT-006) is implemented and verified end to end (live → recorded → default, each with real failures forced); RT-002's inject-unknown-component toggle works via the host dev panel; `pnpm agent:record` exists and produced real recordings for all 4 geos; the full onboarding flow (step validation, file upload, OTP send button, government prefill, review & consent, submit) works end to end for every geo; `kyc:ready`/`kyc:step`/`kyc:submitted`/`kyc:error` events fire correctly and carry no personal data (MFE-002), visible in the host's dev panel event log.

Still open:
- **Heading is the only primitive deterministically exercised by the live path.** `Notice` is compiled, tested in isolation (once the primitive suite lands) and registered in the catalog, but nothing in the live flow renders one yet — there's no natural trigger for it in the current step set.
- **No nested layout / `updateDataModel` still.** Each step is still a flat sibling list (now including a deterministic `Heading`), not a tree. Field values are plain local React state, not an A2UI-bound data model.
- **No shadow DOM yet (MFE-004, M2 per milestones.md).**
- **No catalog negotiation handshake** (same simplification as Checkpoint 1 — single hardcoded `catalogId`).
- **Document upload is filename-only.** `uploadDocument` is called with just the filename (no real file bytes sent anywhere) — fine for a mocked API, but worth saying plainly: nothing validates file type/size client-side yet beyond the `accept` attribute (ONB-DOC-001's "only JPG, PNG or PDF up to 5 MB" isn't enforced in code).
- **OTP is a plain TextField, not a dedicated OTP input/countdown UI**, and there's no attempt-limit lockout yet (ONB-OTP-002 is M2).
- **No back-navigation value-preservation test**, though it works in practice (shared `values` state) — ONB-FLOW-002 is M2 scope.
- **"Simulate slow network" toggle isn't in the dev panel yet** — it needs `packages/loader`'s full-vs-lite selection logic to mean anything, which doesn't exist yet.
- **No loader, no lite bundle, no tests, no `pnpm verify` wiring yet.** All Checkpoint 2 scope not yet done as of this update — see the open items the kickoff prompt lists for "All of M1".
