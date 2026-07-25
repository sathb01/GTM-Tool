# Screen and Action Inventory

## Primary Screens

| Current surface | Current role | Decision |
| --- | --- | --- |
| Intake | Foundation capture and revision | Keep as Company Setup; demote after plan generation |
| GTM Plan Summary | Recommendation and ranked plan | Keep; make the only strategic overview |
| Plan Status | Freshness, progress, and next steps | Combine into Plan Summary and This Week |
| Active Plan | Weekly execution | Rename visually to This Week and make the default work surface |
| Ranked Action Plan | Priority explanation | Keep inside Plan Summary; do not duplicate in Active Plan |
| Evidence Reconciliation | Internal evidence-to-source workflow | Hide as a primary destination; surface only a precise proposed change |

## Reference Assets

| Surface | User job | Decision |
| --- | --- | --- |
| ICP Brief | Understand and communicate the selected customer | Keep as a printable reference |
| Persona Brief | Understand buying roles and conversation context | Keep as a printable reference |
| GTM Plan PDF | Share the current decision and plan | Keep as an export from Plan Summary |

## Work Tools

| Surface | User job | Decision |
| --- | --- | --- |
| Messaging Kit | Build, use, and learn from messages | Keep as a workspace |
| Proof Asset Builder | Turn evidence into usable proof | Keep as a workspace |
| Outreach Sequence | Build and track a bounded sequence | Keep as a workspace |
| Target List Setup | Translate ICP into CRM or spreadsheet criteria | Keep only as a handoff tool |
| Validation Workspace | Collect target-level validation evidence | Keep for validation plans |
| Weekly GTM Review | Interpret weekly evidence | Combine with This Week where possible |
| Pipeline Workspace | Summarize pipeline learning without replacing CRM | Keep only when the plan needs pipeline evidence |

## Navigation and Transition Audit

| Current pattern | Problem | Target behavior |
| --- | --- | --- |
| All outputs listed under Assets | Reading and working surfaces look equivalent | Separate Reference Assets from Work Tools |
| Plan Status is a peer of Plan Summary and Active Plan | Users must infer how three plan pages differ | Integrate status and retain two plan destinations |
| Back to Intake remains visually prominent | Suggests intake revision is normal execution | Rename to Company Setup and place last |
| Internal links normally use same window | Work context can be lost | Work tools stay in flow; reference assets open separately |
| Top section navigation | Adds choices without changing the user's job | Remove unless a page genuinely requires local tabs |
| Expand all | Encourages overwhelming full-page views | Use purposeful disclosures with state-specific defaults |
| Generic related-asset blocks | Links exist without a task reason | Show references beside the exact task |
| Improve buttons | Presence can imply required remediation | State the exact gap and make revision explicitly optional |
| Separate action runner | Duplicates status and evidence entry | Complete ordinary GTM actions directly in This Week |

## Content Audit Questions

Every visible block must pass all four:

1. What user decision or action does this support?
2. Is this the best place for it?
3. Is it already stated elsewhere?
4. What happens if it is removed?

If a block supports no action, repeats another block, or exposes internal logic,
remove it from the default experience.

## High-Risk Redundancies

- GTM readiness and plan status presented as separate concepts without a clear
  operational difference.
- Top three actions repeated in summary, ranked plan, Active Plan, and
  supporting sections.
- Weekly evidence captured both inside a priority and in a separate review
  workspace.
- Customer, offer, and buyer context repeated above several assets.
- Improvement routes that ask for fields already saved.
- Reference assets displayed as destinations even when the current task does not
  require them.

## Required Instrumentation

The regression suite should track:

- number of clicks from Plan Summary to the first weekly task;
- number of page transitions required to complete a priority;
- number of intake visits during ordinary weekly work;
- whether the task reference is visible without searching;
- whether status and evidence persist after refresh;
- whether the next action is visible in the first viewport;
- horizontal overflow, control overlap, and clipped text;
- cross-company content leakage.
