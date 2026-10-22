<!-- SLIDE: "The flag that was off, but still on" (this spec is the fix: the flag, its source and its failure mode are written down) -->
# Feature flags and geography versions

## Purpose
Every difference between geographies comes from one mocked endpoint, `GET /features?geo=<GEO>`, and is read in exactly one place: the core's flag adapter.

## Requirements

### Requirement: Single source of flags
The micro-frontend SHALL obtain all flags and geo configuration from `GET /features?geo=<GEO>`, once per session. It SHALL read them only through the core flag adapter.

#### Scenario: FLG-001 flags fetched once per session
- **GIVEN** the host renders `<kyc-onboarding geo="GB">`
- **WHEN** the user moves through all steps
- **THEN** exactly one request to `/features?geo=GB` is made

#### Scenario: FLG-002 flags read only by the adapter
- **WHEN** the lint step runs
- **THEN** any read of the features response outside `packages/core/src/flags.ts` fails the build
- **AND** no code path reassigns a flag value after it has been read (no overrides)

### Requirement: Features response contract
The `/features` response SHALL match a shape enforced by a Zod schema in `packages/contracts`.

#### Scenario: FLG-003 every fixture satisfies the contract
- **GIVEN** the schema shape:
  ```json
  {
    "geo": "GB",
    "schemaVersion": 1,
    "flags": { "<flag.key>": true },
    "config": {
      "minAgeYears": 18,
      "postcodePattern": "<regex string>",
      "nationalIdPattern": "<regex string or null>",
      "documentTypes": ["passport", "driving_licence"]
    }
  }
  ```
- **WHEN** the contract tests run
- **THEN** every `/features` fixture parses against the schema
- **AND** every flag that the policy depends on is present for every geo, with an explicit `true` or `false`

#### Scenario: FLG-004 missing flag fails loudly, never silently
- **GIVEN** a `/features` response that omits a flag the policy depends on
- **WHEN** the micro-frontend loads
- **THEN** the affected feature uses its control (default) behaviour
- **AND** the element dispatches `kyc:contract-warning` with `{ flag, geo, scenarioId }`
- **AND** a dev-mode banner names the missing flag
- **AND** the contract test for that fixture fails, naming the flag and the scenario ID

### Requirement: Geography version matrix (v1)
The v1 fixtures SHALL encode exactly this matrix. Values are illustrative.

#### Scenario: FLG-005 four versions from one codebase
- **GIVEN** the matrix:

  | Flag / config | GB | IN | AE | SG |
  |---|---|---|---|---|
  | `kyc.field.national_id` | false | true | true | true |
  | `kyc.step.otp` | false | true | false | false |
  | `kyc.prefill.gov` | false | false | false | true |
  | `kyc.field.residency_expiry` | false | false | true | false |
  | `kyc.lite.available` | false | true | false | false |
  | `config.minAgeYears` | 18 | 18 | 21 | 18 |
  | `config.postcodePattern` | UK-style postcode | 6 digits | none (field hidden) | 6 digits |
  | `config.nationalIdPattern` | null | 12 digits | 15 digits | letter + 7 digits + letter |
  | `config.documentTypes` | passport, driving_licence | passport, national_id | passport, national_id | passport, national_id |
- **WHEN** the host renders the element for each of GB, IN, AE and SG
- **THEN** each shows the steps and fields implied by its column above, and nothing else
- **AND** no geo code (`"GB"`, `"IN"`, …) appears in conditional logic anywhere except fixtures and tests

#### Scenario: FLG-006 illustrative badge
- **WHEN** any version renders
- **THEN** an "Illustrative rules: demo only" badge is visible
