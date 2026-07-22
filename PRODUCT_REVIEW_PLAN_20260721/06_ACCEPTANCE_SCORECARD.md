# Product Review Acceptance Scorecard

Score each category from 0 to 5 for each company and for the tool overall.

## Categories

| Category | 0 | 3 | 5 |
| --- | --- | --- | --- |
| Orientation | User cannot tell where to start | Path is usable with some searching | Current context and next action are immediately clear |
| Question clarity | Questions require interpretation | Most questions are understandable | Every question is contextual, precise, and answerable |
| Guidance | Tool mainly collects answers | Recommendations exist inconsistently | Guidance is timely, specific, and editable |
| Semantic accuracy | Outputs misuse or mix answers | Minor mismatches remain | Every answer and output claim fits its exact role |
| AI usefulness | Generic, unsafe, or irrelevant | Helpful in selected cases | Grounded, adaptive, concise, and safely reviewable |
| Evidence discipline | Facts and recommendations are mixed | Some provenance is visible | Evidence, inference, uncertainty, and advice are explicit |
| Insight power | Output restates intake | Some prioritization is useful | Tool finds non-obvious, defensible priorities and tradeoffs |
| Actionability | Recommendations lack execution detail | Main actions can be started | Every priority becomes owned work with evidence and rules |
| Output coherence | Plans conflict or repeat heavily | Mostly aligned | One consistent story across every output and asset |
| Asset usefulness | Assets are decorative or duplicative | Some are usable | Every asset communicates, performs work, captures evidence, or supports a decision |
| Persistence | Answers or progress are lost | Core data persists | All state survives refresh, switching, and round trips |
| Record isolation | Cross-company leakage occurs | No known leakage | Automated leakage tests pass across all records |
| Visual design | Controls overlap or hierarchy fails | Generally usable | Calm, consistent, accessible, and polished across viewports |
| Sharing | Outputs are hard to distribute | Some downloads work | Every relevant asset prints and downloads cleanly |

## Release Gates

The review cannot pass with:

- any cross-company data leakage;
- any lost saved answer or execution status;
- any blank page or failed applicable asset;
- any top-three action that conflicts with the detailed plan;
- any AI-generated evidence presented as fact;
- any unexplained internal label, bare Other, placeholder, or filler answer;
- any improvement route that fails to update its dependent output.

## Target Scores

- No category below 4.
- Overall average at least 4.3.
- Orientation, semantic accuracy, evidence discipline, persistence, and record isolation must each score 5.
- At least two first-time-user sessions and one experienced GTM reviewer should complete a moderated review before alpha expansion.

## Findings Format

Each finding should include:

- company and path;
- question, output, or asset;
- observed behavior;
- expected behavior;
- root cause when known;
- user impact;
- severity;
- recommended fix;
- acceptance test;
- screenshot or saved output reference when useful.

