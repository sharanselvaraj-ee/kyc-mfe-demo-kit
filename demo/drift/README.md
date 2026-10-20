<!-- SLIDE: "The flag that was off, but still on" (Act 3 replays the 4-day bug, and it now takes seconds) -->
<!-- STAGED: read this only in Phase 8. -->
# Drift fixture: the backend renamed the flag

## The story being replayed
In the real incident, a release changed which flag the downstream systems used. The docs only listed the frontend's flag. A developer then overwrote the flag variable with the backend value somewhere else. The result was a feature that was "off" in config but live in production, and four days of debugging.

## What to build
- `packages/mocks/fixtures/features.v2.json`: identical to v1 after the brownfield change, **except** in GB and IN, where `onb.dob_segmented` is removed and replaced by `exp.onboarding_dob_v2: true`. This simulates the backend team's new published contract.
- `pnpm demo:drift` switches the mock `/features` handler to v2. `pnpm demo:reset` switches it back. Both take effect on page reload, with no rebuild. Store the active fixture choice in a committed `packages/mocks/active-fixture.json`, so that checking out `m4-drift-red` or `m4-drift-green` brings the right state with it, and `pnpm demo:reset` restores v1 on any other stage.

## Expected behaviour on `demo/drift-red` (FLG-004 + ONB-DOB-003)
1. `pnpm test` fails within seconds. The failure message must contain the scenario ID and the flag:
   `[FLG-004][ONB-DOB-003] features.v2 GB: required flag "onb.dob_segmented" missing`
2. In the browser (GB or IN):
   - the date of birth falls back to the **native** control variant
   - the element dispatches `kyc:contract-warning` (visible in the host's event log)
   - a dev-mode banner names the missing flag

   It is loud, not silently "off but on".

## The fix on `demo/drift-green` (DRIFT-001)
- An OpenSpec change `rename-dob-experiment-flag`. It modifies ONB-DOB-003 to name `exp.onboarding_dob_v2` as the source flag, and adds:

  #### Scenario: DRIFT-001 experiment flag follows the backend contract
  - **GIVEN** `/features` returns `exp.onboarding_dob_v2: true`
  - **WHEN** Personal details renders
  - **THEN** the segmented variant is shown

- The code change touches **only** `packages/core/src/flags.ts` and fixtures. Views, IR and blueprints are unchanged. That's the headless-core point; say so on stage.
- `pnpm verify` is green, on both targets and both variants.
