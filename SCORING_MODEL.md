# GTM Tool Scoring Model

Last updated: 2026-07-13

## Scoring Layers

The app currently has four scoring layers:

1. Overall GTM readiness score that combines assessment ratings with detailed evidence and execution coverage.
2. Four-category scorecard derived from the 12 assessment ratings.
3. Best-fit customer group scoring for customer prioritization.
4. Heuristic readiness snapshots for offer, signal plays, and revenue motions.

## Overall Readiness Score

The overall readiness score is calculated in `tool/results.html`. It starts with the 12 fields listed in `schema.scoreFields`, then gives more weight to evidence and execution that the company has actually captured in the intake.

Fields:

- `marketUrgency`
- `icpClarity`
- `positioningClarity`
- `offerClarity`
- `pricingConfidence`
- `channelFocus`
- `salesMotion`
- `contentAssets`
- `funnelTracking`
- `experimentReadiness`
- `budget`
- `teamCapacity`

Each field is expected to be a 1-5 rating. Missing values count as 0 because the final denominator remains all 12 score fields. The ratings are one input, not the entire readiness score.

Formula:

```text
self-assessment score = round((sum of 12 score fields / 12) * 20)

overall readiness score =
  45% evidence coverage
  30% execution coverage
  15% self-assessment score
  10% assessment-input confidence
  minus an uncertainty adjustment of up to 12 points when detailed evidence coverage is low
```

Evidence coverage looks for customer evidence, an offer with a defined problem and value claim, buyer context, proof, and signal detail. Execution coverage looks for an identified revenue motion, channels, activity targets, conversion stages, and a defined CRM or pipeline view.

The uncertainty adjustment prevents a confident self-rating from appearing more proven than the underlying intake supports. It decreases as detailed evidence coverage approaches 75/100.

### Saved execution evidence feedback

Saved work from the Validation Workspace, Messaging Kit, Proof Assets, Outreach Sequence, Pipeline, and Weekly Review feeds back into the plan. The system classifies the current evidence as:

- Untested: no completed execution evidence is saved.
- Emerging: some evidence exists, but the test is not large enough to change the hypothesis materially.
- Supported: a sufficient test has produced a meaningful commitment, confirmed problem pattern, or active opportunity.
- Challenged: a sufficient test or saved decision indicates that the segment, message, offer, channel, or timing should change.

Execution evidence applies a bounded adjustment of -3 to +6 points to the execution-readiness input. Because that input is 30% of the post-revenue overall score, the effect on the overall score remains intentionally small. Pre-revenue plans apply the same bounded adjustment directly to the first-win hypothesis score.

Activity volume alone cannot create market confidence. The evidence state also requires outcomes and decision discipline. A challenged test can replace the first Active Plan and ranked-action priority with a recommendation to revise or stop before adding volume.

## Readiness Stages

The overall score maps to these stages:

| Score | Stage |
| --- | --- |
| 82-100 | Scale-ready |
| 66-81 | Validation-ready |
| 50-65 | Foundation needed |
| 0-49 | Immediate foundation action |

## Four Scorecard Categories

The results page groups the 12 score fields into four categories.

### Market and ICP

Fields:

- `marketUrgency`
- `icpClarity`

Low-score move:

Narrow the market and validate the best-fit customer with recent customer, prospect, or win/loss evidence.

### Offer, Value, and Proof

Fields:

- `positioningClarity`
- `offerClarity`
- `pricingConfidence`
- `contentAssets`

Low-score move:

Package the offer around one measurable buyer outcome, improve proof, and clarify why the buyer should act now.

### Revenue Motion

Fields:

- `channelFocus`
- `salesMotion`
- `funnelTracking`

Low-score move:

Focus on one primary revenue source, define the sales process, and track conversion from lead to closed revenue.

### Execution Readiness

Fields:

- `experimentReadiness`
- `budget`
- `teamCapacity`

Low-score move:

Assign a GTM owner, protect execution time, confirm budget boundaries, and run a weekly learning rhythm.

## Category Interpretation

Category scores are averages on a 1-5 scale.

| Category score | Interpretation |
| --- | --- |
| 4.0-5.0 | Strong |
| 3.0-3.99 | Usable but needs sharpening |
| 2.0-2.99 | Partially defined |
| 0.1-1.99 | Weak or inconsistent |
| 0 | Missing |

## Score Confidence

The report calculates quick score confidence separately from the score.

Base support fields:

- `quickBestFitCustomer`
- `quickBuyerProblem`
- `quickUrgencyNow`
- `quickOfferPromise`
- `quickPrimaryOutcome`
- `quickSuccessMeasure`
- `quickPrimaryRevenueSource`
- `quickCurrentSalesMotion`
- `quick90DayGoal`
- `quickBiggestConstraint`
- `quickStopAvoid`
- `weeklyRevenueHours`

Confidence rules:

- High: at least 9 support fields are filled.
- Medium: at least 5 support fields are filled.
- Low: fewer than 5 support fields are filled.
- In detailed mode, confidence can increase by one level if at least 3 detailed sections have meaningful data.

## Suggestions

The report builds improvement suggestions from:

- low scorecard categories under 3.5
- missing proof/reference candidates
- proof candidates that do not have permission status
- stalled deals caused by weak proof, pricing concern, implementation risk, or no urgency
- buyer persona recommendations

If no categories are low, the report recommends documenting and scaling the current winning motion while continuing disciplined experiments.

## Best-Fit Customer Group Scoring

The current customer group scoring uses five 1-3 fields:

- urgency
- ability to pay
- ease of access
- proof/customer evidence
- implementation fit

Maximum score:

```text
15 points
```

Recommendation bands:

| Score | Recommendation |
| --- | --- |
| 13-15 | Strong first focus |
| 9-12 | Possible focus |
| 6-8 | Needs evidence |
| 0-5 | Do not chase yet |

The report sorts possible customer groups by score, identifies a likely top priority segment, and can flag weak segments as do-not-chase-yet targets.

## Offer Readiness Snapshot

Offer readiness is calculated for the primary offer or a selected offer row. The app scores eight dimensions on a 0-5 basis:

- ICP-offer alignment
- Problem urgency
- Measurable value
- Promise and positioning
- Buying path
- Packaging and pricing
- Proof readiness
- Risk reduction

Formula:

```text
offer score = round((sum of scored dimension points / 40) * 100)
```

Offer readiness stages:

| Score | Stage |
| --- | --- |
| 80-100 | Ready to sell |
| 60-79 | Ready for focused testing |
| 35-59 | Needs offer definition |
| 0-34 | Underbuilt |

Offer snapshot confidence:

- High: at least 7 dimensions have non-zero scoring data.
- Medium: at least 4 dimensions have non-zero scoring data.
- Low: fewer than 4 dimensions have non-zero scoring data.

Offer snapshot outputs:

- score
- stage
- confidence
- strengths
- gaps
- next moves

## Signal Readiness Snapshot

Signal readiness is calculated per signal play. The app scores six dimensions on a 1-5 basis:

- Trigger clarity
- Fit signal clarity
- Negative signal clarity
- Data source availability
- Scoring / routing readiness
- Signal-based action readiness

Formula:

```text
signal readiness score = round((average dimension score) * 20)
```

Signal readiness stages:

| Score | Stage |
| --- | --- |
| 82-100 | Signal strategy operational |
| 66-81 | Signal strategy usable |
| 46-65 | Signal foundation needed |
| 0-45 | Signal strategy unclear |

Signal confidence:

- High: play context, data sources, routing rules, and action plan are present.
- Medium: play context and data sources are present.
- Low: missing context or source/action data.

## Revenue Motion Readiness Snapshot

Revenue motion readiness is calculated per revenue motion. The app scores eight dimensions on a 1-5 basis:

- Channel focus
- Channel evidence
- Pipeline visibility
- Sales process clarity
- Conversion health
- Ownership and capacity
- Stalled-deal learning
- Next experiment clarity

Formula:

```text
revenue motion readiness score = round((average dimension score) * 20)
```

Revenue motion stages:

| Score | Stage |
| --- | --- |
| 82-100 | Revenue motion scale ready |
| 66-81 | Revenue motion validation ready |
| 46-65 | Revenue motion foundation needed |
| 0-45 | Revenue motion unclear |

Revenue motion confidence:

- High: at least 6 dimensions score 4 or higher.
- Medium: at least 3 dimensions score 4 or higher.
- Low: fewer than 3 strong dimensions.

## Plan Generation

The 30/60/90 plan is built from:

- explicit 30/60/90 success cards when provided
- the weakest scorecard categories
- blocker cards
- expansion opportunities
- buyer persona recommendations
- offer readiness next moves
- signal readiness next moves
- revenue motion next moves

Default plan phases:

1. Days 1-30: Diagnose and focus
2. Days 31-60: Build the GTM test
3. Days 61-90: Learn and operationalize

## Scoring Risks and Improvement Opportunities

- The 12 core score fields are self-rated and subjective, so they intentionally carry only 15% of the overall score.
- Missing score fields reduce the total score because the denominator stays at 12.
- The four scorecard categories remain a readable view of the self-assessment ratings; detailed evidence and execution coverage affect the overall readiness score directly.
- Offer, signal, and revenue motion snapshots are heuristic and should be treated as directional.
- Best-fit customer group scoring currently emphasizes five practical fit criteria. Strategic value, sales-cycle fit, and revenue potential are captured but are not the core 15-point score.
- Future AI scoring should explain confidence and cite which fields caused each recommendation.
