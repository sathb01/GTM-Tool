# QA Data Replacement Plan

## Records to Retire

The prior QA suite includes original and fully populated variants of:

- PawPath Safety;
- BrightNest Refill Co.;
- ForgeLine Operations;
- RelayMetrics.

These records should not remain in the tester-facing company dropdown after the replacement suite passes.

## Why They Remain Temporarily

They are currently useful as a comparison baseline for known behavior, old fixture contracts, and regression coverage. Removing them before the new suite passes would make it harder to distinguish a new defect from a fixture change.

## Replacement Procedure

1. Create the four new records using unique IDs and the profiles in this package.
2. Complete and verify all applicable fields.
3. Run persistence, asset, semantic, AI, design, and cross-record checks.
4. Update automated tests to use the new record IDs and content contracts.
5. Export a local synthetic-data snapshot of the old QA records for development history only.
6. Remove old QA records from the active local and Render record stores.
7. Verify the tester-facing dropdown contains only the four new QA companies plus intentionally retained non-QA records.
8. Confirm no source code, migration, or test depends on the removed IDs.

## Safety Rules

- Do not delete Blacksmith, Fishing Shorts, or any non-QA user-created company as part of QA cleanup.
- Do not commit real customer data.
- Do not use a broad name match such as deleting every record containing `QA`; delete only the reviewed record IDs.
- Keep the archived QA snapshot outside the active server record store.
- If any replacement test fails, keep the old QA baseline until the failure is understood.

## Completion Evidence

- list of deleted record IDs;
- list of replacement record IDs;
- before-and-after dropdown inventory;
- automated test results using only the new fixtures;
- confirmation that non-QA records were unchanged.

