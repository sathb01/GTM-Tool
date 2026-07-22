# Answer Quality and AI Review Standard

## The Semantic Fit Rule

An answer passes only when it answers the exact question asked. Being relevant to the company is not enough.

For every answer, check:

1. **Directness:** Does it answer the requested decision, fact, condition, or measure?
2. **Specificity:** Could a colleague act on it without asking what a generic phrase means?
3. **Scope:** Does it refer to the selected customer, offer, buying path, or motion?
4. **Evidence status:** Is it clearly a fact, observation, assumption, inference, or recommendation?
5. **Measurability:** If the question asks about success, urgency, fit, or a decision rule, is it observable?
6. **Grammar:** Does the saved choice read correctly in the generated sentence or bullet group?
7. **Uniqueness:** Is it a thoughtful answer rather than copied filler reused across unrelated fields?
8. **Consistency:** Does it agree with earlier answers, or is a real conflict explicitly resolved?

## Automatic Failure Conditions

- company description pasted into unrelated fields;
- taxonomy label used where a specific customer or use case is required;
- `Other` without a definition;
- internal key, record ID, placeholder, or system label in user-facing content;
- a recommendation presented as customer evidence;
- a score claim without an explanation of counted evidence;
- a multi-select answer that disappears after selection or reload;
- an output that references more than one offer, segment, or path as though there were only one;
- another company's name, example, segment, buyer, or recommendation;
- advice that says to define something already defined.

## AI Opportunity Classification

Classify every intake question into one of five modes:

### A. Ask Directly

Use when only the respondent can know the answer, such as budget, capacity, internal ownership, or unpublished performance.

### B. Recommend From Existing Answers

Use when the tool already has enough context to propose a strong answer, such as a synthesized customer statement, message angle, likely buying committee, or validation method.

### C. Research and Propose

Use for public facts such as industry, locations, product descriptions, visible pricing, published customers, and public channels. Show sources and confidence.

### D. Adaptive Coaching

Use when a broad answer needs conditional refinement. For example, if the user says `small retailers`, ask only for relevant size, geography, category, operational, and buying signals.

### E. Derive Silently and Show for Confirmation

Use for deterministic transformations such as carrying selected customer groups into an offer, turning a named cadence into a review schedule, or grouping selected evidence by decision rule. Never ask the user to retype it.

## AI Review Rubric

Score each AI interaction from 0 to 2 on:

- company relevance;
- question relevance;
- grounding in saved evidence;
- appropriate uncertainty;
- specificity and measurability;
- useful next step;
- concise, natural language;
- safe write-back behavior.

A production-ready interaction must score at least 13 of 16, with no zero for grounding or safe write-back.

## Guided Question Design

- Show the current recommendation beside the control where the decision is made.
- Keep recommended sets intentionally small; classify secondary items as optional or nice to know.
- When the user chooses `I do not know`, ask a short diagnostic and return a recommendation.
- When the user chooses `Other`, require a definition before saving.
- When a question applies once per selected channel, offer, segment, claim, or proof item, repeat it for each selected item.
- Never make the user remember content from the top of a long section.

