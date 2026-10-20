# KYC Micro-Frontend Demo Kit

Starter kit for building the live demo for **"Post-Framework Frontends in the AI Era"** (Equal Experts Bengaluru) with Claude Code.

The kit is **spec-first**: you give Claude Code a human-authored living spec and a short set of rules, and it builds from them. That is the talk's thesis applied to the demo itself.

## What's in here

| Path | What it is |
|---|---|
| `CLAUDE.md` | Standing rules for Claude Code: priorities, architecture, Claude API practices, slide comments, commands |
| `PROMPT.md` | The kickoff prompt. **M1 (a running demo) first**, with checkpoints, then M2 to M4 |
| `.env.example` | Agent configuration. Copy to `.env.local` and add your `ANTHROPIC_API_KEY` |
| `openspec/project.md`, `openspec/milestones.md` | Context and conventions; which scenarios belong to which milestone |
| `openspec/specs/*/spec.md` | **The living spec**: 5 capabilities, every scenario with a permanent ID |
| `demo/brownfield-change/` | Staged OpenSpec change (2 features, GB and IN only). Used in M3 |
| `demo/drift/README.md` | The "backend renamed the flag" replay for Act 3. Used in M4 |
| `demo/RUNBOOK.md` | Act-by-act stage script with fallbacks |
| `docs/SLIDE-MAP.md` | Slide title → files to show; Claude Code fills it in |

## How to use it
1. Create an empty folder, `git init`, copy the kit in, commit, and tag `m0-spec`.
2. Run `cp .env.example .env.local` and set `ANTHROPIC_API_KEY`.
3. Open Claude Code in the folder and paste `PROMPT.md`.
4. Review at each checkpoint. The first one you can click through is Checkpoint 1, a Claude-composed GB form.

## Architecture in one picture

```
                    openspec/  (living spec: scenarios with IDs, flag matrix, milestones)
                         │
   packages/contracts (Zod) ── packages/core (headless TS: flags.ts, policy.ts, validation, steps, API client)
                                       │ policy (fields, steps, rules), never user data
   CADENCE 2 · BUILD TIME              ▼                     CADENCE 1 · RUN TIME
   packages/ir: 7 generic primitives   packages/agent (Node, server side)
   (Mitosis IR, agent-written)            │ Claude API, structured output: a layout plan
         │ mitosis build                  │ schema enums = catalog names + policy fields
   ┌─────┴──────┐                         ▼ encode → A2UI v0.9 JSONL, streamed
 gen/react   gen/svelte            /api/agent/blueprint  ──▶ packages/mfe-full (React)
   │             │                  (headers: source, model,     <kyc-onboarding>
   │             │                   latency, tokens)            validates + renders via catalog
   │             └──▶ packages/mfe-lite (Svelte) ◀── pnpm lite:bake: the same agent, called
   │                  <kyc-onboarding-lite>          at BUILD time for IN
   └──▶ packages/catalog (allowlist + prop schemas + descriptions Claude sees)
                                       │
                         packages/loader (≤2 KB: picks full vs lite)
                                       │
                         apps/host (plain HTML/TS, MSW mocks, dev panel)
```

The idea to land on stage: **the same agent, the same primitives and the same blueprint format serve both cadences. The only difference is *when* Claude is called:** per page load (full), or once at build time (lite).

## Decisions baked in (change them before you start if you disagree)
- **Real Claude by default.**
  - `KYC_AGENT_MODE=live`, with the key read server-side from `ANTHROPIC_API_KEY`, never in the browser.
  - Default model `claude-haiku-5-5` (the lowest-latency current model); switch to `claude-sonnet-5-5` with one env var.
  - Fallback chain: cache (opt-in) → live → recorded → deterministic default. The source is always shown in headers and in the dev panel.
- **Claude composes; the core decides.** Claude returns a small layout plan under a per-request JSON schema: its components can only be catalog names, and its fields only policy fields. The server encodes the plan as A2UI. The browser validates again.
- **Simple, generic UI.** Seven primitives: `Heading`, `Notice`, `TextField`, `DateField`, `SelectField`, `FileField`, `CheckboxField`. One column, native inputs, no styling ambition. Richer components come later as new catalog entries.
- **Geographies:** GB, IN, AE, SG. IN has the lite version. All rules and ID formats are **illustrative**.
- **Tests never call Claude.** They run against recorded blueprints. `pnpm test:live` is an optional smoke test.
- **Costs:** each page load in live mode is one small Claude call, a few thousand tokens at most. Haiku pricing starts from $0.10 per million input tokens and $0.50 per million output tokens (check current pricing). Turn on `KYC_AGENT_CACHE=on` to make repeated loads free.

## Note on the deck
The deck's demo slides describe a narrower date-of-birth-only demo. Update them after M1 using `docs/SLIDE-MAP.md` and `docs/screens/`.
