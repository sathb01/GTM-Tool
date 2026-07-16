# Fully Populated Four-Company Test

Date: July 14, 2026

## Test Standard

This test created four new synthetic records rather than changing the original QA fixtures. A field counted as applicable when it appears in the intake workflow for that company's selected mode and its current conditional answers.

Hidden conditional fields, deprecated fields, and legacy migration-only fields were not counted as applicable. Every visible scalar field, repeatable-list entry, fixed-table cell, and active repeatable-table cell received a saved value.

Every record was saved through the local record API and reloaded from the API. The reloaded data had to exactly match the saved data.

## Coverage

| Company | Mode | Applicable intake fields | Blank applicable fields | Total saved keys |
| --- | --- | ---: | ---: | ---: |
| QA Full - PawPath Safety | Pre-revenue, DTC-first | 233 | 0 | 329 |
| QA Full - BrightNest Refill Co. | Pre-revenue, retail-first | 233 | 0 | 273 |
| QA Full - ForgeLine Operations | Post-revenue B2B services | 592 | 0 | 790 |
| QA Full - RelayMetrics | Post-revenue B2B SaaS | 598 | 0 | 798 |

## Execution Workspaces Populated

Each record also contains completed test data for:

- Active Plan
- Messaging Kit and response evidence
- Target List
- Proof Asset Builder and proof usage
- Outreach Sequence, steps, and assignments
- Pipeline and Opportunities, including CRM source-of-truth fields
- Weekly GTM Review and decision history
- Validation Workspace for both pre-revenue companies

References between workspaces were verified. Outreach assignments resolve to saved targets, sequence steps resolve to saved message and proof records, and pipeline opportunities resolve to saved targets.

## Results

- 143 regression assertions passed
- 0 failures
- 0 warnings
- 0 blank applicable intake fields
- 0 generic `completed answer for` fillers
- 0 unresolved `AI please`, `AI recommendation`, or `Not captured yet` answers
- 0 bare `Other` answers
- API save and reload matched for all four records

## Fully Populated Record IDs

- `qa-pre-dtc-pawpath-20260712-full-20260714`
- `qa-pre-retail-brightnest-20260712-full-20260714`
- `qa-post-b2b-forgeline-20260712-full-20260714`
- `qa-post-saas-relaymetrics-20260712-full-20260714`

## Verification Boundary

No browser-window automation was used. This test verifies schema coverage, conditional applicability, saved data, API persistence, cross-workspace references, scenario alignment, routes, and code contracts. It does not certify visual layout or manual control behavior.

## Repeat the Test

```text
node QA_FOUR_COMPANY_REVIEW_20260712/create-fully-populated-fixtures.mjs
node QA_FOUR_COMPANY_REVIEW_20260712/regression-check.mjs
```
