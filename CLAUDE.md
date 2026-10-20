# CLAUDE.md: rules for this repository

This repo is the live demo for the talk **"Post-Framework Frontends in the AI Era: Living Specs (SDD), Declarative Agent Protocols, and Framework-Agnostic Compilation"**. The code will be shown on a projector to engineers. Clarity beats cleverness.

## 0. Priorities, in order
1. **A running demo first.** Work milestone by milestone (`openspec/milestones.md`). Don't start M2 work during M1.
2. **Simple UI, generic parts.** Plain, one-column screens; native inputs; no animation; no component libraries. The dynamic UI uses seven generic primitives. Leave seams for later complexity (new primitives, richer styling, more steps), but don't build them now.
3. **Honesty over polish.** If something is a fallback, a mock or a limitation, the UI or `docs/LIMITS.md` says so.

## 1. The spec is the source of intent
- `openspec/specs/**/spec.md` is the source of truth. Every behaviour traces to a scenario ID (for example `ONB-DOB-002`).
- **Never edit `openspec/specs/` directly.** To change behaviour, create an OpenSpec change in `openspec/changes/<change-id>/` (proposal.md, tasks.md, spec deltas), validate it, and stop for human review.
- If the spec is ambiguous or contradictory, **stop and ask**, and log the question in `docs/OPEN-QUESTIONS.md`. Don't add behaviour the spec doesn't ask for.

## 2. Architecture (don't deviate without asking)
pnpm workspace, TypeScript strict.

| Package | Role | May import |
|---|---|---|
| `packages/contracts` | Zod schemas: `/features`, KYC submission, mock API responses, catalog primitive props, layout plan, A2UI message subset; `tokens.json` (DTCG) | zod |
| `packages/core` | **Headless core**: `flags.ts` (only flag reader), `policy.ts` (geo → fields, steps, rules), `validation.ts`, `machine.ts`, `api.ts`. No UI framework, no DOM | contracts |
| `packages/ir` | Mitosis `.lite.tsx` **generic primitives**: `Heading`, `Notice`, `TextField`, `DateField`, `SelectField`, `FileField`, `CheckboxField`. Presentational: props in, events out. Written by the agent from the spec | — |
| `packages/gen/react`, `packages/gen/svelte` | Mitosis output. **Generated, committed, never hand-edited** | — |
| `packages/catalog` | Allowlist: primitive name → generated React component + Zod prop schema + one-line description (the description is also what Claude sees) | gen/react, contracts |
| `packages/agent` | **Server-side Node service.** Calls Claude, validates the plan, encodes A2UI v0.9 JSONL, streams it. Owns the fallback chain and the recordings | contracts, core, catalog (schemas only) |
| `packages/mfe-full` | React shell + A2UI renderer → `<kyc-onboarding>` | core, catalog, contracts |
| `packages/mfe-lite` | Svelte 5 shell → `<kyc-onboarding-lite>`, with the blueprint baked at build time | core, gen/svelte, contracts |
| `packages/loader` | Tiny script: picks full vs lite, injects the bundle | build-time manifest only |
| `packages/mocks` | MSW handlers + hardcoded fixtures; recorded blueprints in `a2ui/recorded/` | contracts |
| `apps/host` | Dummy host page (plain HTML + TS) with a dev panel | loader, mocks |
| `tests/` | Shared primitive suite (adapter per target), contract tests, e2e, traceability | all |

Hard rules:
- **Flags are read only in `packages/core/src/flags.ts`.** An ESLint rule enforces it. No overrides anywhere else. This is the war-story fix, and it must be visible.
- **The agent arranges; the core decides.** The core's policy defines the fields. Claude's output schema is built per request, with `component` restricted to an enum of catalog names and `fieldId` to an enum of policy fields. The browser validates again anyway (RT-002 to RT-005).
- **No executable content crosses the agent boundary.** No `eval`, `new Function`, `dangerouslySetInnerHTML` or `{@html}` (lint).
- **No user data goes to the agent** (RT-007). The agent receives only the geo policy and the catalog descriptions.
- Business rules live in core, never in primitives, shells or the agent prompt.
- Mock data only. All ID formats and age limits are illustrative, and the UI shows the "Illustrative rules: demo only" badge.

## 3. Claude API (packages/agent)
Follow the official Claude API docs (platform.claude.com/docs). Re-check anything you're unsure of; don't rely on memory.
- **SDK:** `@anthropic-ai/sdk` (Node, server only). Never set `dangerouslyAllowBrowser`.
- **Secrets:** `ANTHROPIC_API_KEY` from `.env.local` (gitignored; `.env.example` is committed). Load it only in `packages/agent`. **Never** prefix with `VITE_`. Never log keys, request bodies containing keys, or full prompts at info level. A CI check greps the built browser bundles for the variable name.
- **Model:** `KYC_AGENT_MODEL` (default `claude-haiku-5-5`, the lowest-latency current model). Pin it; print it at startup; return it in `x-agent-model`.
- **Structured output:** use JSON-schema structured outputs (`output_config.format`). With Zod, use `zodOutputFormat()` + `client.messages.parse()`. The schema can't express min/max lengths or numeric bounds, so keep the schema simple and enforce extra constraints with Zod after parsing. Handle `stop_reason` of `refusal` or `max_tokens` as a failure, and use the fallback.
- **Shape:** Claude returns a small **layout plan**: steps → ordered items `{ component, fieldId, label, hint? }`. The server deterministically encodes the plan into A2UI v0.9 messages (`createSurface`, `updateComponents`, `updateDataModel`; confirm the names in Phase 0). Keep encoding in `encode-a2ui.ts`, a seam where direct A2UI generation by the model could be tried later.
- **Reliability:**
  - set the SDK `timeout` from `KYC_AGENT_TIMEOUT_MS` and `maxRetries: 1`
  - use the fallback chain in RT-006
  - put the static part of the prompt (role, rules, catalog descriptions) in the system prompt, so it can be prompt-cached if it's long enough
- **Observability:** response headers `x-agent-source` (live | cache | recorded | default), `x-agent-model`, `x-agent-latency-ms`, `x-agent-input-tokens`, `x-agent-output-tokens`, `x-agent-fallback-reason`. The host dev panel displays them.
- **Tests never call Claude.** They force `KYC_AGENT_MODE=recorded`. The single opt-in live smoke test is `pnpm test:live`, skipped without a key.

## 4. Generated code
- Every generated file starts with: `// GENERATED by Mitosis from packages/ir/<file>.lite.tsx. Do not edit. Regenerate with: pnpm ir:build`
- Mitosis's Svelte output uses pre-runes syntax (observed with Mitosis 0.14.1). Compile it with Svelte 5 in legacy (non-runes) mode, and record what you observe in `docs/LIMITS.md`.
- If Mitosis can't express something, simplify the primitive or move logic into core. Never patch generated output.

## 5. Slide-reference comments (required)
The presenter will open files on stage. At the top of each file that illustrates a slide (or above the key block), add a comment with the **exact slide title**:

```ts
// SLIDE: "Headless core: logic without a framework" (the only place flags are read)
```
```md
<!-- SLIDE: "Anatomy of a living spec" (scenario IDs link spec → tests → code) -->
```

Valid titles (main talk):
- "Intent has to outlive the prompt"
- "The flag that was off, but still on"
- "Three levels of SDD"
- "Anatomy of a living spec"
- "Headless core: logic without a framework"
- "The harness is the real guarantee"
- "Two cadences, one architecture: shell and slot"
- "A2UI: agents declare UI as data"
- "Three protocols, three jobs"
- "Zero-trust UI: data, not code"
- "Why compile-time?"
- "Intermediate representation: Mitosis"
- "Agents author IR, compilers emit code"
- "The demo: one spec drives both cadences"
- "What the demo showed, and what it didn't"
- "Incremental brownfield adoption"

Backup slides: "Where a headless core leaks", "Runtime streaming vs static compilation".

Keep `docs/SLIDE-MAP.md` current, with a file and line range per slide. Files shown on stage should be under about 80 lines, and never over 150.

## 6. Tests and traceability
- Tag tests with scenario IDs in the name: `it('[ONB-DOB-002] rejects a future date', …)`.
- `pnpm trace` enforces every scenario up to the current milestone (see `openspec/milestones.md`) and lists later ones as planned.
- One behaviour suite for primitives runs against **both** React and Svelte outputs, with an adapter per target.
- Contract tests parse every fixture and every recorded blueprint.
- M1 needs only a Playwright smoke test per geo. Full e2e, axe and throttling come in M2.

## 7. Commands (keep these working)
```
pnpm install
pnpm dev             # agent (:8787) + host (:5173), with Vite proxying /api/agent/* to the agent; MSW handles other /api/*
pnpm agent:check     # one tiny Claude call: prints model, latency, token usage (verifies the key)
pnpm agent:record    # refresh recorded blueprints from live Claude (all geos, or: pnpm agent:record GB IN)
pnpm lite:bake       # ask the agent for the IN blueprint and bake it into mfe-lite
pnpm ir:build        # Mitosis: packages/ir → packages/gen/{react,svelte}
pnpm build
pnpm test            # unit + primitive suite (both targets) + contract tests; recorded mode only
pnpm test:live       # optional live smoke test (needs ANTHROPIC_API_KEY)
pnpm test:e2e
pnpm trace
pnpm lint
pnpm size
pnpm verify          # lint + test + trace + size + test:e2e
pnpm demo:drift / pnpm demo:reset   # M4
```
Run `pnpm verify` before saying a milestone step is done, and paste the real output. Never claim a check passed without running it.

## 8. Verify before you use
These move fast and may differ from your training data: A2UI, AG-UI, OpenSpec, Mitosis, Svelte 5, MSW, and the Claude API (structured-output parameters, model IDs). Read current docs or source, pin exact versions, and record what you verified, with links, in `docs/VERSIONS.md`. If something isn't as expected, say so and propose the smallest alternative. Never invent package names or APIs.

## 9. Style
- Small files, descriptive names, comments that explain *why*.
- Accessible by default: real labels, `aria-describedby` for errors, focus to the first invalid field on submit.
- Design tokens as CSS custom properties, so the host can theme through the shadow DOM.
- Commit messages: `m1: [RT-001] stream live Claude layout as A2UI`.
