<!-- SLIDE: "Three protocols, three jobs" (what each one does, and the AG-UI decision) -->
# Versions and protocol decisions (Checkpoint 0)

Checked 2026-10-20/22. These move fast — re-verify before relying on anything below if much time has passed.

## Claude API (`packages/agent`)

- **SDK:** `@anthropic-ai/sdk` (TypeScript). Structured outputs use `output_config: { format: zodOutputFormat(Schema) }` with `client.messages.parse()` — confirmed current (the old `output_format` top-level param is deprecated). `response.parsed_output` is `null` on parse failure; guard it.
- **Model:** `claude-haiku-5-5` — confirmed current, it supports structured outputs, and is the cheapest tier ($0.10/$0.50 per MTok up to 100K tokens; $0.50/$2.50 beyond). `.env.example`'s default is correct as-is.
- **JSON schema limitations** (confirmed): supported — basic types, `enum`, `const`, `anyOf`, `allOf`, `$ref`/`$def`, string formats (`date`, `email`, `uuid`, …), `additionalProperties: false` (required on every object). **Not supported:** recursive schemas, numeric bounds (`minimum`/`maximum`/`multipleOf`), string length bounds (`minLength`/`maxLength`), complex array constraints, any `additionalProperties` value other than `false`. The TS SDK strips unsupported Zod constraints before sending and validates them client-side — so our layout-plan schema must stay simple (enums for `component`/`fieldId`) and any length/bound checks happen in a Zod `.refine()` pass after parsing, per CLAUDE.md §3.
- **Failure handling:** check `stop_reason` before trusting `parsed_output` — `"refusal"` means Claude declined (output may not match schema) and `"max_tokens"` means truncated output. Both are failure cases for the fallback chain (RT-006).
- **Live key check:** the key in `.env.local` initially failed with `400 invalid_request_error: "Your credit balance is too low..."`; after a credit top-up, a throwaway live call succeeded — model `claude-haiku-5-5`, 1140ms latency, 20 input / 4 output tokens, `stop_reason: end_turn`. The key and model are confirmed working.

## A2UI v0.9

- **Spec home:** https://a2ui.org (generated from `a2ui-project/a2ui` on GitHub, Apache-2.0, "early-stage public preview"). Message reference: https://a2ui.org/reference/messages/.
- **Message types confirmed:** server→client is exactly `createSurface`, `updateComponents`, `updateDataModel`, `deleteSurface` — matches CLAUDE.md's expectation. (v0.8 used different names — `beginRendering`, `surfaceUpdate`, `dataModelUpdate` — don't mix vocabularies.)
- **`catalogId`:** a string on `createSurface`, fixed for the surface's lifetime (conventionally URL-shaped, e.g. a path under `.../catalogs/<name>/catalog.json`, but not resolved/fetched).
- **Component/children shape:** `updateComponents` sends a **flat array** of `{ id, component, ...props }` objects, not a nested tree. Nesting is an adjacency list — a component references children via `children: [...]` / `child: "id"`, and exactly one component has `id: "root"`. This matters for `encode-a2ui.ts`: encode the layout plan into this flat-array-plus-adjacency shape, not a recursive structure.
- **Version status caveat:** sources disagree on whether v0.9 or v0.9.1 is "current" right now (a2ui.org's own nav shows v0.9 as "Previous Stable" and v0.9.1 as "Current"; a separate community SDK site recommends staying on v0.8). CLAUDE.md pins us to v0.9 explicitly, so that's what we build against — recorded here so a drift to v0.9.1/v1.0 isn't a surprise later.
- **Catalog allowlisting mechanism (confirmed, https://a2ui.org/concepts/catalogs/):** a catalog is a JSON-Schema-equivalent listing of the components/functions/themes an agent may use; both sides must know it ahead of time. The client sends `supportedCatalogIds` in every message's metadata; the agent picks one when it creates a surface and that choice is locked for the surface's lifetime. The agent validates its own A2UI output against the chosen catalog before sending; the client validates again independently — this is exactly the belt-and-suspenders shape RT-002/RT-003/RT-004 already specify (server restricts via the per-request schema, browser validates again against the catalog regardless).
- **Official React renderer / custom catalogs — confirmed usable (decision made 2026-10-22):** `@a2ui/react` + `@a2ui/web_core` are real, published npm packages (currently 0.14.0; the `0.9.x` line tracks protocol v0.9/v0.9.1). I installed both and read the shipped `.d.ts` files directly rather than relying on docs:
  - `Catalog` is a concrete class: `new Catalog(id, components: ComponentApi[], functions?, themeSchema?)`. Each `ComponentApi` has a `name` and a **Zod schema** for its props — this maps directly onto our seven primitives and their contracts-package schemas.
  - React component implementations are created with `createComponentImplementation(api, RenderComponent)` (or `createBinderlessComponentImplementation`), both exported from `@a2ui/react`.
  - `MessageProcessor` is a concrete class: `new MessageProcessor(catalogs: Catalog<T>[], actionHandler?)`, with `.processMessages(messages)`, `onSurfaceCreated`/`onSurfaceDeleted` subscriptions, and a `.model`. Its private methods are literally named `processCreateSurfaceMessage` / `processUpdateComponentsMessage` / `processUpdateDataModelMessage` / `processDeleteSurfaceMessage` — matching the four message types 1:1.
  - Rendering uses `<A2uiSurface surface={...} />`.
  - **Critical security finding:** `npm audit` on `@a2ui/react@0.9.1` / `@a2ui/web_core@0.9.0–0.10.1` (the version matching protocol v0.9) flags a **critical** vulnerability — `openUrl` permits `javascript:` URI execution via agent-supplied button actions (https://github.com/advisories/GHSA-72qq-p3r5-f7wq). Fixed in `@a2ui/web_core@0.14.0+`. This is directly relevant to RT-005 (no executable content crosses the agent boundary).
  - **Decision: use `@a2ui/react@^0.14.0` / `@a2ui/web_core@^0.14.0` via their `./v0_9` subpath exports** (confirmed present and API-compatible with the `0.9.1` shape above — same `Catalog`/`MessageProcessor` constructors, `options` param added to `MessageProcessor`). This gets the official renderer, the patched vulnerability, and protocol-v0.9 compatibility together. Residual: 2 low + 1 moderate advisories remain at 0.14.0, in the `markdown-it`/`dompurify` chain used for a `MarkdownRenderer` we don't plan to need — track in `docs/LIMITS.md`, revisit if we ever render agent-supplied markdown. **No `mini-a2ui` is needed.**

## AG-UI — not used

AG-UI (github.com/ag-ui-protocol/ag-ui, docs.ag-ui.com) is a session/transport protocol for long-running, bi-directional agent↔frontend conversations (streamed text, tool calls, shared state). It is complementary to A2UI, not a replacement — A2UI describes *what* UI to render; AG-UI would describe *how a session carries it over time*. Our use case is one Claude call per page load producing a single static layout plan, streamed once — a single request/response, not a session. **Decision confirmed: plain streamed `fetch` of A2UI JSONL**, no AG-UI, per the README's default. Revisit only if the demo grows a genuine multi-turn agent session.

## Mitosis

- **Versions:** `@builder.io/mitosis-cli@0.14.1` and `@builder.io/mitosis@0.14.1` (version-locked together, current on npm).
- **Config:** `mitosis.config.cjs` with `module.exports = { files: 'src/**', targets: ['react', 'svelte'] }`; run via `npx mitosis build`.
- **Verified end-to-end:** built a throwaway `.lite.tsx` (label + text input + `onChange`), compiled both targets. React output is a plain function component with a `"use client"` directive — unremarkable. **Svelte output is confirmed pre-runes/legacy syntax** — `export let label/value/onChange` + `on:change={...}`, no `$state`/`$props`/`$effect` anywhere. Confirms CLAUDE.md §4: compile it with Svelte 5 in legacy (non-runes) mode.

## OpenSpec

- **Package:** `@fission-ai/openspec` (not `openspec` or `@openspec/cli`). Current version `1.14.3`. Repo: https://github.com/Fission-AI/OpenSpec. Invoked via `npx -y @fission-ai/openspec@1.14.3 <cmd>` — no global install, no `openspec.json` needed; it resolves the root from the existing `openspec/` directory layout.
- **`openspec validate --all --strict` result (before fixes):** 5 specs checked, 0 passed strict, 2 passed / 3 failed without `--strict` (warnings alone don't fail non-strict). **After the formatting fixes below:** 3 passed / 2 failed strict — the only remaining failures are the two pre-existing ">500 characters" warnings left for human review.
- **Formatting fixes applied** (RFC-2119 wording only — added one `SHALL`/`MUST` sentence per flagged requirement heading, no behaviour change, scenarios untouched):
  - `kyc-onboarding`: Name, Date of birth, National ID, Address, Document upload, OTP, Government prefill, Residency permit expiry, Accessibility (9 requirements)
  - `mfe-integration`: Style isolation and theming
  - `runtime-ui`: Build-time compilation of the primitives, Traceability
  - `lite-mobile`: Size and speed budgets (reworded existing sentence to include SHALL/MUST)
- **Left for human review (not formatting, structural):**
  - `feature-flags` requirement "Features response contract": flagged ">500 characters", suggests splitting examples/edge-cases into scenarios or separate requirements.
  - `mfe-integration` requirement "Element contract": same ">500 characters" flag (it also carries the attribute table and event table — splitting might hurt readability more than it helps; a human call).

## MSW

- **Version:** `msw@3.0.3` (current, ESM-only, requires Node ≥22 — we have Node 26, fine).
- **Browser setup:** `npx msw init <publicDir> --save`, `setupWorker(...handlers)` in `src/mocks/browser.ts`, `await worker.start()` (gate to dev only).
- **Passthrough for `/api/agent/*`:** use `passthrough()` (not `bypass()`, which is a different mechanism for re-issuing a modified request — e.g. proxying). Current API: `import { http, passthrough } from 'msw'`, then `http.get('/api/agent/*', () => passthrough())`.

## Tooling note: pnpm, local-first

No global `pnpm`/`corepack` is installed or assumed. All commands in this repo run through `npx pnpm@12.14.0 <cmd>` (and other CLIs — `openspec`, `mitosis` — the same way, pinned per-call), so nothing is installed outside the repo's own dependency resolution unless genuinely unavoidable. `package.json` (once created in Checkpoint 1) pins `"packageManager": "pnpm@12.14.0"` so `corepack`, when present, resolves to the same version.

## Open questions (also logged in `docs/OPEN-QUESTIONS.md`)
- `feature-flags` and `mfe-integration` have two requirements flagged ">500 characters" by `openspec validate --strict` — structural, left for human review (see OpenSpec section above).
