# Tasks: add-gb-in-onboarding-improvements

## 1. Red: tests first
- [ ] 1.1 Contract tests: v1 fixtures gain `onb.dob_segmented` and `onb.address_lookup` (true for GB and IN, false for AE and SG). FLG-003 must still pass.
- [ ] 1.2 Core unit tests for ONB-DOB-003 (variant mapping, control on missing flag) and ONB-ADDR-002 (lookup fills fields, empty result falls back to manual entry)
- [ ] 1.3 Shared component suite: `DateField` segmented variant on both targets; `LookupField` on both targets
- [ ] 1.4 e2e: GB and IN show both features; **BF-001** asserts that AE and SG policy snapshots, agent-schema snapshots, recorded blueprints and e2e results (recorded mode) are unchanged
- [ ] 1.5 `pnpm trace` lists the new IDs as gaps until 1.1–1.4 exist

## 2. Green: implementation
- [ ] 2.1 Fixtures and the flag matrix
- [ ] 2.2 `core/flags.ts` and `core/policy.ts`. This is the only place the new flags are read.
- [ ] 2.3 IR: `DateField` variant and new `LookupField`; then `pnpm ir:build`
- [ ] 2.4 Catalog entry, plus GB and IN recorded blueprints (`pnpm agent:record GB IN`). AE and SG files untouched.
- [ ] 2.5 Mock `/address/lookup` handler
- [ ] 2.6 Lite: rebuild and confirm the budget still passes; report the size delta

## 3. Proof
- [ ] 3.1 `pnpm verify` green
- [ ] 3.2 `git diff --stat m2-hardened -- packages/mocks/a2ui/recorded/AE.jsonl packages/mocks/a2ui/recorded/SG.jsonl tests/snapshots/policy/AE.json tests/snapshots/policy/SG.json tests/snapshots/agent-schema/AE.json tests/snapshots/agent-schema/SG.json` is empty
- [ ] 3.3 Screenshots in `docs/screens/brownfield/` for GB, IN and IN lite
