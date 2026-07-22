# Product Review Test Execution Log

Started: July 21, 2026

## Safety Baseline

- Pre-change workspace backup created before implementation.
- Backup: `local-backups/GTM-Tool_backup_2026-07-21_08-02-21.zip`
- Files archived and verified: 230
- Verification failures: 0
- `server/data/records.json` included: Yes
- Previous QA records retained until replacement fixtures pass.

## Phase 0 Status

- Four canonical company profiles created.
- Each profile separates saved evidence from assumptions.
- Each profile defines customer, problem, offer, outcome, route, proof, constraints, decision rules, and system of record.
- Profile-quality gate completed: 210 checks passed, 0 failed.
- Legacy company names and scenario phrases were scanned across all four profiles: 0 found.
- Replacement fixture generator completed with fail-closed field resolution.
- Applicable saved keys: 233 for each pre-revenue record, 620 for FieldSip, and 622 for RenewalGrid.
- Exact API save/reload verification passed for all four records.
- Semantic answer-quality gate: 66 checks passed, 0 failed.
- Post-revenue deep-link isolation check: 9 checks passed, 0 failed.
- Initial intake and asset rendering sweep: 78 routes checked; 64 clean and 14 visual or output candidates require focused review.
- Output and asset content review: In progress.

## July 22 Visual Review and Implementation Pass

- Fresh general intake visits now start at Company Information; explicit section links and browser refreshes retain their intended destination.
- Fixed customer-group fixture row IDs so saved QA evidence binds to the visible Customer Priority Framework cards.
- Added a visible-field binding gate for customer group identity, problem, urgency, evidence, access source, observable signals, and all five hypothesis scores.
- Fixed customer-group normalization so commas inside descriptions and multi-select option labels are no longer converted to semicolons.
- Fixed multi-select restoration to support semicolon-delimited, comma-delimited, and comma-containing option labels.
- Card fields that define a selectable repeatable list now use the standard guided multi-select control instead of an unstructured textarea.
- Report escaping now preserves numeric zero, so incomplete readiness dimensions display `0/100` instead of `/100`.
- Replaced the technology-specific revenue-motion example with neutral guidance that works across company types.
- Added spacing and containment around GTM summary action rows.
- Focused headless screenshots confirmed the Customer Priority Framework and GTM Plan Summary do not have the button/text overlap initially suspected by the geometry-only checker.
- Improved the overlap check to distinguish actual control occlusion from normal component geometry.
- Final route and rendering sweep: 78 passed, 0 failed.
- Profile quality gate: 210 passed, 0 failed.
- Semantic answer-quality gate: 66 passed, 0 failed.
- Post-revenue section deep-link gate: 9 passed, 0 failed.

## Initial Finding

The previous fully populated fixture generator uses broad label keyword matching, first-option selection, and generic fallback text. It is effective for checking schema coverage and persistence, but it cannot certify that every answer addresses the exact question. The replacement suite will reject generic fallback answers and record field-level provenance.

## Confirmed Implementation Improvements

- Replacement profiles distinguish saved evidence from assumptions.
- The generator stops if any applicable field lacks an explicit semantic rule.
- Pre-revenue D2C and B2B SaaS paths use different problem, urgency, buyer, commitment, evidence, and validation choices.
- Mixed B2B/D2C and post-revenue SaaS records preserve distinct primary and alternative customer hypotheses.
- Buyer-role content now varies by economic, user, implementation, and risk responsibilities rather than repeating one message across every role.
- 30/60/90 success rows now have distinct focus, action, target, owner, and verification content.

## Initial Product-Level Review Candidates

These are not yet all confirmed defects. They have been separated from harness assumptions and require focused visual or source-level validation.

1. Post-revenue GTM summaries display some dimension labels as `/100` without a visible numeric score.
2. Dense intake cards may place `Copy`, `Choose options`, or `Edit selections` controls too close to labels and explanatory text.
3. The GTM summary may place `Improve This Section` and `Work on this action` controls over supporting copy in some content-length cases.
4. A reusable sales-motion help example references outbound email to operations leaders at multi-location service businesses, even for unrelated consumer and SaaS scenarios. This is help copy, not leaked record data, but it is not company-specific guidance.
