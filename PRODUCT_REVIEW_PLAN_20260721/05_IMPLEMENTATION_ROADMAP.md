# Prioritized Implementation Roadmap

## Phase 0: Test Foundation and Data Safety

**Order:** First

### Build

- Four clean synthetic records from the profiles in this package.
- A schema-driven applicable-field enumerator.
- Save, reload, refresh, and record-switch checks.
- Cross-record leakage scan for company names and scenario-specific phrases.
- A question-to-answer semantic review log.

### Implementation Instructions

1. Create a new fixture generator; do not overwrite the previous generator until the replacement suite passes.
2. Store canonical profile facts separately from generated field answers so tests can detect unsupported additions.
3. Map each populated field to a profile fact, a permitted inference, or an explicit test assumption.
4. Save through the same record API used by the application and compare the reloaded object exactly.
5. Add tests for blank-company startup, multi-select display, Other detail, conditional fields, and active-section restoration.

### Exit Criteria

- Zero blank applicable fields.
- Zero semantic-fit failures.
- Zero cross-record leakage.
- Exact API save/reload match.

## Phase 1: Trust, Persistence, and Score Integrity

**Order:** Second

### Build

- Central field-to-output source map.
- Explicit evidence, inference, and recommendation labels.
- Dependency-driven recalculation after saves.
- Score detail showing counted evidence and next score-changing inputs.
- Genuine conflict detection with a user resolution step.

### Implementation Instructions

1. Define a reusable output-claim object containing value, source fields, status, confidence, and improvement route.
2. Replace user-facing string assembly that loses provenance with these claim objects in top-level summaries.
3. Recalculate affected models after every guided improvement save before returning to the report.
4. Add a test that changes one source field and verifies every dependent output updates.
5. Keep internal quality checks in diagnostics unless the user can take a clear action from them.

### Exit Criteria

- Every top recommendation is traceable.
- Score changes are predictable and immediately visible.
- No internal labels appear in reports.

## Phase 2: Adaptive Intake and AI Assistance

**Order:** Third

### Build

- Question classification using the five AI opportunity modes.
- Company-specific recommendations shown at the point of answer.
- Adaptive coaching for broad customer, problem, offer, proof, and motion answers.
- `I do not know` diagnostic paths.
- AI review of vague, contradictory, or unmeasurable answers.

### Implementation Instructions

1. Add metadata to the schema for answer mode, context dependencies, evidence restrictions, and follow-up rules.
2. Start with the highest-friction decisions: customer definition, problem and urgency, first-win segment, offer outcome, proof, buyer committee, channel, motion, and decision rules.
3. Send only relevant saved context to AI and label recommendations separately from evidence.
4. Require explicit `Use this answer` before write-back.
5. Test recommendations on all four company types to prevent technology-only or product-specific option sets.

### Exit Criteria

- No generic company example is hard-coded.
- AI does not invent private facts or evidence.
- Recommended answers are visible where the user chooses them.
- Completion time and vague-answer rate improve in moderated tests.

### Implementation Status - July 23, 2026

- The five opportunity modes are represented across field assistance, reviewed company research, and deterministic recommendation controls.
- Customer, problem, urgency, offer, measurement, proof, first-win rationale, channel, motion, goal, and constraint decisions have schema-declared context and safety rules.
- Broad customer, problem, offer, measurement, urgency, and proof answers use guided follow-ups.
- Supported uncertain selections use a three-question narrowing path.
- Answer reviews explain broad, inconsistent, unsupported, or unmeasurable wording and require explicit approval before saving a revision.
- Automated safety, context-isolation, persistence, semantic, profile, route, and asset gates pass locally.
- The final completion-time and vague-answer-rate exit criterion requires moderated alpha sessions and remains a product validation measure rather than an automated code gate.

## Phase 3: Decision-Oriented Plans and Assets

**Order:** Fourth

### Build

- One coherent plan summary and ranked action plan.
- Clear validation, foundation, and optimization modes.
- Direct mapping from recommendation to action, evidence, completion rule, and review decision.
- Consistent print/PDF controls and clean export styles.
- Asset navigation with status and last-updated information.

### Implementation Instructions

1. Create a canonical plan model before rendering different pages or downloads.
2. Deduplicate repeated statements by semantic role, not only exact text.
3. Make the top three priorities the source for detailed action ordering.
4. Create a separate asset only when it supports structured work, evidence collection, or a decision.
5. Add content contracts for ICP, personas, messaging, proof, validation, weekly review, and plan summary.

### Exit Criteria

- No conflicting priorities across outputs.
- Every action has an owner, timing, completion rule, and destination.
- Every applicable asset prints and downloads cleanly.

## Phase 4: Experience Polish and Accessibility

**Order:** Fifth

### Build

- Consistent navigation and guided round trips.
- Stable control placement and responsive layouts.
- Keyboard-accessible multi-selects and clear focus states.
- Standard loading, blank, saved, warning, and error states.
- Section context recaps and concise progress indicators.

### Implementation Instructions

1. Create shared components and CSS rules for actions, status, section headers, selected lists, and export controls.
2. Remove one-off page-specific button positioning.
3. Test desktop and narrow viewports with content-length stress cases.
4. Keep side navigation independently scrollable and preserve section state on refresh.
5. Run an accessibility scan and manually inspect reading order and keyboard flow.

### Exit Criteria

- No overlap, clipped text, invisible selections, or inconsistent action placement.
- A returning user understands location and next action within 15 seconds.

## Phase 5: Release Quality System

**Order:** Continuous after the first four phases

### Build

- Permanent four-company regression fixtures.
- Local and Render non-window test runs.
- Machine-readable results and a human release summary.
- A release gate that blocks unresolved cross-record, persistence, semantic, or render failures.

### Implementation Instructions

1. Run syntax, schema, route, persistence, asset, content, and responsive checks for every release.
2. Keep fixture data synthetic and clearly named.
3. Bump frontend asset markers before deployed validation.
4. Verify the deployed marker before running Render tests.
5. Archive results by date without storing real customer data.
