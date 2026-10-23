# Slide map

Each row maps a slide (by its exact title) to what to show from this repo. Claude Code fills in the **Files to show** column as it builds. Keep each entry projector-friendly: one file, one line range.

| Slide title | What it should show | Files to show (path:lines) | Phase |
|---|---|---|---|
| The flag that was off, but still on | Flag, its source and its failure mode are written down; the drift test catches the rename | `openspec/specs/feature-flags/spec.md` (FLG-004), `demo/drift/README.md` | 1, 8 |
| Intent has to outlive the prompt | Intent lives in the repo (spec + scenario IDs), not in a chat | `openspec/specs/kyc-onboarding/spec.md` | 0 |
| Three levels of SDD | Spec-anchored: specs evolve through OpenSpec changes | `openspec/project.md`, `openspec/changes/` (archive) | 7 |
| Anatomy of a living spec | Scenario with an ID → Zod contract → tagged test | `openspec/specs/feature-flags/spec.md` (FLG-003) → `packages/contracts/src/features.ts` | 1 |
| Headless core: logic without a framework | `flags.ts` (the only flag reader), `policy.ts` | `packages/core/src/flags.ts`, `packages/core/src/policy.ts` | 1 |
| Where a headless core leaks (backup) | Focus management, shadow-DOM quirks, anything that had to live in a shell | | 3, 5 |
| The harness is the real guarantee | Shared suite on both targets, contract tests, e2e, axe, `pnpm trace` | | 2, 6 |
| Two cadences, one architecture: shell and slot | Host page (shell) + `<kyc-onboarding>` (slot); the loader | `apps/host/index.html`, `packages/mfe-full/src/index.tsx` | 4 |
| A2UI: agents declare UI as data | The live `/api/agent/blueprint` response (headers + JSONL) next to the rendered form; `packages/agent/src/encode-a2ui.ts` | `packages/agent/src/encode-a2ui.ts`, `packages/mfe-full/src/blueprint.ts` | 3 |
| Three protocols, three jobs | Where A2UI is used, and whether AG-UI is used (the Checkpoint 0 decision) | `docs/VERSIONS.md` (A2UI v0.9 and AG-UI sections) | 0, 3 |
| Zero-trust UI: data, not code | Per-request schema (enums of catalog + policy fields), catalog allowlist, RT-004 policy check, RT-007 (no user data to the agent), lint rule | `packages/contracts/src/layout-plan.ts`, `packages/catalog/src/index.ts`, `packages/mfe-full/src/catalog.ts` | 3 |
| Why compile-time? | Lite bundle size vs full (numbers from `pnpm size`) | | 5 |
| Intermediate representation: Mitosis | `DateField.lite.tsx` | `packages/ir/src/DateField.lite.tsx` | 2 |
| Agents author IR, compilers emit code | IR next to the React and Svelte outputs | `packages/ir/src/TextField.lite.tsx` next to `packages/gen/react/src/TextField.jsx` and `packages/gen/svelte/src/TextField.svelte` | 2 |
| Runtime streaming vs static compilation (backup) | Same blueprint: streamed (full) vs baked (lite) | | 5 |
| Incremental brownfield adoption | The staged change and the blast-radius diff | | 7 |
| The demo: one spec drives both cadences | `demo/RUNBOOK.md` | | 8 |
| What the demo showed, and what it didn't | `docs/LIMITS.md` (honest limits observed while building) | | 6–8 |
