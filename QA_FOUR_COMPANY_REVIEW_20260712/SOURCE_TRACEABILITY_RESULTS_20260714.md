# Source Traceability QA

Run completed: 2026-07-14

## What Changed

Recommendations now include an expandable `Why this?` section in the places where users decide what to do next:

- Plan Health current priority
- Plan Health next three steps
- Active Plan priorities
- Evidence Reconciliation proposals
- Post-revenue Ranked Action Plan priorities

## Trace Contents

Each trace separates:

- Rule used to create or rank the recommendation
- Relevant customer, problem, offer, channel, or motion answer
- Saved execution metrics when available
- Latest evidence decision
- Direct link to the original intake section or execution workspace

The source links do not create a second copy of the answer. Intake links open the original source section in a separate browser tab, while execution evidence links open the relevant saved asset.

## QA Coverage

- Four fully populated companies: Plan Health and Active Plan source traces
- Challenged evidence case: Evidence Reconciliation source trace
- ForgeLine and RelayMetrics: every Ranked Action Plan priority has a rule and at least one source link
- No unresolved placeholder or cross-company content

## Defect Found and Fixed

The audit found two different report helpers named `targetListCriteria`. The later Target List workspace helper replaced the earlier Ranked Action Plan helper at runtime, leaving the Ranked Action Plan empty. The workspace helper now has a distinct name, restoring the ranked plan and preventing the two asset paths from overwriting each other.
