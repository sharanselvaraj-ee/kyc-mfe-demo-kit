# Milestones

Build a running demo first, then add depth. `pnpm trace` enforces every scenario up to the current milestone and lists later ones as "planned".

Mark a milestone done by changing `[ ]` to `[x]` once `pnpm verify` is green and the human has approved it.

## [x] M1: Running demo (walking skeleton)
Goal: open the host, pick any of the 4 geographies, and see a simple form whose layout Claude composed live. Submit it to the mocks. The lite version loads for IN.

- Flags: FLG-001, FLG-002, FLG-003, FLG-005, FLG-006
- Onboarding: ONB-FLOW-001, ONB-NAME-001, ONB-DOB-001, ONB-DOB-002, ONB-ID-001, ONB-ADDR-001, ONB-DOC-001, ONB-OTP-001, ONB-PREFILL-001, ONB-RES-001, ONB-SUBMIT-001, ONB-SUBMIT-002
- Integration: MFE-001, MFE-002
- Runtime: RT-001, RT-002, RT-004, RT-005, RT-006, RT-007, RT-010
- Build time: IR-001, IR-002
- Lite: LITE-001, LITE-003
- Traceability: TRC-001

## [ ] M2: Hardening
Goal: the demo survives a projector, a slow network and a hostile Q&A.

- FLG-004, ONB-FLOW-002, ONB-OTP-002, ONB-ERR-001, ONB-A11Y-001
- MFE-003, MFE-004
- RT-003, RT-008
- LITE-002, LITE-004, LITE-005, LITE-006

## [ ] M3: Brownfield change
`demo/brownfield-change/` → ONB-DOB-003, ONB-ADDR-002, BF-001

## [ ] M4: Drift rehearsal
`demo/drift/` → DRIFT-001, plus the red/green branches
