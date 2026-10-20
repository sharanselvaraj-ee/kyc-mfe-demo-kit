## MODIFIED Requirements

### Requirement: Geography version matrix (v1)
The fixtures SHALL encode exactly this matrix. Values are illustrative.

| Flag / config | GB | IN | AE | SG |
|---|---|---|---|---|
| `kyc.field.national_id` | false | true | true | true |
| `kyc.step.otp` | false | true | false | false |
| `kyc.prefill.gov` | false | false | false | true |
| `kyc.field.residency_expiry` | false | false | true | false |
| `kyc.lite.available` | false | true | false | false |
| `onb.dob_segmented` | true | true | false | false |
| `onb.address_lookup` | true | true | false | false |
| `config.minAgeYears` | 18 | 18 | 21 | 18 |
| `config.postcodePattern` | UK-style postcode | 6 digits | none (field hidden) | 6 digits |
| `config.nationalIdPattern` | null | 12 digits | 15 digits | letter + 7 digits + letter |
| `config.documentTypes` | passport, driving_licence | passport, national_id | passport, national_id | passport, national_id |

#### Scenario: FLG-005 four versions from one codebase
- **WHEN** the host renders the element for each of GB, IN, AE and SG
- **THEN** each shows the steps and fields implied by its column above, and nothing else
- **AND** no geo code (`"GB"`, `"IN"`, …) appears in conditional logic anywhere except fixtures and tests

#### Scenario: FLG-006 illustrative badge
- **WHEN** any version renders
- **THEN** an "Illustrative rules: demo only" badge is visible
