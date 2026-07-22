# GTM Tool Product Review and Four-Company QA Plan

Date: July 21, 2026

## Purpose

This package defines the next full product review of the GTM Tool. The review will test whether the tool is:

- easy enough for a first-time founder;
- rigorous enough for an experienced GTM consultant;
- accurate across pre-revenue, post-revenue, consumer, mixed-channel, and SaaS businesses;
- able to turn intake answers into coherent decisions, plans, and usable work products;
- explicit about what is saved evidence, what is inferred, and what is recommended;
- free from filler answers, cross-company leakage, and internally visible system logic.

## Package Contents

1. `01_HEAD_OF_PRODUCT_RECOMMENDATIONS.md` - product assessment and improvement priorities.
2. `02_FOUR_COMPANY_QA_TEST_PLAN.md` - end-to-end test procedure.
3. `03_NEW_QA_COMPANY_PROFILES.md` - four new test scenarios and operating context.
4. `04_ANSWER_QUALITY_AND_AI_REVIEW_STANDARD.md` - standards for every answer and AI interaction.
5. `05_IMPLEMENTATION_ROADMAP.md` - ordered build sequence and implementation instructions.
6. `06_ACCEPTANCE_SCORECARD.md` - release gates and review scorecard.
7. `07_QA_DATA_REPLACEMENT_PLAN.md` - safe retirement of the previous QA records.

## Recommended Working Method

The test and implementation work should happen in four passes:

1. Establish new clean QA records and verify record isolation.
2. Complete the intake as the actual founder or executive would, recording friction and semantic defects as they occur.
3. Generate and inspect every applicable output and execution asset.
4. Prioritize findings by user harm, fix the highest-value issues, and rerun the same records as regression fixtures.

The old QA companies should remain temporarily as a comparison baseline. They should be removed only after all four replacement records save, reload, render, and pass cross-record isolation checks.

## Product Rule

Do not create a separate asset merely because an activity exists. Create an asset only when it gives the user a structured place to turn a recommendation into work, collect evidence, and make a decision. Otherwise, keep the activity inside the plan or the asset where it is used.

## Definition of Done

The review is complete when:

- four new companies have every applicable field completed with question-specific answers;
- all saved answers survive refresh, record switching, and reloading;
- every report claim traces to saved evidence, a clearly labeled inference, or a recommendation;
- all applicable assets render and can be printed or downloaded;
- no company sees another company's data, examples, or recommendations;
- every improvement route returns the user to the place where they started;
- the resulting prioritized backlog has owners, acceptance criteria, and implementation order;
- the prior QA records are removed after the replacement suite passes.

