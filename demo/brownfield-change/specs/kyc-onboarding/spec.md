## ADDED Requirements

### Requirement: Segmented date of birth (flag `onb.dob_segmented`)
When the flag is true, the date-of-birth field SHALL render as three inputs: day, month and year. Validation is identical to the native variant.

#### Scenario: ONB-DOB-003 segmented variant behind an experiment flag
- **GIVEN** `/features` returns `onb.dob_segmented: true`
- **WHEN** Personal details renders
- **THEN** the date of birth shows separate day, month and year inputs
- **AND** ONB-DOB-001 and ONB-DOB-002 still hold
- **AND** if the flag is false or missing, the native control variant renders (and a missing flag also triggers FLG-004)

### Requirement: Address lookup (flag `onb.address_lookup`)
When the flag is true, the Address step SHALL offer a "Find address" lookup by postcode, using `GET /address/lookup`.

#### Scenario: ONB-ADDR-002 lookup fills address
- **GIVEN** the flag is on and the user enters a postcode that has mock results
- **WHEN** they choose a result
- **THEN** address line 1, city and postcode are filled and remain editable
- **AND** a postcode with no results shows "No addresses found. Enter it manually" and reveals the manual fields

### Requirement: Scoped rollout
#### Scenario: BF-001 blast radius limited to GB and IN
- **WHEN** this change is applied
- **THEN**, compared with `m2-hardened`, these are unchanged for AE and SG:
  - the computed policies
  - the per-request agent schemas (snapshot-tested)
  - the recorded blueprints
  - the e2e results, which run in `recorded` mode
- **NOTE:** live Claude output is not compared. It is non-deterministic by nature; the schema and policy are what bound it.
