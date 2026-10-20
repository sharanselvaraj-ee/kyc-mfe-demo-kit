<!-- SLIDE: "The demo: one spec drives both cadences" (stage script; ~11 minutes) -->
# Demo runbook (about 11 minutes)

## Before the talk
- Check out `m3-brownfield` (or `m1-running` if that is as far as you got) and run `pnpm install && pnpm build && pnpm demo:reset`.
- Start the host with `pnpm dev` (http://localhost:5173). Open DevTools → Network, filtered to `/api`.
- Have these open:
  - an editor with `openspec/specs/kyc-onboarding/spec.md`
  - `packages/ir/DateField.lite.tsx`
  - `packages/gen/react/…` and `packages/gen/svelte/…`
  - `packages/core/src/flags.ts`
- Set `ANTHROPIC_API_KEY` in `.env.local` and run `pnpm agent:check`, which makes one tiny Claude call and prints the model and latency.
- Run `pnpm agent:record` the morning of the talk, so the fallbacks are fresh.
- Use a phone hotspot rather than venue Wi-Fi. If the network dies, the app still works: the fallback chain streams the recorded blueprint and says so.
- Have the fallback recordings ready (one per act) in a background tab.

## Act 1: Run time (≈3.5 min)
1. Host page, geo **GB**. Point at the Network tab: one `/features` call, then `/api/agent/blueprint`. Click it and show the headers: `x-agent-source: live`, the model, the latency and the token counts. Then show the response: A2UI JSONL. "Claude composed this layout just now, as data, from a catalog of seven primitives."
2. Switch geo to **AE**, then **SG**. Different steps and fields: residency expiry, government prefill. "Same element, same code; only flags differ. Four versions, zero branches on country codes."
3. Turn on the dev toggle "inject unknown component". `CreditScoreGauge` is dropped with a warning (RT-002). "Nothing executable crossed the wire."
4. Switch to **IN** with "simulate slow network" on. The loader picks **lite**. Show the Network tab: no agent request, and a tiny bundle. "Same agent, same blueprint format, but Claude was called at build time, not at runtime."
5. *(If asked about cost or latency)* Turn on `KYC_AGENT_CACHE=on` and reload: `x-agent-source: cache`, roughly 0 ms. "In production you'd generate once per geo and flag set, not per visitor."

## Act 2: Build time (≈3.5 min)
1. "So where did the date-of-birth field come from?" Open scenarios ONB-DOB-002 and ONB-DOB-003 in the spec.
2. Open `DateField.lite.tsx`. "An agent wrote this from the spec. It's the IR. Deliberately generic: the policy says it's a date of birth, not the component."
3. Run `pnpm ir:build`, then open the React and Svelte outputs side by side. Point out the GENERATED headers and the pre-runes Svelte syntax ("compile targets lag too").
4. Run `pnpm test -- components`: one suite, green on both targets, with scenario IDs in the test names.
5. *(Optional, 45 s)* Show the brownfield change: `git diff m2-hardened m3-brownfield --stat`. "Two features, two geographies. The AE and SG files are untouched, and a test proves it (BF-001)."

## Act 3: Drift, the 4-day bug replayed (≈2 min; never cut this)
1. "Remember the flag that was off, but still on? The backend team just published a new contract." Run `git checkout m4-drift-red` (v2 fixture already active) and reload GB.
2. Point out three things:
   - the date of birth fell back to native
   - the host event log shows `kyc:contract-warning`
   - the banner names the missing flag
3. Run `pnpm test`. The red failure reads `[FLG-004][ONB-DOB-003] … "onb.dob_segmented" missing`. "Four days became one red test with a scenario ID on it."
4. Run `git checkout m4-drift-green`. Show the OpenSpec delta and the diff, which touches only `flags.ts` and fixtures. Run `pnpm test`: green. Reload: segmented again.
5. Line to land: "One spec change. Both cadences updated. The same tests guarded both."

## Fallbacks
- **Anything breaks:** play the recording for that act. Don't debug on stage.
- **The build is slow:** `m1-running` already has the generated outputs committed. Just open them.
- **The browser misbehaves:** Playwright's HTML report from the last `pnpm test:e2e` shows every geo.
