<!-- SLIDE: "Two cadences, one architecture: shell and slot" (the host owns the shell; this micro-frontend is the slot) -->
# Micro-frontend integration

## Purpose
Any host page can embed KYC onboarding with one script tag and one custom element, regardless of the host's own framework.

## Requirements

### Requirement: Loader
The host SHALL include only `kyc-loader.js`. The loader decides which bundle to load (see `lite-mobile`) and registers the matching custom element, which SHALL accept these attributes:
- `geo` (required): `GB` | `IN` | `AE` | `SG`
- `locale` (optional, default `en`)
- `api-base` (optional, default `/api`)
- `variant` (optional): `full` | `lite`. This forces a variant and exists for the demo only.

#### Scenario: MFE-001 one script tag
- **GIVEN** a plain HTML page with `<script src="/kyc-loader.js" type="module"></script>` and `<kyc-onboarding geo="GB" locale="en-GB" api-base="/api"></kyc-onboarding>`
- **WHEN** the page loads
- **THEN** the onboarding form renders, and no other script tags were added by the host

### Requirement: Element events
The element SHALL dispatch these DOM `CustomEvent`s, all bubbling and composed:

| Event | Detail payload |
|---|---|
| `kyc:ready` | `{ geo, variant }` |
| `kyc:step` | `{ step, index, total }` |
| `kyc:submitted` | `{ referenceId, geo }` |
| `kyc:error` | `{ code, recoverable }` |
| `kyc:contract-warning` | `{ flag, geo, scenarioId }` |

#### Scenario: MFE-002 events carry no personal data
- **WHEN** any `kyc:*` event fires
- **THEN** its detail contains only the fields listed above

#### Scenario: MFE-003 changing geo re-initialises
- **WHEN** the host changes the `geo` attribute
- **THEN** the element discards in-memory state, fetches flags for the new geo, and re-renders

### Requirement: Style isolation and theming
The element SHALL render inside a shadow root and MUST expose theming only through documented CSS custom properties, isolated from host page styles.

#### Scenario: MFE-004 shadow DOM with token theming
- **WHEN** the host sets `--kyc-color-primary` on the element
- **THEN** the form's primary colour changes
- **AND** host CSS rules for `input` or `button` do not affect the form
