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
