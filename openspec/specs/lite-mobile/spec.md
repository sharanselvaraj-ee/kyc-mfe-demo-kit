<!-- SLIDE: "Runtime streaming vs static compilation" (lite = the same blueprint, lowered at build time) -->
# Lite version for low-bandwidth mobile

## Purpose
In geos with `kyc.lite.available` (v1: IN only), users on slow or metered connections get a much smaller version. It uses the same compiled primitives (Svelte output) and the same blueprint format, produced by the same Claude agent. The blueprint is baked in at build time, so no agent call or blueprint stream happens at runtime.

## Requirements

### Requirement: Variant selection
The loader SHALL choose lite when **all** of these hold:
- the geo is in the build-time lite manifest (generated from the flag matrix)
- the element has no `variant="full"`

and **any** of these holds:
- `navigator.connection.saveData` is true
- `navigator.connection.effectiveType` is `slow-2g`, `2g` or `3g`
- `variant="lite"` is set
- the URL has `?kyc-lite=1`

Otherwise it SHALL choose full.

#### Scenario: LITE-001 selection
- **GIVEN** geo IN and `effectiveType` `3g`
- **WHEN** the loader runs
- **THEN** `<kyc-onboarding-lite>` is loaded, and the full bundle is never requested
- **AND** for geo GB under the same conditions, the full version is loaded

### Requirement: Size and speed budgets (initial targets)
These are initial targets. If one is not achievable, report the measured value instead of silently changing it.

#### Scenario: LITE-002 bundle budget
- **WHEN** `pnpm size` runs
- **THEN** the loader is at most 2 KB gzipped
- **AND** the lite element's JavaScript is at most 35 KB gzipped
- **AND** the full element's size is reported, without a hard limit

#### Scenario: LITE-003 blueprint baked at build time, no runtime agent request
- **GIVEN** `pnpm lite:bake` asks the same agent (live Claude, with the RT-006 fallback chain) for the IN blueprint, and writes it into `packages/mfe-lite/src/blueprint.generated.jsonl`
- **WHEN** the lite element runs
- **THEN** it makes no request to the agent or blueprint endpoint. Only `/features`, uploads and submission are called.

#### Scenario: LITE-004 survive a dropped connection
- **GIVEN** the user has completed two steps
- **WHEN** the page is reloaded
- **THEN** entered non-document values are restored from local storage, scoped to the session and cleared on submit
- **AND** the user resumes at the same step

#### Scenario: LITE-005 usable on a slow network
- **GIVEN** Playwright emulates roughly 400 kbps down and 400 ms latency, with a mobile viewport
- **WHEN** the host page loads with geo IN
- **THEN** the first input is interactive within 5 seconds
- **AND** the full flow can be completed

#### Scenario: LITE-006 same behaviour, smaller shell
- **WHEN** the shared behaviour suite and the IN e2e run against lite
- **THEN** every IN scenario (ONB-*) passes, exactly as it does for full
