# Usability Simplification Brief

## Product Diagnosis

GTM Intelligence OS produces useful recommendations, but its interface exposes
too much of the system that produces them. Intake sections, score remediation,
plan sections, assets, workspaces, evidence reconciliation, and quality checks
can all appear as separate destinations.

The resulting burden is not a lack of information. It is the need to remember:

- which page owns the current task;
- whether a link is required or optional;
- whether an asset is for reading or working;
- whether a change belongs in the plan or the intake;
- how to return after following a recommendation;
- which of several similar pages represents the current source of truth.

## Target Operating Model

### 1. Define

The intake establishes company context, customer, offer, buyer, motion,
constraints, and evidence. It is the setup process, not the daily workspace.

### 2. Decide

The plan summary explains the current recommendation, top three priorities, and
why they were selected. It provides one clear action: begin the current week.

### 3. Execute

`This Week` becomes the default operating workspace after the plan is accepted.
It includes priorities, completion rules, references, owner, evidence capture,
status, and week-close controls.

### 4. Learn

Closing the week records outcomes and decides what continues, changes, pauses,
or needs more evidence. Completed work does not carry forward.

### 5. Revise

Foundational intake answers are revised only when evidence, new information, or
a corrected assumption requires a change. Ordinary plan execution never
requires returning to the intake.

## Information Architecture

### Plan

- This Week
- Plan Summary

Plan status is shown inside these two surfaces. It is not a separate primary
destination.

### Reference Assets

- ICP Brief
- Persona Brief

Reference assets communicate decisions. They can be opened separately, printed,
or downloaded while the user keeps the working plan open.

### Work Tools

- Messaging Kit
- Proof Asset Builder
- Outreach Sequence
- Target List Setup
- Validation Workspace, when applicable
- Weekly Review, when it is not already handled by the current week

Tools perform work and save evidence. They should not restate the plan.

### Company Setup

- Intake and foundational answers

Company Setup remains available but visually secondary after a plan exists.

## This Week Experience

The first viewport should answer:

- What are we trying to accomplish in the next 30 days?
- What must I do this week?
- What does done mean?
- What reference should I use?
- Where do I record the result?

Each priority contains:

- action title;
- why it matters;
- this week's output;
- completion rule;
- short execution steps;
- relevant reference assets;
- owner and status;
- one evidence/result field.

The four-week outlook, week-close form, and history use progressive disclosure.
They do not compete visually with current work.

## Interaction Rules

1. One primary action per screen or workflow state.
2. No generic links to related pages.
3. No internal tool link opens a new page unless side-by-side reference is
   useful.
4. Reference assets may open separately; work tools stay in the same flow.
5. Every cross-surface link explains why the user would use it.
6. Intake revision links are optional and say what evidence would justify a
   change.
7. Plan work is saved in the plan or tool where it is performed.
8. Users never enter the same evidence twice.
9. Internal scoring, quality, source-trace, and reconciliation logic stays
   behind the scenes unless it creates a specific user action.
10. Returning users see the current week and next action before supporting
    detail.

## Visual Rules

- Current work has the strongest contrast and visual weight.
- Supporting context uses quiet, compact panels.
- Future work and history start collapsed.
- No more than three priority cards appear at once.
- Cards are used for individual work items, not for every page section.
- Coral is reserved for primary actions and active focus.
- Status uses restrained semantic colors.
- Long supporting explanations are hidden behind clear `Why this matters` or
  `Plan outlook` disclosures.
- Reference links are secondary controls and never compete with task completion.
- Desktop and mobile layouts preserve a stable reading order.

## Simplification Decisions

### Remove as primary destinations

- Plan Status
- Evidence Reconciliation
- generic section jump navigation
- generic `Use this plan in` maps
- separate action-runner pages for ordinary GTM priorities
- repeated intake-revision buttons that do not name a real gap

### Combine

- plan health and freshness into Plan Summary and This Week;
- weekly review and close-week decision into This Week;
- task guidance, references, status, and evidence in one priority card;
- recommendation rationale with the recommendation it explains.

### Keep, but demote

- Company Setup after plan generation;
- four-week outlook;
- weekly history;
- score detail;
- supporting recommendation evidence.

### Keep as distinct workspaces

- Messaging Kit;
- Proof Asset Builder;
- Outreach Sequence;
- Validation Workspace;
- Target List Setup when it produces a CRM or spreadsheet handoff.

## Implementation Order

1. Reclassify navigation into Plan, Reference Assets, Work Tools, and Company
   Setup.
2. Make This Week the visual center of the Active Plan.
3. Integrate plan status into Plan Summary and This Week.
4. Collapse future weeks, week close, and history until relevant.
5. Remove generic and duplicate transitions.
6. Add clear task-level reference and work-tool guidance.
7. Test complete novice and consultant journeys with four synthetic companies.
8. Measure clicks, context switches, dead ends, and time to identify the next
   action.

## Success Definition

A returning user should understand the current focus and next action within
15 seconds. A user should be able to complete a weekly priority, save evidence,
and close the week without visiting the intake or guessing which asset to open.
