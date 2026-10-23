<!-- SLIDE: "Two cadences, one architecture: shell and slot" (the as-built picture) -->
# Architecture

One living spec (`openspec/specs/`) drives two build cadences that share the same core, catalog and agent — only *when* Claude is called differs.

```
                         openspec/  (scenarios, flag matrix, milestones)
                               │
      packages/contracts (Zod) ── packages/core (flags.ts, policy.ts,
                                   validation.ts, machine.ts, api.ts)
                                         │ geo policy (fields only)
   CADENCE 2 · BUILD TIME                ▼                  CADENCE 1 · RUN TIME
   packages/ir: 7 primitives      packages/agent (Node, :8787)
   (Mitosis .lite.tsx)                 │ live Claude → layout plan (structured output)
         │ pnpm ir:build               │ encode-a2ui.ts → A2UI v0.9 JSONL
   ┌─────┴──────┐                      │ fallback: cache → live → recorded → default
 gen/react   gen/svelte          GET /api/agent/blueprint?geo=
   │             │                  (headers: source, model, latency, tokens)
   │             │                         │
   │             └──▶ packages/mfe-lite ◀──┤ pnpm lite:bake calls the SAME agent
   │                  <kyc-onboarding-lite>│ logic once, at build time, for IN
   │                  (Svelte 5, legacy)   │
   └──▶ packages/catalog (React allowlist) │
            │                             ▼
            └──▶ packages/mfe-full ◀── live JSONL stream
                 <kyc-onboarding> (React)
                       │
            packages/loader (chooseVariant: LITE-001)
                       │
            apps/host (plain HTML/TS, MSW mocks, dev panel)
```

## The one thing to remember

**Same agent, same primitives, same A2UI blueprint format serve both cadences.** The full React shell calls `packages/agent` live, per page load, and streams the result. The lite Svelte shell gets the *identical* kind of blueprint, but baked into the bundle at build time (`pnpm lite:bake`) — so the slow-network path never makes a runtime Claude call. `packages/loader` is the only thing that decides which one a visitor gets (`chooseVariant`, LITE-001): geo eligibility (from a build-time manifest generated off the flag matrix) plus a slow-connection signal, a `variant="lite"` attribute, or `?kyc-lite=1`.

## Zero-trust boundary

Claude never sees user data (RT-007) and never ships code (RT-005): it returns a small **layout plan** (steps → `{component, fieldId, label, hint?}`), restricted per request to catalog names and that geo's policy fields. The agent deterministically encodes that plan as A2UI messages — `encode-a2ui.ts` is the one place direct A2UI generation by the model could be tried later. The browser treats every blueprint as untrusted regardless of who built it: `@a2ui/web_core`'s `MessageProcessor` + `Catalog` validate component types and props again (RT-002/RT-003) against the exact same catalog the server used, and the core's policy check rejects a blueprint missing a required field (RT-004).

## Flags: the one war story

Every behavioural difference between GB/IN/AE/SG comes from `GET /features?geo=` and is read in exactly one place, `packages/core/src/flags.ts` — enforced by a real ESLint rule (`pnpm lint`), not just convention. `policy.ts` and the shells call named accessors (`isNationalIdRequired(features)`, etc.), never `features.flags["..."]` directly. No file anywhere branches on a geo code; the fixture (`packages/mocks`) is the only place `"GB"`/`"IN"`/`"AE"`/`"SG"` appear outside tests.

## What verifies this

`pnpm verify` = `lint` (the flags rule + no-eval/no-`dangerouslySetInnerHTML`) → `test` (primitive suite on both Mitosis targets, contract tests against fixtures/recordings/the fallback chain) → `trace` (every M1 scenario ID has a tagged test) → `size` (bundle-size reporting) → `test:e2e` (one Playwright smoke test per geo, `KYC_AGENT_MODE=recorded`, never calls Claude). See `docs/LIMITS.md` for what's deliberately not built yet.
