# Plan Health Dashboard QA

Run completed: 2026-07-14

## Purpose

The Plan Health Dashboard gives the user one operating view of what needs attention now. It summarizes existing assets rather than creating another independent task list.

## Dashboard Contents

- Current plan status
- Current evidence state
- Current priority
- Active Plan completion
- Open opportunities
- Decisions waiting for review
- Overdue commitments across targets, outreach, and pipeline
- Work marked In progress, Waiting, or Blocked
- Exactly three ordered next steps

## Priority Rules

1. Unreviewed evidence decisions come before execution tasks.
2. Overdue commitments come before new work.
3. Challenged evidence comes before adding activity volume.
4. Existing in-progress work comes before not-started work.
5. The dashboard points back to the original workspace where work should be completed.

## Decision Lifecycle

- Supported evidence does not create a waiting strategy decision.
- An unreviewed challenged test changes Plan Health to Attention required.
- Evidence Reconciliation becomes the first next step.
- After the evidence-driven change is applied or dismissed, that evidence fingerprint leaves the decision queue.
- The same evidence does not repeatedly ask for the same approval.

## Focused QA

- Four supported company dashboards show no unnecessary waiting decision.
- Every dashboard contains exactly three ordered next steps.
- A controlled challenged record elevates Evidence Reconciliation to Next 1.
- Applying the strategy change clears the waiting decision.
- Focused evidence and dashboard checks: 8 passed, 0 failed.
