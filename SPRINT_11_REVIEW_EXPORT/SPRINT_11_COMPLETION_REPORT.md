# Sprint 11 Completion Report

## Summary

Sprint 11 refactored the pre-revenue customer hypothesis work into the new **Think Big, Start Small** module.

User-facing module name:

**Think Big, Start Small**

Subtitle:

**Find your first market, focus your GTM, and generate early revenue.**

The module now helps a pre-revenue user move from a broad market idea to candidate first-win market segments, compare those segments with deterministic pre-revenue scoring, and generate a First-Win Market Segment plan.

## Files Modified

- `tool/intake-schema.js`
- `tool/app.js`
- `tool/results.html`
- `tool/index.html`

## Module Placement

The module lives inside the pre-revenue intake path and replaces the previous generic **Customer Hypotheses** section.

Current pre-revenue sequence:

1. Company Information
2. Pre-Revenue Context
3. Think Big, Start Small
4. Problem and Urgency Hypothesis
5. Wedge Offer
6. Buyer and Discovery Plan
7. Validation Motion
8. Evidence Tracker

## New / Updated Data Model Fields

Broad market fields:

- `preBroadMarket`
- `preBroadMarketProblem`
- `preBroadCustomerTypes`
- `preFirstCustomerTypes`

Candidate segment table:

- `preCustomerHypotheses__segment-N__segmentName`
- `preCustomerHypotheses__segment-N__description`
- `preCustomerHypotheses__segment-N__problem`
- `preCustomerHypotheses__segment-N__whyNow`
- `preCustomerHypotheses__segment-N__likelyBuyer`
- `preCustomerHypotheses__segment-N__reachability`
- `preCustomerHypotheses__segment-N__credibility`
- `preCustomerHypotheses__segment-N__validationPath`
- `preCustomerHypotheses__segment-N__deliveryFit`
- `preCustomerHypotheses__segment-N__revenuePotentialContext`
- `preCustomerHypotheses__segment-N__risks`
- `preCustomerHypotheses__segment-N__assumptions`
- `preCustomerHypotheses__segment-N__evidenceAvailable`
- `preCustomerHypotheses__segment-N__evidenceNotes`
- `preCustomerHypotheses__segment-N__buyingRequirements`
- `preCustomerHypotheses__segment-N__implementationRequirements`
- `preCustomerHypotheses__segment-N__riskRequirements`
- `preCustomerHypotheses__segment-N__timingRequirements`
- `preCustomerHypotheses__segment-N__successRequirements`

Scoring fields:

- `preCustomerHypotheses__segment-N__problemIntensity`
- `preCustomerHypotheses__segment-N__urgencyTrigger`
- `preCustomerHypotheses__segment-N__reachabilityScore`
- `preCustomerHypotheses__segment-N__credibilityRightToWin`
- `preCustomerHypotheses__segment-N__validationSpeed`
- `preCustomerHypotheses__segment-N__deliveryFitScore`

## Scoring Logic

The first-win segment score uses Sprint 11 weights:

- Problem Intensity: 20%
- Urgency / Trigger: 15%
- Reachability: 20%
- Credibility / Right to Win: 15%
- Validation Speed: 20%
- Delivery Fit: 10%

Each score field uses a 1-5 scoreSelect control and is converted to 0-100.

## Evidence Strength Logic

Evidence strength is calculated separately from score.

High evidence examples:

- pilot interest
- design partner interest
- LOI or commitment
- paid discovery interest
- willingness-to-test or willingness-to-pay signal
- repeated buyer validation

Medium evidence examples:

- buyer or prospect conversations
- founder/domain experience
- prototype or demo feedback
- competitor/workaround evidence
- community or advisor signals

Low evidence:

- mostly assumptions
- founder intuition only
- generic market trend
- no direct evidence captured

## Confidence Logic

Confidence is shown as Low, Medium, or High and is based on evidence strength plus segment score, reachability, and validation speed.

High confidence still means **high-confidence hypothesis to test first**, not a proven ICP.

## Recommendation Logic

The First-Win Market Segment is not selected by raw score alone.

The recommendation considers:

- weighted segment score
- evidence strength
- validation speed
- reachability
- credibility / right to win
- delivery fit
- urgency

If a large segment scores poorly on reachability or validation speed, it should not win simply because it seems valuable.

## Report Output Updated

The pre-revenue report now renders:

- Think Big, Start Small Summary
- Recommended First-Win Market Segment
- Why This Segment First
- Confidence
- Evidence Strength
- Evidence, Assumptions, and Gaps
- What Must Be True
- Derived ICP Draft
- 30-Day Revenue Validation Plan
- Next Best Questions
- Top 3 Actions
- Segments to Avoid for Now
- Score Details

## Guardrails Added

- The module now starts with broad market hypothesis fields.
- Candidate segments require a 2-5 segment comparison model.
- The app warns/prevents report generation if fewer than two meaningful candidate segments are entered.
- The app warns/prevents report generation when a segment is only a broad "everyone/all businesses" style segment without problem and reachability detail.

## Non-Regression Testing

Completed:

- `node --check tool/app.js`
- `node --check tool/intake-schema.js`
- extracted inline `tool/results.html` script and ran `node --check`
- verified local intake URL returns 200
- verified local results URL returns 200

Verified URLs:

- `http://localhost:8787/index.html?v=20260705-sprint11-think-big-start-small`
- `http://localhost:8787/results.html?v=20260705-sprint11-think-big-start-small`

## Intentionally Deferred

- AI conversational advisor
- adaptive next-question engine
- ChatGPT backend
- web research
- automated market research
- LinkedIn/prospect search
- CRM integration
- automated account list generation
- full replacement of the existing ICP section
- post-revenue scoring redesign

## Screenshots / PDF Exports

Screenshots and PDF exports were not captured in this pass.
