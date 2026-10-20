<!-- SLIDE: "Three levels of SDD" (this repo is spec-anchored: specs live here and evolve with the code) -->
# Project context: KYC onboarding micro-frontend (demo)

## Purpose
A greenfield KYC (know-your-customer) onboarding micro-frontend, built as the live demo for the talk "Post-Framework Frontends in the AI Era". It shows that one living spec can drive both:
- a **build-time cadence**: Mitosis IR compiled to React and Svelte
- a **run-time cadence**: A2UI blueprints rendered through an allowlisted catalog

## Non-goals
- Real regulatory compliance. All rules, ID formats and age limits are **illustrative**.
- Real backends, real identity providers and real PII. All APIs are mocked with hardcoded responses.
- Production hardening beyond what the demo needs: auth, rate limiting, observability.

## Conventions
- Requirements use SHALL / MUST. Scenarios use WHEN / THEN (and GIVEN / AND where helpful).
- **Every scenario title starts with a permanent ID**, for example `ONB-DOB-002`. IDs are never reused or renumbered. Tests reference them.
- ID prefixes:

  | Prefix | Area |
  |---|---|
  | `ONB` | onboarding behaviour |
  | `FLG` | feature flags |
  | `MFE` | integration |
  | `LITE` | lite version |
  | `RT` | runtime UI and agent |
  | `IR` | build-time compilation |
  | `TRC` | traceability |
  | `BF` | brownfield |
  | `DRIFT` | drift |

- Behaviour is described from the user's or host's point of view. Implementation detail belongs in code, not here.
- Changes go through `openspec/changes/<change-id>/`. Specs in `openspec/specs/` change only when a change is archived.

## Glossary
- **Geo**: the customer's geography code, passed by the host: GB, IN, AE or SG.
- **Version**: the set of steps, fields and rules a geo gets. It is defined entirely by `/features` flags and config.
- **Blueprint**: an A2UI v0.9 JSONL description of the form layout, made of catalog components only.
- **Policy**: the core's deterministic computation of required fields and rules for a geo, derived from flags and config.
- **Lite**: the low-bandwidth version, available only for geos with `kyc.lite.available`.
