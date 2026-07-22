# Four-Company QA Test Plan

## Test Objective

Test the tool as four real operators with different levels of GTM maturity. The test must find semantic, usability, reasoning, persistence, output, and design problems, not merely prove that pages load.

## Phase 1: Establish Clean Records

1. Create four new record IDs with no copied intake or execution data.
2. Confirm every new record opens in Company Information with no inherited section, example, recommendation, or pending autosave.
3. Switch among all four records and verify company name, saved answers, recommendations, and active section remain isolated.
4. Keep the previous QA records temporarily for comparison only.

## Phase 2: Complete Every Applicable Intake Path

For each company:

1. Answer as the named founder or executive, using the profile in this package.
2. Complete every visible and applicable field, including conditional follow-ups, repeatable rows, multi-selects, and Other definitions.
3. After each section, save, leave the section, return, and confirm the answers persist.
4. Record whether the question was understandable without GTM expertise.
5. Record whether the answer could have been derived from earlier information.
6. Record whether static choices fit the company, or adaptive AI guidance would be better.
7. Flag any answer that is technically accepted but semantically wrong for the question.
8. Flag repeated questions, duplicate choices, irrelevant channel assumptions, and mixed buying paths.

## Phase 3: Test AI Assistance

At representative questions in every section, test:

- question explanation;
- company-specific example generation;
- suggested answer generation;
- review of a vague answer;
- adaptive follow-up questions;
- use of public research where appropriate;
- refusal to invent private facts or customer evidence;
- `Use this answer` write-back and persistence;
- record isolation after switching companies.

AI output should be scored for relevance, specificity, factual grounding, grammatical fit, and whether it makes the next decision easier.

## Phase 4: Generate and Review Outputs

Generate every applicable output and asset for each company. Verify:

- the recommended customer, buyer, problem, offer, route, and motion agree across outputs;
- scores and confidence match saved evidence;
- the top three actions align with the detailed plan;
- no output includes filler, internal labels, raw object text, unexplained `Other`, or another company's content;
- each improvement link lands on the exact input to review and returns to the originating output;
- printable and downloadable assets have clean hierarchy, page breaks, and no interface controls;
- execution assets provide a usable workspace or a clear CRM/spreadsheet setup guide;
- changing an input recalculates all dependent outputs.

## Phase 5: Test Execution Loops

For applicable plans:

1. Start an action and save partial progress.
2. Complete some, but not all, weekly tasks.
3. Carry unfinished work forward and verify the next week stays understandable.
4. Capture evidence and record a continue, revise, pause, or stop decision.
5. Confirm execution progress changes plan status without falsely increasing evidence confidence.
6. Confirm the plan identifies the next action after the decision.

## Phase 6: Design and Accessibility Review

Review desktop and narrow layouts using isolated, non-window checks plus manual user review where visual judgment is required.

Check:

- hierarchy and scanability;
- navigation scroll and current-section state;
- button placement, labels, contrast, and hover states;
- multi-select visibility and keyboard behavior;
- loading, blank, save, success, and error states;
- table overflow and responsive behavior;
- print and PDF layouts;
- absence of overlapping controls and text.

## Phase 7: Findings and Rerun

1. Classify each finding as Blocker, High, Medium, or Low.
2. Group findings by root cause rather than reporting every symptom separately.
3. Fix Blocker and High issues first.
4. Rerun the full suite on the same four records.
5. Promote the records and their content contracts to permanent regression fixtures.
6. Remove the previous QA records only after the replacement suite passes.

## Required Test Evidence

- field coverage report;
- semantic answer-quality report;
- AI assistance report;
- persistence and record-isolation report;
- output and asset consistency report;
- design and accessibility findings;
- prioritized product backlog;
- final pass/fail scorecard.

