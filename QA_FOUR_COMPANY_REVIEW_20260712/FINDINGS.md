# GTM OS Four-Company QA Findings

Date: July 12, 2026

## Executive Summary

Four synthetic companies were loaded as saved records and tested in the live local intake and report experience. The review covered pre-revenue DTC, pre-revenue retail-first, healthy post-revenue B2B services, and struggling post-revenue SaaS.

The tool now handles the four core scenarios correctly:

- PawPath Safety produces a DTC validation plan for urban dog owners who walk in low light.
- BrightNest produces a retail-first validation plan for independent natural-home and zero-waste retailers.
- ForgeLine stays focused on specialty manufacturers and no longer receives consumer-product or DTC list-building tactics.
- RelayMetrics uses the stronger professional-services customer evidence instead of repeating the company's assumed SaaS ICP.

The test uncovered and fixed several cross-tool defects. The main structural issue identified in this review, an overall post-revenue readiness score driven mainly by respondent ratings, was implemented after the review on July 13. The score now weights evidence and execution more heavily than self-ratings and applies an uncertainty adjustment when detailed evidence is thin.

## Test Records

| Company | Scenario | Saved record | Result |
| --- | --- | --- | --- |
| QA - PawPath Safety | Pre-revenue physical product, DTC-first | `qa-pre-dtc-pawpath-20260712` | Passed route, segment, plan separation, evidence, and navigation checks |
| QA - ForgeLine Operations | Healthy post-revenue B2B manufacturing consultancy | `qa-post-b2b-forgeline-20260712` | Passed target, offer, buyer, signal, revenue-motion, and industry-relevance checks |
| QA - BrightNest Refill Co. | Pre-revenue physical product, retail-first | `qa-pre-retail-brightnest-20260712` | Passed retail-buyer, segment, validation-plan, and DTC-mismatch checks |
| QA - RelayMetrics | Struggling post-revenue SaaS company testing a new segment | `qa-post-saas-relaymetrics-20260712` | Passed evidence reconciliation, new-segment focus, experiment, and plan checks |

The post-revenue reports originally finished at 86/100 for ForgeLine and 79/100 for RelayMetrics. Those July 12 scores reflect the former model and should not be compared directly with the evidence-weighted score introduced July 13.

## Fixes Made During QA

### Intake and Saved Data

- Fixed multi-select storage so commas inside a valid answer no longer split one selection into several disconnected bullets.
- Preserved legacy comma-separated selections by matching them against the source question's known choices.
- Fixed section navigation so the URL, visible intake section, and left progress indicator remain synchronized.
- Verified that refreshing a direct intake-section URL restores the same section and indicator.
- Verified that comma-heavy multi-select answers remain selected after saving and reopening the record.

### Saved Record Loading

- Fixed reports that could prefer an older browser-cached record over the newer saved server record.
- A report opened with a `recordId` now loads that saved record first and uses browser data only as a fallback.
- Preserved the active record when report links send the user back to a specific intake section.

### Pre-Revenue Plans

- Kept the Validation Plan and GTM Plan as separate assets with separate section sets.
- Confirmed that both assets appear in report navigation and include a clear Back to Intake Form link.
- Made the selected primary buying path control the validation plan instead of combining every route mentioned elsewhere.
- Promoted the specific segment definition to the primary first-win segment name.
- PawPath now shows "Urban dog owners who walk before sunrise or after dark at least four times per week," not only "End users with a specific use case."
- BrightNest now shows "Independent natural-home and zero-waste retailers with one to five locations in Colorado and Utah," not only "Channel buyers or partners."
- Removed dense pipe-separated experiment prose and rendered structured plan details as bullets.

### Post-Revenue Action Plans

- Stopped using the seller's industry as the target-account industry when a more specific target vertical is available.
- Removed consumer-product search tactics from manufacturing and professional-services plans.
- Replaced "define one motion" advice when a named motion already exists with advice to operationalize that motion.
- Separated motion status from revenue-data quality.
- Removed a fake Motion Gap field when the detailed revenue-motion assessment has no low-scoring gap.
- Made stalled-deal evidence actionable and linked missing evidence back to the relevant intake area.
- Changed the main confidence label to Assessment Input Confidence and explained that high input confidence does not mean the GTM motion is proven.
- Changed generic proof advice to use the actual missing assets. ForgeLine now receives ROI calculator and proposal template as its proof priorities.
- Combined duplicate signal rows and stopped showing outreach channel under "Where to verify it."
- Corrected buyer-summary punctuation and several recommendation grammar issues.

## Scenario Learnings

### Pre-Revenue DTC

The system can produce a useful DTC validation plan when route, buyer, problem, segment definition, evidence, ask, and decision rules are all present. The plan correctly emphasizes interviews, product feedback, price feedback, waitlist evidence, and a measurable 30-day decision.

### Pre-Revenue Retail-First

The buying path must be treated as the primary planning constraint. End-consumer demand can support the retail case, but it must not turn the plan into a DTC test. BrightNest now keeps the retailer as the first buyer and uses consumer demand as supporting sell-through evidence.

### Healthy Post-Revenue B2B

A healthy company still needs improvement priorities, but those priorities should optimize an existing motion rather than imply that no motion exists. ForgeLine now receives a referral-motion operating test, a target-list review, and its specific missing proof assets.

### Struggling Post-Revenue SaaS

The strongest behavior in the current tool is evidence reconciliation. RelayMetrics' assumed SaaS segment scored below the professional-services segment, so the report correctly recommends a controlled professional-services test. It does not simply repeat the original ICP assumption.

## Remaining Improvements

### 1. Make the Overall Score Evidence-Weighted

Implemented July 13. Detailed customer, offer, buyer, signal, proof, and revenue-motion evidence now directly influence the overall score, alongside execution coverage and an explicit uncertainty adjustment.

Recommended next model:

- Score customer priority, offer readiness, proof, buying process, targeting signals, revenue motion, and execution data as separate evidence-based dimensions.
- Weight verified evidence more heavily than respondent opinion.
- Apply an uncertainty penalty when a recommendation depends on assumptions or conflicting sources.
- Show the three exact evidence changes that would improve the overall score most.

### 2. Reduce Report Repetition

The post-revenue report still repeats recommended focus, biggest risk, top action, and 90-day direction across Overview Dashboard, Insights, Action Summary, and Strategic Insights.

Recommended next structure:

- One decision summary.
- One ranked action plan.
- One section for each strategy area with evidence, decision, and next action.
- Supporting score detail available through See more rather than repeated prose.

### 3. Scale Target-List Recommendations

The 50-account target-list recommendation is fixed across most B2B scenarios. The list size should respond to market size, sales capacity, expected response rate, deal value, and validation objective.

### 4. Distinguish Optimization From Remediation

High-scoring companies should receive optimization language. Lower-scoring companies should receive foundation or remediation language. The actions are now more accurate, but the same priority framework is still used for both.

### 5. Add Automated Regression Assertions

The four saved fixtures should become a repeatable regression suite. Each release should automatically verify:

- selected route and first-win segment;
- absence of cross-industry recommendations;
- preservation of multi-select values;
- record refresh behavior;
- correct report asset type;
- alignment of top three priorities with the detailed plan;
- absence of placeholder, AI, or unexplained confidence copy.

## Verification Completed

- Live local pages loaded for all four saved records.
- Both pre-revenue asset types were opened for both pre-revenue companies.
- Both post-revenue action plans were expanded and reviewed.
- Intake section navigation and refresh restoration were tested.
- Multi-select save and reload behavior was tested.
- JavaScript syntax checks passed for the intake, schema, server, report script, and fixture generator.
- No formal unit or end-to-end test framework currently exists; this QA run used repeatable fixtures plus live browser checks.
