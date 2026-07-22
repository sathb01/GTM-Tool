# Head of Product Recommendations

## Product Position

The GTM Tool should behave like a guided operating system, not a long questionnaire and not a static report generator. A new founder should feel that the tool helps them think. A seasoned consultant should see disciplined logic, explicit evidence, editable recommendations, and useful execution assets.

The central experience should be:

1. Understand the company and its current decision.
2. Recommend a focused answer using known evidence.
3. Ask only the follow-up questions needed to improve that answer.
4. Show what changed and why.
5. Turn the decision into work, evidence collection, and a review rule.

## Highest-Priority Improvements

### 1. Make Trust Visible

**Problem:** A polished recommendation is not useful if the user cannot tell where it came from or whether the tool misunderstood an answer.

**Improve:**

- Label important output statements as `From your intake`, `Inferred from your answers`, or `Our recommendation`.
- Keep internal record keys, scoring rules, and system labels behind the scenes.
- For each score or priority, show the strongest supporting evidence and the exact missing evidence that would change it.
- Detect conflicting answers before report generation and ask the user to resolve only genuine conflicts.
- Never treat an unanswered field as negative evidence without explaining that it is missing.

**Success measure:** A user can explain why each top recommendation appears and where to improve it without searching the report.

### 2. Replace Form Completion With Guided Decisions

**Problem:** Dropdowns reduce typing but do not necessarily help a user make a good decision.

**Improve:**

- Start each section with the decision being made and the previously selected context.
- Present one recommended answer or a short recommended subset at the question where it is needed.
- Use conditional follow-up questions only when an answer lacks needed specificity.
- Ask for examples, quantities, constraints, or observable traits only when relevant to the user's wording.
- Add `I do not know` where uncertainty is realistic, followed by a short diagnostic sequence.
- Remove questions whose answers can be safely derived from existing intake data.

**Success measure:** A new user can complete the intake without outside GTM knowledge, while a consultant can revise assumptions and add nuance.

### 3. Build an AI Assistance Ladder

**Problem:** One generic AI help button cannot serve research, explanation, synthesis, and coaching equally well.

**Improve:**

- **Research:** Propose public company facts with sources and confidence.
- **Explain:** Define the question in the company's context and show a relevant example.
- **Recommend:** Produce a suggested answer from saved inputs, clearly separated from evidence.
- **Coach:** Ask two to five adaptive follow-ups when the current answer is too broad, contradictory, or unmeasurable.
- **Review:** Check the draft answer for specificity, reachability, measurability, and fit with earlier answers.
- **Synthesize:** Turn selected answers into a concise, editable statement.

AI must never invent customer evidence, silently write an answer, or reuse another company's example. The user must select `Use this answer` before any suggestion is saved.

**Success measure:** AI reduces blank or vague answers without increasing unsupported claims.

### 4. Make Every Score Actionable

**Problem:** Scores lose credibility when users add meaningful information and cannot see why the score did or did not change.

**Improve:**

- Show the score dimensions and the saved evidence counted in each.
- Preview which input changes can affect the score before sending the user back to the intake.
- After saving an improvement, recalculate immediately and show `changed`, `unchanged`, or `more evidence required`.
- Separate readiness, confidence, and execution progress. Completing work should not falsely prove market fit.
- When the score is below 50, lead with a small immediate foundation action, not a long plan.

**Success measure:** Every score has a clear explanation, a direct improvement route, and predictable recalculation.

### 5. Make Outputs Decision-Oriented

**Problem:** Thorough output can become repetitive information rather than an executable plan.

**Improve:**

- Use one plan summary, one ranked action plan, and one detailed section per major decision area.
- Eliminate repeated ICP, opportunity, risk, and focus statements unless repetition supports a distinct task.
- For each recommendation show: decision, evidence, rationale, action, owner, timing, completion rule, and next review.
- Distinguish validation work, foundation work, and optimization work.
- Keep supporting details collapsed and printable without hiding critical actions.

**Success measure:** The top three actions match the detailed plan, and no section gives conflicting direction.

### 6. Turn Assets Into Workspaces

**Problem:** A downloadable brief is useful for sharing; an execution asset must also help someone do the work.

**Improve:**

- Keep ICP, personas, and plan summaries printable and downloadable.
- Give validation tests, messaging, proof, outreach, and weekly review a structured place to perform work and capture evidence.
- Respect CRM and spreadsheet ownership rather than duplicating systems of record.
- Show assets consistently in side navigation, with clear status and last update.
- Provide clean print/PDF output without navigation or controls.

**Success measure:** Every asset has a clear job: communicate a decision, perform work, collect evidence, or make a review decision.

### 7. Improve Continuity and Orientation

**Problem:** Long intakes and linked improvements create navigation and memory burden.

**Improve:**

- Restore the exact record, section, and question after refresh.
- Use guided round trips for every improvement and work link.
- Keep one consistent top-level navigation model across intake and outputs.
- Show autosave state, unresolved requirements, and section completion without interrupting progress.
- Open internal tool links in the same application flow unless a new window is explicitly useful for comparison.

**Success measure:** A user can leave for several days, return, and know the current target, current decision, and next action within 15 seconds.

### 8. Add a Product Quality System

**Problem:** A large schema with conditional fields cannot be safely maintained by manual spot-checking.

**Improve:**

- Make the four new QA records permanent synthetic regression fixtures.
- Add question-to-answer semantic checks, not only blank-field checks.
- Test all multi-selects, Other definitions, conditional paths, save/reload, report routes, and improvement round trips.
- Add cross-company leakage scans for names, examples, and recommendations.
- Add content contracts for each scenario and output.
- Run non-window headless checks locally and against Render for each release.

**Success measure:** The release suite catches repeated options, invisible selections, filler content, stale data, and route mismatches before a user does.

## Consultant-Grade Differentiators

After the foundation is reliable, the strongest differentiators are:

- hypothesis and evidence ledgers that show what is known, assumed, and newly learned;
- scenario comparison for segments, offers, and motions;
- decision-quality scoring based on evidence strength, not document completeness;
- recommendation rationale that a consultant can challenge and edit;
- role-specific sharing packages for founders, sales, marketing, and advisors;
- an evidence-to-decision loop that updates the plan without rewriting validated work;
- optional benchmarks only when a credible comparison dataset exists.

Version history should remain deferred until production storage, user accounts, retention, backup, and deletion rules are defined.

