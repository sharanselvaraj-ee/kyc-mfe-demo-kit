<!-- SLIDE: "Incremental brownfield adoption" (a change scoped to 2 of 4 geographies, proven by blast-radius tests) -->
<!-- STAGED: copy this folder to openspec/changes/add-gb-in-onboarding-improvements/ in Phase 7. Not before. -->
# Change: add-gb-in-onboarding-improvements

## Why
v1 has shipped in all four geographies. Product wants two improvements, trialled only in GB and IN:
1. a **segmented date-of-birth input** (separate day, month and year boxes), run as an experiment, because the native date picker performs poorly on some mobile browsers
2. **address lookup** by postcode or PIN code, which fills the address lines from a mocked lookup API

AE and SG must be completely unaffected.

## What changes
- Two new flags in `/features`:

  | Flag | GB | IN | AE | SG |
  |---|---|---|---|---|
  | `onb.dob_segmented` | true | true | false | false |
  | `onb.address_lookup` | true | true | false | false |

- The generic `DateField` primitive gains a `variant` prop: `native` (control) or `segmented`. The core flag adapter maps `onb.dob_segmented` to the variant. Components never read flags.
- New IR primitive `LookupField`: a generic "type to search, pick a result" field, added to the catalog. The policy offers it to Claude only for geos with the flag, so the schema enum simply doesn't contain it for AE and SG.
- New mock endpoint `GET /address/lookup?geo=&postcode=` with hardcoded results for 2 postcodes per geo, plus an empty-result case.
- The lite (IN) version gets both features as well, through the same compiled components.

## Impact
- Specs: `kyc-onboarding` (ADDED requirements), `feature-flags` (MODIFIED matrix)
- Code: `core/flags.ts`, `core/policy.ts`, `ir/DateField`, new `ir/LookupField`, catalog, GB/IN recorded blueprints, fixtures
- **Blast radius:** AE and SG policies, agent schemas, recorded blueprints and e2e results must be byte-for-byte unchanged (BF-001)
