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

## July 23 Render Release Verification

- Release commit `d19ad9f` was deployed from GitHub `main`.
- The deployed application returned the expected `app.js?v=20260722-intake-entry-1` release marker.
- All four replacement QA records were saved to Render and returned by the authenticated record API.
- Live startup behavior: 3 passed, 0 failed.
- Live post-revenue section deep links: 9 passed, 0 failed.
- Live saved customer-group field binding: 2 records passed with both visible customer-group rows complete.
- Live authenticated intake, report, and asset rendering sweep: 78 passed, 0 failed.
- Render's persistent background connections made `networkidle` an unreliable readiness signal. The deployed harness now waits for page load plus the exact section, company, or asset content required by each check.
- No visible browser window was opened during release verification.

## July 23 Phase 1: Trust and Score Integrity

- Added reusable output claims for the four GTM Plan Summary decisions.
- Each claim retains source fields internally and displays user-readable source categories, status, and confidence.
- Raw field IDs and internal source keys are not shown in the interface.
- Dependency test: 9 passed, 0 failed.
- Authenticated Render dependency test: 9 passed, 0 failed after deployment of commit `314f55a`.
- The dependency test changed all 12 self-assessment inputs from 1 to 5 for the same saved company; the overall score recalculated from 55 to 67.
- Profile quality gate: 210 passed, 0 failed.
- Semantic answer-quality gate: 66 passed, 0 failed.
- Full local intake, report, and asset rendering sweep: 78 passed, 0 failed.

### Ranked Priority Integrity

- Ranked-priority provenance gate: 11 passed, 0 failed.
- Guided save, recalculation, and return gate: 14 passed, 0 failed.
- The round-trip test verified all three user outcomes: the priority changed, the priority did not change, and the priority was resolved or reranked.
- Ranked priorities now expose user-readable evidence sources without showing raw source keys.
- Every priority has exactly one primary action and routes to its exact supporting input or saved execution evidence.
- Missing unsaved inputs remain eligible for improvement routing.
- The save/return regression uses an intercepted synthetic record and does not write test data to persistent storage.
- Profile quality gate: 210 passed, 0 failed.
- Semantic answer-quality gate: 66 passed, 0 failed.
- Full local intake, report, and asset rendering sweep: 78 passed, 0 failed.
- Summary claim dependency gate: 9 passed, 0 failed.
- Render release commit: `a015641`.
- Authenticated Render ranked-priority provenance gate: 11 passed, 0 failed.
- Authenticated Render guided save, recalculation, and return gate: 14 passed, 0 failed.
- Authenticated Render summary claim dependency gate: 9 passed, 0 failed.
- The live round-trip check used an intercepted synthetic copy and did not change the persisted QA company record.

### Phase 1 Completion: Score and Conflict Integrity

- Score separation gate: 14 passed, 0 failed.
- The execution test moved from Not started to 89/100 Supported while GTM readiness remained 57/100.
- Genuine conflict resolution gate: 12 passed, 0 failed.
- Conflict confirmations are tied to the exact compared values; changing either value requires a new decision.
- Source conflicts block generation, while ordinary completeness warnings remain reviewable and nonblocking.
- Focused Phase 1 gates: 60 passed, 0 failed.
- Four-company route and rendering sweep: 78 passed, 0 failed.
- Profile quality gate: 210 passed, 0 failed.
- Semantic answer-quality gate: 66 passed, 0 failed.
- Post-revenue section deep-link gate: 9 passed, 0 failed.
- The route and rendering sweep now fails if raw source keys or internal diagnostic labels appear visibly.
- Phase 1 completion release commit: `31fc7eb`.
- Authenticated Render focused Phase 1 gates: 60 passed, 0 failed.
- Authenticated Render four-company route and asset sweep: 78 passed, 0 failed.

## July 23 Phase 2: Adaptive Intake and AI Assistance

- Schema-driven AI classification and point-of-answer safety gate: 19 passed, 0 failed.
- Eleven high-friction fields now declare assistance mode, dependencies, evidence restrictions, follow-up rules, and prompts.
- Select recommendations are supported at the question.
- Recommendation text is shown before write-back and the current answer remains unchanged until explicit use.
- Explanation-only help for unpublished founder or team background cannot write an AI answer.
- Field requests contain only the context declared for that question.
- Phase 2 point-of-answer release commit: `604ddbf`.
- Authenticated Render AI classification and safety gate: 19 passed, 0 failed.
- Authenticated Render four-company route and asset sweep: 78 passed, 0 failed.
- The live gate waits for saved-record hydration before testing that an AI recommendation leaves the current field unchanged.

### Adaptive Coaching and Uncertainty Paths

- Expanded schema and workflow gate: 28 passed, 0 failed.
- Four-company AI context-isolation gate: 8 passed, 0 failed.
- Adaptive customer and urgency coaching shows three targeted questions before making an AI request.
- `Not sure yet` paths narrow revenue source, sales motion, 90-day goal, and GTM constraint.
- At least one follow-up answer is required before AI generates a recommendation.
- The selected recommendation saves only after explicit approval; the persistence test intercepts the record write and does not modify a QA company.
- All four company types received only their own relevant saved context.
- Full four-company route and asset sweep: 78 passed, 0 failed.
- Adaptive coaching release commit: `9bbb20b`.
- Authenticated Render adaptive workflow gate: 28 passed, 0 failed.
- Authenticated Render four-company AI context-isolation gate: 8 passed, 0 failed.
- Authenticated Render four-company route and asset sweep: 78 passed, 0 failed.

### Answer Review and Proof Coaching

- Expanded Phase 2 workflow gate: 42 passed, 0 failed locally.
- Populated supported fields now expose a separate answer-review action.
- Reviews show a concise reason and proposed revision while preserving the original answer until explicit approval.
- Adaptive coaching now covers broad customer, problem, urgency, offer, measurement, and proof answers.
- Post-revenue proven outcomes and pre-revenue credibility cues support the existing multi-select controls.
- Multi-select AI write-back is limited to schema-approved options and is tested through an intercepted record save.
- Four-company AI context-isolation gate: 8 passed, 0 failed locally.
- Full four-company route and asset sweep: 78 passed, 0 failed locally.
- Profile quality gate: 210 passed, 0 failed locally.
- Semantic answer-quality gate: 66 passed, 0 failed locally.
- Post-revenue section deep-link gate: 9 passed, 0 failed locally.
- Phase 2 answer-review release commit: `42466b7`.
- Authenticated Render Phase 2 workflow gate: 43 passed, 0 failed.
- Authenticated Render four-company AI context-isolation gate: 8 passed, 0 failed.
- Authenticated Render four-company route and asset sweep: 78 passed, 0 failed.
- A read-only request to the real deployed AI endpoint returned both a review assessment and a proposed answer from the configured model.
- The live review request did not write or change a saved record.

## July 23 Phase 3: Canonical Plan Model

- Four-company canonical-plan integrity gate: 30 passed, 0 failed locally.
- Both pre-revenue companies render an explicit Validation mode and the same three actions in the canonical model and Active Plan.
- Both post-revenue companies render an explicit Foundation mode and the same top-three sequence in the summary, ranked plan, 30/60/90 plan, and Active Plan.
- Every canonical action includes an owner, timing, completion rule, evidence requirement, review decision, and destination.
- Semantic-role deduplication prevents two differently worded priorities for the same job from occupying the top three.
- Primary and alternative customer hypotheses remain separate in the canonical model.
- Release commit `d94e173` deployed to Render.
- Authenticated Render canonical-plan integrity gate: 30 passed, 0 failed.
- Authenticated Render full report gate: 78 passed, 0 failed.

### Asset Contracts, Navigation Status, and Export Coverage

- Eleven user-facing plan and workspace types now have explicit purpose and required-content contracts.
- Four-company asset sweep: 44 asset/profile combinations rendered without a page error.
- Asset contract, correct export type, sidebar status, active navigation, clean labels, independent sidebar scrolling, non-overlapping controls, and print-mode checks: 440 passed, 0 failed locally.
- The Validation Workspace correctly uses its separate workbook export instead of presenting the working data grid as a finished PDF asset.
- A headless screenshot review confirmed that asset status and updated dates are stacked beneath asset names and remain readable in the sidebar.
- Phase 3 asset contract release commit: `31e1b5d`.
- Authenticated Render asset contract, navigation, layout, sidebar-scroll, and print-mode gate: 440 passed, 0 failed.
- Authenticated Render canonical-plan integrity gate after the asset release: 30 passed, 0 failed.
- Authenticated Render full report gate after the asset release: 78 passed, 0 failed.

## July 23 Phase 4: Experience Polish and Accessibility

- Four-company experience and accessibility gate: 80 passed, 0 failed locally.
- Multi-select keyboard flow covers open, option focus, Arrow-key movement, Escape, and focus return.
- Shared feedback states cover blank, loading, success, warning, error, accessible status roles, and polite announcements.
- Visible controls have accessible names and rendered pages contain no duplicate IDs in the tested routes.
- Standard table controls now inherit row and column context through programmatic labels.
- Desktop intake navigation scrolls independently and section state survives refresh.
- Mobile intake and asset navigation start compact and identify the current step and section.
- Narrow GTM plans have no horizontal page overflow, clipped visible text, or overlapping action controls.
- Headless visual review confirmed the mobile current-section heading appears directly after the compact navigation.
- Full four-company report gate: 78 passed, 0 failed locally.
- AI classification and write-safety gate: 43 passed, 0 failed locally.
- Guided ranked-priority roundtrip gate: 14 passed, 0 failed locally.
- Post-revenue deep-link gate: 9 passed, 0 failed locally.
- Authenticated Render checks remain pending deployment.
