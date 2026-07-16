# Complete Asset Render and Persistence QA

Run completed: 2026-07-14

## Scope

The isolated headless suite checks the four original QA company records and the four fully populated replacements across every applicable report and execution asset.

- Pre-revenue DTC product: PawPath
- Pre-revenue retail-first product: BrightNest
- Post-revenue B2B services: ForgeLine
- Post-revenue SaaS: RelayMetrics

## Results

- Asset render checks: 84 passed, 0 failed
- Save-and-reload checks: 26 passed, 0 failed
- Fully populated records retain zero blank applicable intake fields
- The suite uses an isolated headless browser and does not open or control the user's browser window

## Assets Covered

- Active Plan
- ICP Brief
- Personas
- Buyer Conversation and Messaging Kit
- Target List
- Proof Assets
- Outreach Sequence
- Pipeline and Opportunity Workspace
- Weekly Review
- Pre-revenue GTM Plan
- Pre-revenue Validation Plan
- Pre-revenue Validation Workspace

## Defect Found and Fixed

The post-revenue ICP Brief crashed while deriving target-list criteria because the messaging-profile helper assumed every input contained a `modules` array. The helper now accepts incomplete profiles safely, and the target-list criteria function now accepts either a messaging profile or a report model.

## Repeatable Checks

- `headless-all-assets-check.mjs` runs the complete render and persistence suite.
- `headless-icp-render-check.mjs` runs the focused ICP render check.
- `headless-save-diagnostic.mjs` provides focused save-event diagnostics for the Active Plan and Outreach Sequence.

The generated `headless-all-assets-output.txt` contains the latest machine-readable summary.
