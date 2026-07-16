# V1 Gap Analysis Preparation

Last updated: 2026-06-18

## Purpose

This document compares the current GTM Tool application against the approved V1 Product Scope Lock.

It uses both Codex prep documents:

- `Codex_Current_State_Analysis_Request.pdf`
- `Codex_V1_Gap_Analysis_Prep_Request.pdf`

The current-state request is treated as the baseline inventory requirement. The V1 gap-analysis request is treated as the product-scope comparison requirement.

Target V1 product definition:

GTM Blueprint Generator powered by Strategic AI.

Included in V1:

- Research Agent
- Discovery Agent
- Strategic Insight Engine
- Confidence Scoring
- Revenue Impact Model
- GTM Blueprint
- CRM Blueprint
- Activity Model
- 30/60/90 Plan

Excluded from V1:

- Revenue Advisor
- AI CRO
- Closed-loop learning
- CRM integrations
- Live prospect monitoring

## Executive Summary

The current application is a strong structured GTM readiness intake and reporting tool. It has most of the raw discovery surface needed for V1, including company context, customer focus, buyer personas, offer readiness, signals, proof, revenue motions, blockers, and 30/60/90 planning.

The biggest V1 gap is that the tool is still primarily an intake/report generator, not yet a Strategic AI-powered GTM Blueprint Generator. It captures many useful inputs, but the strategic reasoning layer, blueprint generation layer, confidence model, revenue impact model, CRM blueprint, and activity model are not yet first-class product outputs.

The current app should not be thrown away. The correct V1 path is to preserve the structured intake, simplify/rename parts of the UX around the V1 blueprint flow, and add an AI strategy layer that turns the collected inputs into ranked decisions, confidence explanations, and blueprint outputs.

## Current-State Baseline Used

The companion current-state export documents are:

- `CURRENT_STATE_ANALYSIS.md`
- `DATA_MODEL.md`
- `SCORING_MODEL.md`
- `AI_WORKFLOWS.md`
- `REPOSITORY_MAP.md`
- `CURRENT_STATE_EXPORT.zip`

Those files document the current application before V1 changes. This V1 prep document uses that baseline to classify what should be kept, modified, removed, or deferred.

### Current Product Overview

The current product is a GTM readiness intake and report generator. It guides a user through structured company, customer, offer, buyer, signal, proof, revenue motion, and planning questions, then generates a readiness score, recommendations, section summaries, and a 30/60/90 plan.

The current user flow is:

1. Start with Company Information.
2. Complete GTM Information.
3. Generate a Quick GTM Readiness Report or continue to Detailed Readiness Report.
4. In detailed mode, complete customer focus, goals, proof, ICP, personas, offer, signals, and revenue motion sections.
5. Generate the report.
6. Copy the report text if needed.

### Current Assessment Workflow

The app currently assesses GTM readiness through:

- 12 manual readiness scores in GTM Information.
- Four report categories: Market and ICP, Offer/Value/Proof, Revenue Motion, and Execution Readiness.
- Segment fit scoring in Best-Fit Customer Focus.
- Offer readiness snapshots.
- Signal readiness snapshots.
- Revenue motion readiness snapshots.
- 30/60/90 success cards and blocker cards.

### Current Data Model Baseline

The current data model is a flat field-key object saved inside company records. Tables and repeatable cards are represented with compound field names such as:

```text
tableId__rowId__columnId
```

Scoped detailed assessments use compound keys such as:

```text
offerAssessments__offer-1__oneSentencePromise
signalPlayAssessments__play-1__buyingTriggerEvents__trigger-1__triggerEvent
revenueMotionAssessments__motion-1__conversionStages__stage-1__stageName
```

This flat model works for the current intake, but V1 needs first-class generated output objects for blueprint, research findings, confidence evidence, CRM blueprint, activity model, and revenue impact model.

### Current Output Baseline

The current output is a readiness report, not yet a full V1 blueprint. It includes:

- overall readiness score
- readiness stage
- score confidence
- scorecard
- quick summary
- top actions
- detail-needed list
- best-fit customer focus summary
- buyer persona summary
- offer readiness summary
- buying signals summary
- customer evidence summary
- revenue motion summary
- stalled deals
- success plan
- blocker summary
- generated 30/60/90 plan
- copyable plain-text report

### Current Technical Baseline

The app is a small Node-served static application:

- Frontend: plain HTML, CSS, and JavaScript.
- Backend: Node HTTP server in `server/server.js`.
- Storage: browser local storage plus `server/data/records.json`.
- APIs: `/api/records`, `/api/records/:id`, and dormant `/api/research`.
- Hosting: Render-compatible Node web service.
- Authentication: optional shared password through `TOOL_PASSWORD`.

### Current AI Baseline

AI API research is currently paused for cost control. The active workflow is Copy Research Prompt, which lets the user paste a structured prompt into ChatGPT and paste useful findings back into Research notes.

The backend still has an optional `/api/research` endpoint that can call OpenAI when `OPENAI_API_KEY` is configured, but the current frontend does not rely on it.

## Feature Inventory

Current major features:

1. Company Information intake
2. Brand record search, browse, save, new, and clear
3. Local and backend JSON record persistence
4. Optional shared-password login
5. Copy Research Prompt workflow
6. Disabled API-backed AI research placeholder
7. GTM Information quick review
8. Manual 12-field readiness scoring
9. Quick report vs detailed report flow
10. Best-Fit Customer Focus
11. Customer segment scoring
12. Revenue Goals, Strategy, and Constraints
13. 30/60/90 success cards
14. Top blockers to resolve
15. Customer Evidence and Traction
16. ICP Hypothesis and Market Segmentation
17. Buyer Personas and Buying Committee
18. Offer Portfolio
19. Offer Readiness assessment
20. Offer readiness snapshot
21. Buying Triggers and Targeting Signals
22. Signal Play portfolio
23. Signal readiness snapshot
24. Revenue Motion portfolio
25. Revenue motion readiness snapshot
26. Pipeline and conversion map
27. Stalled deals and lost momentum capture
28. Results report page
29. Copyable plain-text GTM readiness report
30. Migration layer for legacy saved records
31. Industry, business model, and GTM archetype taxonomy
32. Local launcher scripts
33. Render deployment configuration
34. Existing documentation and current-state export files

## KEEP Features

### Company Information Intake

Category: KEEP

Why: V1 needs reliable company context before research, discovery, scoring, and blueprint generation can produce useful outputs.

Impact on V1: Provides the baseline for Research Agent, Discovery Agent, Strategic Insight Engine, and blueprint personalization.

Dependencies: Taxonomy metadata, public presence table, product/offer URLs, revenue and company stage fields.

Suggested implementation order: Keep as the first product step. Lightly relabel around V1 language if needed, but do not remove.

Rank: Must Have

### Brand Record Save/Browse/New Workflow

Category: KEEP

Why: V1 will need company-level projects or blueprint records.

Impact on V1: Allows multiple companies or clients to be managed in one tool.

Dependencies: Browser storage, backend `/api/records`, record naming, autosave.

Suggested implementation order: Keep during V1. Later harden into project/workspace storage if needed.

Rank: Must Have

### Backend JSON Record Persistence

Category: KEEP

Why: V1 needs persistence before AI-generated outputs can be reviewed, revised, and exported.

Impact on V1: Provides the minimum backend needed for saved blueprints.

Dependencies: `server/server.js`, `server/data/records.json`, record API.

Suggested implementation order: Keep for V1 prototype. Replace with a database only after product logic stabilizes.

Rank: Must Have

### Optional Shared-Password Login

Category: KEEP

Why: V1 may contain sensitive company strategy information, and basic access control is better than an open app.

Impact on V1: Provides lightweight protection for demos or early users.

Dependencies: `TOOL_PASSWORD`, `AUTH_SECRET`, session cookie logic.

Suggested implementation order: Keep. Improve later if multi-user accounts become part of scope.

Rank: Should Have

### Copy Research Prompt Workflow

Category: KEEP

Why: It controls API costs while still supporting research-assisted completion.

Impact on V1: Can act as the low-cost version of the Research Agent until API-backed research is reintroduced intentionally.

Dependencies: Company name, website, current form data, research notes field.

Suggested implementation order: Keep immediately. Upgrade into a structured Research Agent workflow later.

Rank: Must Have

### GTM Information Quick Review

Category: KEEP

Why: V1 needs a short discovery path before asking for detailed inputs.

Impact on V1: Can become the first pass of the Discovery Agent.

Dependencies: 12 manual score fields, quick support fields, quick report path.

Suggested implementation order: Keep, but modify labels and outputs to feed blueprint generation.

Rank: Must Have

### Quick vs Detailed Flow

Category: KEEP

Why: Progressive disclosure is important. Users should not see the full workbook until they choose a deeper review.

Impact on V1: Supports both fast blueprint drafts and deeper blueprint confidence.

Dependencies: `detailedSectionsVisible`, `reviewMode`, render visibility logic.

Suggested implementation order: Keep. Rename around Blueprint Draft vs Full Blueprint Review if appropriate.

Rank: Must Have

### Best-Fit Customer Focus

Category: KEEP

Why: Target customer prioritization is central to a GTM blueprint.

Impact on V1: Feeds ICP selection, offer fit, signal plays, revenue motions, activity model, and 30/60/90 plan.

Dependencies: Possible customer group cards, fit scoring, best-fit profile, avoid-for-now segments.

Suggested implementation order: Keep and make it a first-class Strategic Insight Engine input.

Rank: Must Have

### Customer Segment Scoring

Category: KEEP

Why: V1 needs a way to rank target segments and justify why one segment should be prioritized.

Impact on V1: Feeds top priority segment, do-not-chase segments, confidence scoring, and activity focus.

Dependencies: Possible customer group cards and segment fit fields.

Suggested implementation order: Keep, but expand scoring explanation and connect to blueprint outputs.

Rank: Must Have

### Customer Evidence and Traction

Category: KEEP

Why: Customer evidence is necessary for proof, confidence, segment selection, and revenue impact assumptions.

Impact on V1: Feeds proof readiness, confidence scoring, and strategic recommendations.

Dependencies: Proof candidates, customer evidence inventory, expansion opportunities, delivery fit risks.

Suggested implementation order: Keep. Make proof evidence a direct input to Confidence Scoring.

Rank: Must Have

### Buyer Personas and Buying Committee

Category: KEEP

Why: V1 needs buyer roles, objections, proof needs, and decision dynamics to generate useful messaging and sales activity recommendations.

Impact on V1: Feeds GTM Blueprint, CRM Blueprint, Activity Model, and objection strategy.

Dependencies: Buying overview, role cards, persona priority, buying committee risks.

Suggested implementation order: Keep. Condense the UI if needed, but preserve the data.

Rank: Must Have

### Offer Portfolio and Offer Readiness

Category: KEEP

Why: V1 must know what is being sold, to whom, why now, and with what proof.

Impact on V1: Feeds positioning, value proposition, packaging, pricing, pilot recommendation, proof gaps, and GTM motion.

Dependencies: Offer portfolio, scoped offer assessment panels, readiness snapshot.

Suggested implementation order: Keep. Use the primary offer as the default blueprint offer.

Rank: Must Have

### Buying Triggers and Targeting Signals

Category: KEEP

Why: V1 needs trigger events and targeting signals to create useful GTM and CRM blueprints.

Impact on V1: Feeds Research Agent, CRM Blueprint, Activity Model, lead qualification, and campaign focus.

Dependencies: Shared signal infrastructure, signal play portfolio, signal readiness scoring.

Suggested implementation order: Keep. Reframe as trigger/signal strategy inside the GTM Blueprint.

Rank: Must Have

### Revenue Motion Portfolio

Category: KEEP

Why: V1 must select a revenue motion and define how pipeline is created and advanced.

Impact on V1: Feeds Activity Model, CRM Blueprint, 30/60/90 Plan, and revenue impact assumptions.

Dependencies: Revenue motion portfolio, channel performance, pipeline metrics, conversion stages, routing rules.

Suggested implementation order: Keep. Make primary revenue motion selection a central blueprint decision.

Rank: Must Have

### 30/60/90 Success Cards and Plan Output

Category: KEEP

Why: 30/60/90 Plan is explicitly included in V1 scope.

Impact on V1: Already provides a strong base for the V1 plan output.

Dependencies: Goals section, success cards, blocker cards, results plan builder.

Suggested implementation order: Keep and upgrade from generic plan to AI-generated strategic plan.

Rank: Must Have

### Migration Layer

Category: KEEP

Why: The project has gone through several schema refactors. Removing migration logic could break saved records.

Impact on V1: Protects continuity while the app evolves.

Dependencies: `normalizeRepeatableData` and all migration functions in `tool/app.js`.

Suggested implementation order: Keep through V1. Audit and reduce only after record compatibility requirements are known.

Rank: Should Have

### Taxonomy Layer

Category: KEEP

Why: Industry, business model, and archetype classification are useful for AI prompting, scoring, and blueprint generation.

Impact on V1: Can help the Strategic Insight Engine choose playbook logic.

Dependencies: `tool/gtm-taxonomy.js`, classification metadata in saved data.

Suggested implementation order: Keep and expand only if the V1 strategy logic needs more archetypes.

Rank: Should Have

## MODIFY Features

### Results Report Page

Category: MODIFY

Why: The current report is a readiness report, while V1 requires a GTM Blueprint, CRM Blueprint, Activity Model, Revenue Impact Model, and 30/60/90 Plan.

Impact on V1: This is the main output-layer gap.

Dependencies: Results rendering, scoring, plan generation, copyable report text.

Suggested implementation order: Modify after the blueprint data model is defined. Keep current readiness report as a diagnostic appendix or confidence input.

Rank: Must Have

### Manual 12-Field Readiness Scoring

Category: MODIFY

Why: Manual ratings are useful but not enough for V1 Confidence Scoring.

Impact on V1: Should become one input into confidence, not the entire scoring model.

Dependencies: GTM Information score fields, results scoring formulas.

Suggested implementation order: Preserve the 12 fields, then add evidence-based scoring overlays from detailed sections.

Rank: Must Have

### Offer, Signal, and Revenue Motion Snapshots

Category: MODIFY

Why: These are useful heuristic scorecards, but V1 needs a coherent Strategic Insight Engine with explainable confidence and ranked decisions.

Impact on V1: These snapshots can become sub-scores under the strategic engine.

Dependencies: Snapshot functions in `tool/app.js` and mirrored result functions in `tool/results.html`.

Suggested implementation order: Consolidate snapshot logic into a shared scoring module before adding AI reasoning.

Rank: Must Have

### Copy Research Prompt

Category: MODIFY

Why: V1 includes a Research Agent. A copy prompt is a good interim solution, but V1 needs a more productized research workflow.

Impact on V1: Can become the no-cost or manual Research Agent mode.

Dependencies: Prompt builder, research notes, company website fields.

Suggested implementation order: First improve output format for paste-back. Later add optional API-backed research with explicit user approval.

Rank: Must Have

### Disabled API Research Endpoint

Category: MODIFY

Why: The backend endpoint exists but is disconnected from the active UX.

Impact on V1: Useful foundation for Research Agent if cost controls and user approval are added.

Dependencies: `OPENAI_API_KEY`, `OPENAI_MODEL`, `/api/research`, field update model.

Suggested implementation order: Keep dormant until the Research Agent workflow and cost guardrails are designed.

Rank: Should Have

### Best-Fit Customer Scoring

Category: MODIFY

Why: The current 15-point scoring is useful but not yet tied to revenue impact or confidence.

Impact on V1: Should become part of target prioritization inside the Strategic Insight Engine.

Dependencies: Possible customer group scores, proof evidence, urgency, reach, implementation fit.

Suggested implementation order: Add explanation, confidence, and strategic tradeoffs. Keep UI simple.

Rank: Must Have

### Revenue Goals and Constraints

Category: MODIFY

Why: The current section captures goals and blockers, but V1 needs these translated into activity targets and revenue impact assumptions.

Impact on V1: Feeds Revenue Impact Model, Activity Model, and 30/60/90 Plan.

Dependencies: Success cards, blocker cards, business priority, goals.

Suggested implementation order: Add model-ready fields for target revenue, conversion assumptions, activity capacity, and plan constraints.

Rank: Must Have

### Pipeline and Revenue Motion

Category: MODIFY

Why: Current fields capture pipeline state and conversion stages, but V1 needs an Activity Model and Revenue Impact Model.

Impact on V1: This is the strongest base for model output, but not yet a model.

Dependencies: Pipeline metrics, conversion stages, revenue motion portfolio, next experiment.

Suggested implementation order: Add explicit conversion assumptions, activity volume, capacity, and expected revenue math.

Rank: Must Have

### CRM and GTM Systems Table

Category: MODIFY

Why: Current system capture is descriptive. V1 includes a CRM Blueprint, not CRM integration.

Impact on V1: The table can feed CRM object, field, stage, source, and reporting recommendations.

Dependencies: Company Information `gtmSystems`, revenue tracking system, funnel fields.

Suggested implementation order: Add a CRM Blueprint output and fields for required CRM stages, properties, views, dashboards, and source tracking.

Rank: Must Have

### Copyable Plain-Text Report

Category: MODIFY

Why: Useful, but the copied output should become the V1 blueprint export.

Impact on V1: Gives users an easy way to move the blueprint into docs, CRM notes, or implementation plans.

Dependencies: `buildCopyText`, report page output.

Suggested implementation order: Rework after the new blueprint sections are defined.

Rank: Should Have

### UX Help Definitions

Category: MODIFY

Why: The current helpful definitions are valuable, but V1 should use them to support strategic decision points rather than explain every form field.

Impact on V1: Reduces user confusion and improves data quality.

Dependencies: Help blocks in schema and rendering in app.

Suggested implementation order: Keep only where a user is making a strategic choice or entering model-critical data.

Rank: Should Have

## REMOVE Features

### Duplicate Legacy Report Concepts in User-Facing Output

Category: REMOVE

Why: Older labels and duplicated readiness/report concepts can confuse the V1 promise.

Impact on V1: Cleaner product positioning as a GTM Blueprint Generator.

Dependencies: Results headings, copy text, old hidden raw summary fields.

Suggested implementation order: Remove only after blueprint output replaces readiness-first output.

Rank: Should Have

### User-Facing Legacy Fields That No Longer Match Current Flow

Category: REMOVE

Why: Some legacy field IDs and concepts are still carried for migration but should not appear as active V1 UX.

Impact on V1: Reduces user confusion and prevents overlong intake.

Dependencies: Migration layer and saved records.

Suggested implementation order: Hide from UI first. Do not delete storage migration until old saved data is no longer needed.

Rank: Should Have

### Any Automatic Paid Research Trigger Without User Approval

Category: REMOVE

Why: The user explicitly tabled uncontrolled API research because of cost.

Impact on V1: Prevents surprise usage fees and keeps trust high.

Dependencies: `/api/research`, frontend research button, future Research Agent.

Suggested implementation order: Keep disabled unless an explicit approval and cost-control UX is added.

Rank: Must Have

## DEFER Features

### CRM Integrations

Category: DEFER

Why: CRM integrations are explicitly excluded from V1.

Impact on V1: The product should generate a CRM Blueprint, not connect directly to CRM systems.

Dependencies: None for V1. Future integrations may depend on CRM Blueprint structure.

Suggested implementation order: Defer until after V1 validation.

Rank: Nice To Have

### Live Prospect Monitoring

Category: DEFER

Why: Live prospect monitoring is explicitly excluded from V1.

Impact on V1: Signal strategy should be captured as a blueprint and activity model, not monitored automatically.

Dependencies: Signal plays, data sources, future integrations.

Suggested implementation order: Defer.

Rank: Nice To Have

### Closed-Loop Learning

Category: DEFER

Why: Closed-loop learning is explicitly excluded from V1.

Impact on V1: The app may recommend review cadence, but should not claim to learn automatically from outcomes.

Dependencies: CRM/pipeline integrations and historical activity data.

Suggested implementation order: Defer.

Rank: Nice To Have

### Revenue Advisor / AI CRO

Category: DEFER

Why: Revenue Advisor and AI CRO are explicitly excluded from V1.

Impact on V1: The app should generate a blueprint and plan, not act as an ongoing optimization agent.

Dependencies: Strategy outputs, activity outcomes, CRM data.

Suggested implementation order: Defer until after the V1 blueprint product is stable.

Rank: Nice To Have

### Multi-User Account System

Category: DEFER

Why: Useful later, but not required for V1 if shared-password access is acceptable.

Impact on V1: Avoids distracting from core blueprint generation.

Dependencies: Database, auth provider, user roles.

Suggested implementation order: Defer.

Rank: Nice To Have

### Full Database Migration

Category: DEFER

Why: JSON storage is enough for V1 prototype and early internal testing.

Impact on V1: Speeds up product iteration.

Dependencies: Record schema stabilization.

Suggested implementation order: Defer until multi-user or production volume requires it.

Rank: Nice To Have

## Missing V1 Functionality

### Research Agent

Current state:

- Prompt-copy research exists.
- Backend API research exists but is disconnected from active UX.
- No structured research run state, source tracking, or field-review workflow exists.

Gap:

- V1 needs a clear Research Agent workflow with user-approved scope, source-backed findings, confidence, and paste/apply behavior.

Required additions:

- Research target selection
- Research scope selection
- Source capture
- Research findings model
- Suggested field updates
- User approval before applying updates
- Cost-control guardrails if API-backed

Rank: Must Have

### Discovery Agent

Current state:

- The intake acts as a manual discovery form.
- Help text and progressive disclosure exist.

Gap:

- V1 needs discovery logic that identifies missing answers, asks follow-up questions, and guides the user toward a usable blueprint.

Required additions:

- Missing input detector
- Follow-up question generator
- Required vs optional blueprint input model
- Confidence-aware prompts

Rank: Must Have

### Strategic Insight Engine

Current state:

- The app has heuristic snapshots and report suggestions.
- There is no unified reasoning layer that ranks strategic decisions.

Gap:

- V1 needs a central engine that turns intake data into strategic conclusions.

Required additions:

- Strategic decision model
- Priority segment recommendation
- Primary offer recommendation
- Primary motion recommendation
- Proof gap analysis
- Risk and constraint analysis
- Confidence explanation

Rank: Must Have

### Confidence Scoring

Current state:

- Quick score confidence is based on field completeness.
- Offer/signal/revenue snapshots have heuristic confidence.

Gap:

- V1 needs confidence scoring that considers source quality, evidence strength, completeness, consistency, and uncertainty.

Required additions:

- Confidence inputs by blueprint section
- Evidence strength mapping
- Contradiction/missing-data flags
- Confidence explanations

Rank: Must Have

### Revenue Impact Model

Current state:

- Revenue range, deal size, pipeline metrics, and conversion fields exist.
- No explicit revenue impact model output exists.

Gap:

- V1 needs model outputs such as expected pipeline, expected revenue, assumptions, and sensitivity.

Required additions:

- Target revenue or pipeline goal
- Activity-to-meeting assumptions
- Meeting-to-opportunity assumptions
- Opportunity-to-close assumptions
- Average deal size
- Sales cycle
- Capacity limits
- Scenario outputs

Rank: Must Have

### GTM Blueprint

Current state:

- The report summarizes readiness and sections.
- It does not yet produce a named GTM Blueprint artifact.

Gap:

- V1 needs a final blueprint with strategic decisions and execution guidance.

Required additions:

- Target segment
- Buyer
- Offer
- Positioning
- Proof strategy
- Channel/revenue motion
- Trigger strategy
- Activity model
- 30/60/90 execution plan
- Risks and assumptions

Rank: Must Have

### CRM Blueprint

Current state:

- GTM systems and revenue tracking are captured.
- CRM blueprint is not generated.

Gap:

- V1 needs recommended CRM setup without direct integration.

Required additions:

- Recommended lifecycle stages
- Deal stages
- lead/source fields
- ICP/fit fields
- trigger/signal fields
- activity types
- required dashboards
- routing rules
- owner fields

Rank: Must Have

### Activity Model

Current state:

- Revenue motions capture current activity and next experiments.
- No explicit activity volume model exists.

Gap:

- V1 needs recommended activity volume by motion and time period.

Required additions:

- Target activity type
- Weekly activity volume
- Expected conversion
- Owner/capacity
- Follow-up cadence
- success metric
- stop/scale rule

Rank: Must Have

## Data Model Gaps

1. No first-class blueprint object.
2. No first-class research finding object.
3. No source/citation model.
4. No AI suggestion review/apply state.
5. No confidence evidence model.
6. No revenue impact assumptions object.
7. No CRM blueprint object.
8. No activity model object.
9. No unified strategic recommendation object.
10. No stable output versioning for generated blueprints.

## Scoring Gaps

1. Overall score is manual and subjective.
2. Detailed section data does not directly change the overall score.
3. Confidence is mostly completeness-based.
4. No scoring distinction between user-provided, AI-inferred, and source-backed data.
5. No confidence penalty for contradictions.
6. No revenue impact confidence score.
7. No blueprint-level confidence score.

## Blueprint Generation Gaps

1. Current output is a readiness report, not a GTM Blueprint.
2. CRM Blueprint is missing.
3. Activity Model is missing.
4. Revenue Impact Model is missing.
5. Blueprint sections are not versioned or stored as generated artifacts.
6. There is no review/edit cycle for generated strategic recommendations.
7. There is no executive summary built specifically around the V1 product promise.

## AI Capability Gaps

1. No active API-backed Research Agent in the frontend.
2. No Discovery Agent follow-up logic.
3. No Strategic Insight Engine.
4. No AI-generated blueprint artifact.
5. No AI confidence explanations.
6. No citation/source handling.
7. No user approval flow for AI-suggested field updates.
8. No cost-control UX for paid AI runs.

## UX Gaps

1. Current product still feels like a detailed intake workbook.
2. V1 needs an output-first blueprint experience.
3. The user needs clearer milestones: Research, Discovery, Strategy, Blueprint.
4. The detailed form is long and may feel heavy before the user sees value.
5. Report output should be organized around V1 artifacts, not readiness sections.
6. AI/manual modes need clear language so users understand when costs may occur.
7. Generated recommendations need review controls: accept, edit, reject, mark uncertain.

## Recommended Build Sequence

### Phase 1: Preserve and Reframe the Current App

Rank: Must Have

1. Keep current intake and persistence.
2. Rename output language from readiness report toward GTM Blueprint.
3. Define a first-class blueprint output structure.
4. Map existing intake fields into blueprint sections.
5. Keep quick vs detailed flow.

Dependencies:

- Existing schema
- Results page
- Current state docs

### Phase 2: Add Blueprint Data Model

Rank: Must Have

1. Add blueprint object schema.
2. Add research findings schema.
3. Add confidence evidence schema.
4. Add revenue impact assumptions schema.
5. Add CRM blueprint schema.
6. Add activity model schema.

Dependencies:

- Current flat field model
- Migration strategy
- Results output plan

### Phase 3: Convert Results Page Into Blueprint Output

Rank: Must Have

1. Create GTM Blueprint section.
2. Create CRM Blueprint section.
3. Create Activity Model section.
4. Create Revenue Impact Model section.
5. Preserve readiness score as diagnostic context.
6. Update copy/export text.

Dependencies:

- Blueprint model
- Existing results renderer
- Existing scoring helpers

### Phase 4: Build Strategic Insight Engine

Rank: Must Have

1. Consolidate scoring logic.
2. Rank target segment, offer, signal play, and revenue motion.
3. Identify proof gaps and risks.
4. Generate recommended strategic decisions.
5. Explain confidence and assumptions.

Dependencies:

- Offer, signal, and revenue snapshot logic
- Customer segment scoring
- Evidence/proof fields

### Phase 5: Add Revenue Impact and Activity Models

Rank: Must Have

1. Add explicit revenue assumptions.
2. Create conversion math.
3. Create activity volume recommendations.
4. Connect activity model to 30/60/90 plan.
5. Show assumptions clearly.

Dependencies:

- Revenue motion data
- Pipeline metrics
- Average deal size
- Capacity inputs

### Phase 6: Add CRM Blueprint Output

Rank: Must Have

1. Recommend CRM stages.
2. Recommend CRM fields/properties.
3. Recommend source tracking.
4. Recommend routing rules.
5. Recommend dashboards.

Dependencies:

- Revenue motion
- signal plays
- buyer personas
- GTM systems table

### Phase 7: Productize Research Agent

Rank: Should Have

1. Keep copy-prompt mode.
2. Add structured paste-back parser.
3. Add suggested field updates.
4. Add source tracking.
5. Add optional API-backed research with explicit approval and cost warning.

Dependencies:

- Research findings schema
- Field review/apply UI
- Cost-control rules

### Phase 8: Add Discovery Agent

Rank: Should Have

1. Detect missing blueprint-critical inputs.
2. Generate follow-up questions.
3. Prioritize questions by impact.
4. Let user answer inline.

Dependencies:

- Blueprint required fields
- Confidence model

### Phase 9: Polish UX and Export

Rank: Should Have

1. Make blueprint output the main success moment.
2. Add accept/edit/reject controls for generated recommendations.
3. Improve printable/copyable output.
4. Package exports by blueprint type.

Dependencies:

- Generated blueprint output
- Review state

## Change Ranking

### Must Have

- Preserve current intake and records.
- Define V1 blueprint data model.
- Convert report output into GTM Blueprint output.
- Add CRM Blueprint output.
- Add Activity Model output.
- Add Revenue Impact Model output.
- Add Strategic Insight Engine logic.
- Add explainable confidence scoring.
- Keep API research disabled unless cost-approved.
- Map current fields into V1 blueprint sections.

### Should Have

- Structured research paste-back parser.
- Optional API Research Agent with approval and cost controls.
- Discovery Agent follow-up questions.
- Better source/citation handling.
- Improved copy/export output.
- More concise V1 UX language.
- Preserve migration layer through V1.

### Nice To Have

- CRM integrations.
- Live prospect monitoring.
- Closed-loop learning.
- AI CRO behavior.
- Revenue Advisor behavior.
- Multi-user accounts.
- Full database migration.

## Final Recommendation

The current GTM Tool is a strong V1 foundation, but the next build should shift from adding more intake fields to generating the V1 blueprint artifacts. The intake is now sufficiently rich. The highest-value next work is to create a structured output layer and strategic reasoning layer that transforms the existing data into:

1. GTM Blueprint
2. CRM Blueprint
3. Activity Model
4. Revenue Impact Model
5. 30/60/90 Plan
6. Confidence explanation

That sequence will make the product feel like the approved V1: a GTM Blueprint Generator powered by Strategic AI, rather than a long readiness form with a report attached.
