# Kickoff prompt for Claude Code

Before you start: copy `.env.example` to `.env.local` and set `ANTHROPIC_API_KEY`. Then paste everything below the line into Claude Code, opened at the repo root.

---

You are building the live demo application for a conference talk. Read these fully before doing anything else:

1. `CLAUDE.md`: standing rules. They override anything here that conflicts.
2. `README.md`: the architecture picture and the decisions already made.
3. `openspec/milestones.md` and every file under `openspec/specs/`: the living spec you build from.
4. `demo/RUNBOOK.md`: how the app will be used on stage.

Don't read `demo/brownfield-change/` or `demo/drift/` until the milestone that says so.

## What we're building
A greenfield KYC onboarding **micro-frontend**, delivered as web components that any host page loads with one script tag. It has:
- 4 geography versions (GB, IN, AE, SG), driven entirely by flags from a mocked `GET /features?geo=`
- a lite, low-bandwidth version for IN
- mocked, hardcoded KYC APIs
- a dummy host

It demonstrates **both cadences** in one codebase:
- **Build time:** seven generic UI primitives are written once as Mitosis IR, by you, from the spec, and compiled to React and Svelte.
- **Run time:** for each geo, a server-side agent calls **Claude** (real API, key from `ANTHROPIC_API_KEY`) to compose the form layout from those primitives. It encodes the layout as A2UI v0.9 and streams it. The browser renders it only through the allowlisted catalog.
- **Lite:** uses the Svelte primitives and a blueprint from the *same* agent, generated at **build time**, so the slow-network path never calls the agent.

Keep every screen plain and generic. We will add complexity later; leave clean seams for it.

## How to work
- **First goal: M1, a running demo.** Get to something we can click through in a browser as early as possible, then deepen.
- At each **checkpoint** below:
  1. run the checks and paste the real output
  2. update `docs/SLIDE-MAP.md`
  3. commit
  4. **stop** and report: what you built, what you verified, open questions, anything to tell the audience
- Use a task list. If the spec is ambiguous, stop and ask.

## M1: Running demo

### Checkpoint 0: Verify the moving parts (no app code)
Record in `docs/VERSIONS.md`, with links and pinned versions:
- **Claude API:** confirm the current structured-outputs request shape (`output_config.format`, plus `zodOutputFormat` / `messages.parse` in the TypeScript SDK) and the schema limitations. Confirm that the model ID in `.env.example` is current. Run `pnpm agent:check` as a throwaway script to prove the key works, and report the model and latency.
- **A2UI v0.9:** message types (expected: `createSurface`, `updateComponents`, `updateDataModel`, `deleteSurface`), `catalogId`, and how components and children are expressed. Check whether an official React renderer supports custom catalogs. If not, plan `mini-a2ui`, a minimal renderer for our subset, and list its deviations.
- **AG-UI:** recommend whether to use it. The default is plain streamed `fetch` of JSONL, because it's easiest to show in DevTools.
- **Mitosis:** CLI, config, React and Svelte output. Build one throwaway primitive, and record the Svelte syntax and whether it compiles on Svelte 5.
- **OpenSpec:** install, and `openspec validate` on our `openspec/`. Fix formatting only, and list each fix for review.
- **MSW:** current major version and setup, including passthrough for `/api/agent/*`.

**Stop. Wait for my go-ahead.**

### Checkpoint 1: Skeleton end to end (thin slice, GB only)
Build the thinnest vertical slice that proves every layer:
- workspace, contracts, a core containing `flags.ts` and `policy.ts`, and MSW `/features` for GB
- two primitives (`TextField`, `DateField`) in IR → React + Svelte
- an agent that calls Claude live for GB and returns A2UI JSONL, with the observability headers
- `<kyc-onboarding geo="GB">` rendering the streamed layout in the host page

Checks: `pnpm dev` works; the browser shows a Claude-composed GB form with 2 fields; the Network tab shows the headers. Commit.

**Stop and show me** (a screenshot plus the response headers).

### Checkpoint 2: All of M1
Fill in the rest of M1's scenarios:
- **Geos:** all 7 primitives and all 4 geos (fixtures exactly match the flag matrix).
- **Core:** the step machine, validation messages, and the mocked upload, OTP, prefill and submission.
- **Agent:** the fallback chain (RT-006, with `pnpm agent:record` producing the first recordings) and the inject-unknown-component toggle (RT-002).
- **Integration:** the policy check (RT-004), and the events (MFE-002) shown in the host's event log.
- **Lite:**
  - `pnpm lite:bake`
  - `<kyc-onboarding-lite>` built from the Svelte primitives
  - the loader rule (LITE-001)
  - the host's "simulate slow network" toggle
- **Tests:**
  - the primitive suite on both targets
  - contract tests on fixtures and recordings
  - a Playwright smoke test per geo in recorded mode
  - `pnpm trace` green for M1
- **Docs:** `docs/ARCHITECTURE.md` (1 page, 1 diagram) and `docs/LIMITS.md`.

Checks: `pnpm verify` green; a screenshot per geo plus lite in `docs/screens/`. Mark M1 done in `openspec/milestones.md` (once I approve), commit and tag `m1-running`.

**Stop.**

## M2: Hardening (only after I approve M1)
Implement M2's scenarios: missing-flag behaviour, back navigation, OTP limit, error and retry, a11y with axe, theming and shadow-DOM isolation, prop validation, lite budgets, persistence, and throttled e2e. Run `pnpm verify`, then tag `m2-hardened`. Add snapshot tests for each geo's computed policy and per-request agent schema (`tests/snapshots/policy/`, `tests/snapshots/agent-schema/`). M3 relies on them.

## M3: Brownfield (only after I approve M2)
1. Read `demo/brownfield-change/`, copy it to `openspec/changes/add-gb-in-onboarding-improvements/`, and run `openspec validate`. **Stop for my review.**
2. Then implement, tests first (red), then code (green).
3. Prove the blast radius (BF-001) with the diff in its tasks.
4. Archive the change once I approve, and tag `m3-brownfield`.

## M4: Drift rehearsal (only after I approve M3)
1. Read `demo/drift/README.md` and implement it: the `demo/drift-red` and `demo/drift-green` branches, tagged `m4-drift-red` and `m4-drift-green`.
2. Rehearse `demo/RUNBOOK.md` end to end, timing every step, and fix anything slow or flaky.

Begin with Checkpoint 0.
