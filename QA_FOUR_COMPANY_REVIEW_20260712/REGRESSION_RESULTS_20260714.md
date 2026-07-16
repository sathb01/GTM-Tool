# GTM OS Four-Company Regression Results

Date: July 14, 2026

## Result

- 87 assertions passed
- 0 assertions failed
- 0 warnings remain
- No browser-window automation was used

## Companies Checked

- QA - PawPath Safety: pre-revenue, DTC-first physical product
- QA - BrightNest Refill Co.: pre-revenue, retail-first physical product
- QA - ForgeLine Operations: healthy post-revenue B2B services company
- QA - RelayMetrics: post-revenue SaaS company testing whether its assumed ICP is wrong

## What the Regression Suite Verifies

- All four saved records exist and contain the required company and stage data.
- Pre-revenue and post-revenue routing remains distinct.
- PawPath remains DTC-first and uses its specific low-light dog-walking segment.
- BrightNest remains retail-first and preserves retailer economics and buyer context.
- ForgeLine remains focused on specialty manufacturers, its core throughput offer, its COO buyer, and its referral motion.
- RelayMetrics uses the stronger professional-services evidence without losing the original assumed SaaS segment as an explicit hypothesis.
- Bare `Other`, unresolved `AI please`, and unexplained AI recommendation placeholders do not appear in the four fixture records.
- Every current asset is available from both intake and report navigation.
- Messaging, Target List, Proof Asset, Outreach, Pipeline, and Weekly Review workspaces each have state, save, and render contracts.
- The Pipeline workspace supports CRM source-of-truth behavior and feeds opportunity evidence into the Weekly GTM Review.
- Asset links do not repeat `Open` before the asset name.

## Defect Fixed

PawPath had contradictory saved workflow metadata: `toolMode` and company stage identified it as pre-revenue, while `reviewMode` said `detailed`. The renderer still selected the correct experience, but the record contained two competing answers.

The fixture was corrected and both intake and report loading now normalize `reviewMode` to `preRevenue` whenever `toolMode` is `Pre-Revenue Validation`.

## Verification Boundaries

This run intentionally avoided browser-window automation because it has repeatedly closed the user's application window. Verification used JavaScript syntax checks, JSON parsing, source contracts, saved-record assertions, route checks, and local HTTP checks.

Visual layout, focus behavior, and manual control interactions still require user review or an explicitly requested browser-based session.

## Repeat the Check

Run:

```text
node QA_FOUR_COMPANY_REVIEW_20260712/regression-check.mjs
```

The command exits with an error when a required scenario, route, asset contract, or cross-asset rule fails.
