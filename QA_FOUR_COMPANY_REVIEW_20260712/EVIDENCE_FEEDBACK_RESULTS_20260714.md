# Evidence Feedback Loop QA

Run completed: 2026-07-14

## What Changed

Saved execution work now feeds back into the GTM plan. The system reads structured evidence from validation interviews, message results, proof usage, outreach assignments, pipeline opportunities, and saved weekly decisions.

The Active Plan shows:

- Current evidence state: Untested, Emerging, Supported, or Challenged
- Recommended decision
- Exact evidence currently counted
- Bounded readiness-score effect
- The next action implied by the evidence

When a sufficient test is challenged, the evidence-based revision becomes Priority 1 in the Active Plan and ranked action plan.

## Scoring Guardrails

- Activity alone cannot manufacture market confidence.
- Positive evidence requires a meaningful next step, confirmed problem pattern, or active opportunity.
- Negative evidence can challenge the current GTM hypothesis.
- The score effect is bounded from -3 to +6 within the applicable readiness input.
- Intake answers remain the starting hypothesis and are not silently overwritten.

## Focused Evidence Tests

- Four fully populated company records: Supported
- Controlled 20-attempt, zero-reply record: Challenged
- Challenged record recommended decision: Revise one core variable
- Challenged record Active Plan Priority 1: Revise one core variable
- Focused checks: 5 passed, 0 failed

The repeatable test is `evidence-feedback-check.mjs`.

## Evidence Reconciliation

The Evidence Reconciliation workspace closes the approval loop without silently rewriting the assessment.

- One evidence-driven change can be pending at a time.
- The user chooses the affected segment, problem, offer, message, channel, or revenue-motion field.
- The current source answer and proposed replacement are shown together.
- Apply writes the approved value to the original intake field.
- Revise saves the proposal without changing the intake.
- Dismiss preserves the decision without changing the intake.
- History retains the previous value, approved value, decision, date, rationale, and supporting evidence.

The focused QA applies a challenged problem-statement proposal, verifies the source-field update, verifies that pending work clears, and verifies that the applied decision appears in history.
