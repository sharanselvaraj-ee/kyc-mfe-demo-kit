<!-- SLIDE: "Anatomy of a living spec" (behaviour scenarios with permanent IDs; data contracts live next to them) -->
# KYC onboarding behaviour

## Purpose
Collect identity details, a document and consent, then submit them to a mocked KYC API. The steps and fields vary by geography, according to the flag matrix in `feature-flags`.

## Steps
1. **Personal details**: full name, date of birth, national ID (if flagged)
2. **Address**: address lines, city, postcode (if the geo has a pattern)
3. **Verification**: document upload; OTP (if flagged); residency permit expiry (if flagged)
4. **Review & consent**: summary, consent checkbox, submit

## UI principle
Keep every screen plain: one column, native inputs, system font, design tokens for colour and spacing, and no animation. Visual polish is deliberately left for later, so the demo shows the architecture rather than the styling.

## Requirements

### Requirement: Step flow
The form SHALL present the steps in order. Back navigation keeps entered values. Forward navigation validates only the current step.

#### Scenario: ONB-FLOW-001 forward validates current step only
- **GIVEN** the user is on Personal details with an empty name
- **WHEN** they press Continue
- **THEN** they stay on the step, an error summary lists the problems, and focus moves to the first invalid field

#### Scenario: ONB-FLOW-002 back keeps values
- **GIVEN** the user has completed Personal details and is on Address
- **WHEN** they press Back
- **THEN** Personal details shows the previously entered values

### Requirement: Name
The name field SHALL accept Unicode input in any script, and MUST reject a value shorter than 2 characters after trimming.

#### Scenario: ONB-NAME-001 Unicode names
- **WHEN** the user enters a name in any script, including Arabic or Devanagari
- **THEN** it is accepted, rendered with `dir="auto"`, and trimmed of surrounding whitespace
- **AND** names shorter than 2 characters after trimming are rejected with "Enter your full name"

### Requirement: Date of birth
The date of birth field SHALL be required, and MUST reject a date in the future or an applicant younger than `config.minAgeYears`.

#### Scenario: ONB-DOB-001 required
- **WHEN** the date of birth is empty and the user continues
- **THEN** the field shows "Enter your date of birth"

#### Scenario: ONB-DOB-002 reject future dates and under-age applicants
- **WHEN** the date is after today
- **THEN** the field shows "Date of birth cannot be in the future"
- **WHEN** the applicant is younger than `config.minAgeYears`
- **THEN** the field shows "You must be at least {minAgeYears} to apply"

### Requirement: National ID (flag `kyc.field.national_id`)
When the flag is on, the field SHALL be shown and MUST validate against `config.nationalIdPattern`; when the flag is off, the field SHALL be hidden entirely.

#### Scenario: ONB-ID-001 format check
- **GIVEN** the flag is on
- **WHEN** the value doesn't match `config.nationalIdPattern`
- **THEN** the field shows "Enter a valid ID number (illustrative format)"
- **AND** the field is hidden entirely when the flag is off

### Requirement: Address
The postcode field SHALL validate against the geo's `postcodePattern` when one is configured, and MUST NOT be shown when the geo has no pattern.

#### Scenario: ONB-ADDR-001 postcode format
- **GIVEN** the geo has a `postcodePattern`
- **WHEN** the postcode doesn't match it
- **THEN** the field shows "Enter a valid postcode"
- **AND** when the geo has no pattern, the postcode field is not shown

### Requirement: Document upload (mocked)
The upload SHALL accept only JPG, PNG or PDF up to 5 MB from `config.documentTypes`, and MUST return a mocked `documentId` after a simulated delay.

#### Scenario: ONB-DOC-001 accepted files
- **WHEN** the user selects a file
- **THEN** only JPG, PNG or PDF up to 5 MB are accepted
- **AND** only `config.documentTypes` are offered
- **AND** the mock upload returns a `documentId` after a simulated delay

### Requirement: OTP (flag `kyc.step.otp`)
When the flag is on, the step SHALL accept only the mocked code `123456`, and MUST block further attempts for 30 seconds after 3 wrong entries.

#### Scenario: ONB-OTP-001 mocked one-time code
- **GIVEN** the flag is on
- **WHEN** the user requests a code and enters `123456`
- **THEN** verification succeeds
- **AND** any other code shows "That code didn't match"

#### Scenario: ONB-OTP-002 attempt limit
- **GIVEN** the flag is on
- **WHEN** the user enters a wrong code 3 times
- **THEN** further attempts are blocked for 30 seconds, with a visible countdown

### Requirement: Government prefill (flag `kyc.prefill.gov`, mocked)
When the flag is on, choosing prefill SHALL fill name, date of birth and national ID from a hardcoded mock record, and the fields MUST remain editable afterwards.

#### Scenario: ONB-PREFILL-001 prefill personal details
- **GIVEN** the flag is on
- **WHEN** the user chooses "Prefill from government record (demo)"
- **THEN** name, date of birth and national ID are filled from a hardcoded mock response, and remain editable

### Requirement: Residency permit expiry (flag `kyc.field.residency_expiry`)
When the flag is on, the expiry date SHALL be required and MUST be rejected when it is today or earlier.

#### Scenario: ONB-RES-001 must be in the future
- **GIVEN** the flag is on
- **WHEN** the expiry date is today or earlier
- **THEN** the field shows "Your residency permit must be valid"

### Requirement: Submission
The data contract for the submission SHALL be a Zod schema `KycSubmission` in `packages/contracts`. It contains only the fields the geo's policy requires.

#### Scenario: ONB-SUBMIT-001 successful submission
- **GIVEN** all steps are valid and consent is ticked
- **WHEN** the user submits
- **THEN** `POST /kyc/submissions` is called with a body that parses as `KycSubmission`
- **AND** the element dispatches `kyc:submitted` with `{ referenceId, geo }` only, and no personal data

#### Scenario: ONB-SUBMIT-002 consent required
- **WHEN** consent is not ticked
- **THEN** submit is blocked with "You need to agree before we can continue"

#### Scenario: ONB-ERR-001 recoverable API error
- **GIVEN** the mock API is set to fail (the host's "simulate error" toggle)
- **WHEN** the user submits
- **THEN** an error message with a Retry button is shown, entered data is kept, and Retry resubmits

### Requirement: Accessibility
The flow SHALL be fully operable by keyboard and screen reader, and MUST pass axe with no serious or critical violations.

#### Scenario: ONB-A11Y-001 keyboard and screen reader
- **WHEN** the flow is completed using only the keyboard
- **THEN** every control is reachable and labelled, errors are linked with `aria-describedby`, and axe reports no serious or critical violations
