<!-- SLIDE: "Zero-trust UI: data, not code" (the agent arranges, the core decides, the catalog renders) -->
# Runtime UI: Claude agent, A2UI blueprints and catalog

## Purpose
In the full version, the form layout is not hardcoded. For each geography, a server-side agent asks Claude to compose the layout from a small catalog of generic UI primitives. The server encodes the result as an A2UI v0.9 blueprint and streams it to the browser, which renders it only through the allowlisted catalog.

Claude can choose grouping, order, step titles, labels and hints. It cannot add fields outside the geo policy, use components outside the catalog, see user data, or ship code.

## Catalog (v1: deliberately small and generic)
`Heading`, `Notice`, `TextField`, `DateField`, `SelectField`, `FileField`, `CheckboxField`.

Each primitive binds to a policy field through `fieldId`. Domain meaning (date of birth, national ID, postcode, …) comes from the policy, not from bespoke components. New primitives can be added later without changing the protocol.

## Requirements

### Requirement: Agent location and secrets
The agent SHALL run server-side in `packages/agent` (Node), behind `/api/agent/*` (proxied by the dev server). The Claude API key SHALL be read from `ANTHROPIC_API_KEY` on the server only. It must never be bundled, logged or exposed to the browser.

#### Scenario: RT-010 key stays on the server
- **WHEN** the production build of every browser bundle is searched
- **THEN** neither the string `ANTHROPIC_API_KEY` nor any key value appears
- **AND** the agent refuses to start in `live` mode without the variable, printing a clear setup message pointing to `.env.example`

### Requirement: Live Claude call with constrained output
In `live` mode (the default), the agent SHALL call the Claude Messages API with JSON-schema structured outputs. The schema SHALL be built per request, so `component` is an enum of catalog names and `fieldId` is an enum of the geo policy's fields. The model and limits SHALL come from environment variables.

#### Scenario: RT-001 layout composed by Claude per geo
- **GIVEN** `KYC_AGENT_MODE=live` and a valid key
- **WHEN** the full element initialises for a geo
- **THEN** the agent sends Claude the geo policy (fields, steps, rules) and the catalog description, but no user data
- **AND** it receives a layout plan that parses against the request's schema
- **AND** it encodes the plan as A2UI v0.9 JSONL and streams it to the browser
- **AND** the response carries the headers `x-agent-source: live`, `x-agent-model`, `x-agent-latency-ms`, `x-agent-input-tokens` and `x-agent-output-tokens`

#### Scenario: RT-007 no user data reaches the agent
- **WHEN** a user fills in and submits the form
- **THEN** no request to `/api/agent/*` contains any user-entered value
- **AND** personal data goes only to the mocked KYC endpoints

### Requirement: Fallback chain
The agent SHALL try, in order:
1. the cache (only when `KYC_AGENT_CACHE=on`)
2. a live call
3. the recorded blueprint for the geo (`packages/mocks/a2ui/recorded/<geo>.jsonl`)
4. the core's deterministic default layout

#### Scenario: RT-006 fallback on failure
- **GIVEN** the live call fails, times out (`KYC_AGENT_TIMEOUT_MS`, default 10000) or returns an invalid plan
- **WHEN** a blueprint is requested
- **THEN** the recorded blueprint is streamed with `x-agent-source: recorded` and an `x-agent-fallback-reason` header
- **AND** the host's dev panel shows the source, so a fallback is never silent

#### Scenario: RT-008 recordings refreshed from real runs
- **WHEN** `pnpm agent:record` runs with a valid key
- **THEN** it generates and validates a live blueprint for each geo, and overwrites `packages/mocks/a2ui/recorded/<geo>.jsonl`

### Requirement: Catalog allowlist and validation in the browser
The browser SHALL treat every blueprint as untrusted, even though the server built it.

#### Scenario: RT-002 unknown components are dropped
- **GIVEN** the host's dev toggle "inject unknown component" is on (the server then appends a `CreditScoreGauge` component after the Claude call, labelled as a test injection)
- **WHEN** the blueprint is rendered
- **THEN** that component is not rendered, a dev-mode warning names it, and the rest of the form works

#### Scenario: RT-003 props validated
- **GIVEN** a catalog component receives props that fail its Zod schema
- **WHEN** it is rendered
- **THEN** it is replaced with a safe fallback, and a dev-mode warning shows the error

#### Scenario: RT-004 blueprint must satisfy the geo policy
- **GIVEN** a blueprint omits a field the geo policy requires
- **WHEN** it is validated
- **THEN** it is rejected, the core's deterministic default layout is rendered, and a dev-mode warning explains why

#### Scenario: RT-005 no executable content
- **WHEN** a blueprint contains strings that look like markup or script
- **THEN** they are rendered as text only
- **AND** the codebase contains no `eval`, `new Function`, `dangerouslySetInnerHTML` or `{@html}`, which lint enforces

### Requirement: Build-time compilation of the primitives
Each primitive SHALL be written once in `packages/ir`, and `pnpm ir:build` MUST compile it to both a React and a Svelte component.

#### Scenario: IR-001 written once, compiled twice
- **WHEN** `pnpm ir:build` runs
- **THEN** each primitive in `packages/ir` produces a React and a Svelte component in `packages/gen`, each with a GENERATED header
- **AND** CI regenerates and diffs, so hand edits are caught

#### Scenario: IR-002 one behaviour suite, both targets
- **WHEN** `pnpm test` runs
- **THEN** the same primitive behaviour tests pass against both the React and the Svelte output

### Requirement: Traceability
Every scenario up to the current milestone SHALL have a tagged test, and `pnpm trace` MUST fail when one is missing.

#### Scenario: TRC-001 every scenario in the current milestone has a test
- **WHEN** `pnpm trace` runs with `TRACE_MILESTONE` (default: the highest milestone marked done in `openspec/milestones.md`)
- **THEN** it fails if any scenario ID in that milestone or an earlier one has no tagged test, or if any test tag references an unknown ID
- **AND** it lists later-milestone scenarios as "planned", without failing
