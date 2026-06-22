# Agent Instructions for GTM-Tool

Last recovered: 2026-06-22

## Read first

The original Codex chat history may not be available in the sidebar. Treat the files on disk as the source of truth.

Before making changes, read these context files:

1. `CURRENT_STATE_ANALYSIS.md`
2. `DATA_MODEL.md`
3. `SCORING_MODEL.md`
4. `AI_WORKFLOWS.md`
5. `REPOSITORY_MAP.md`
6. `CHANGE_LOG.md`
7. `PROJECT_CONTEXT.md`
8. `SPRINT_9_REVIEW_EXPORT/SPRINT_9_COMPLETION_REPORT.md`
9. `SPRINT_9_REVIEW_EXPORT/KNOWN_ISSUES.md`

## Project overview

GTM-Tool is a browser-based GTM readiness intake and reporting application.

It supports:

- a Quick GTM Readiness Report using Company Information and GTM Information
- a Detailed Readiness Report with the full intake workbook
- saved company/brand records
- readiness scoring and score confidence
- portfolio-based offer, signal, and revenue-motion analysis
- generated GTM blueprint/report output
- remediation interview questions and execution coaching plans in the report

The app has evolved beyond the original static MVP. It is now a Node-served frontend with optional password protection and a lightweight JSON record API.

## Current architecture

- `server/server.js` serves `tool/`, login pages, record APIs, and the optional AI research endpoint.
- `tool/index.html` is the intake UI.
- `tool/intake-schema.js` is the main schema source of truth.
- `tool/app.js` renders the intake, handles autosave, migrations, dynamic cards/tables, snapshots, and research-prompt generation.
- `tool/results.html` renders the GTM report, scoring, recommendations, remediation interview, execution coaching plans, and copy/export text.
- `tool/gtm-taxonomy.js` defines industry, business model, and GTM archetype data.
- `tool/ai-research.js` is intentionally disabled so the browser does not call paid AI research.
- `server/data/records.json` stores server-side saved records and should not be committed with real client data.

Run locally with:

```text
npm start
```

Then open:

```text
http://localhost:8787
```

Preferred local launcher for the user:

```text
Open GTM Tool.vbs
```

## Current product flow

The default intake shows:

1. Company Information
2. GTM Information
3. report buttons

Detailed mode reveals:

1. Best-Fit Customer Focus
2. Revenue Goals, Strategy, and Constraints
3. Customer Evidence and Traction
4. ICP Hypothesis and Market Segmentation
5. Buyer Personas and Buying Committee
6. Offer Readiness: Problem, Value, Price, and Proof
7. Buying Triggers and Targeting Signals
8. Revenue Motion, Channels, and Pipeline

## Important current concepts

- The 12 core readiness ratings live in GTM Information and drive the 0-100 readiness score.
- Best-Fit Customer Focus uses possible customer group cards and a 15-point customer-fit score.
- Offer Readiness is portfolio-based through `offerPortfolio`; full readiness analyses are scoped under `offerAssessments__offer-N__...`.
- Buying Triggers and Targeting Signals are portfolio-based through `signalPlayPortfolio`; full signal analyses are scoped under `signalPlayAssessments__play-N__...`.
- Revenue Motion is portfolio-based through `revenueMotionPortfolio`; full motion analyses are scoped under `revenueMotionAssessments__motion-N__...`.
- Migration logic in `tool/app.js` is critical. Preserve legacy field IDs and migrations unless explicitly replacing old saved-record support.
- The report now includes remediation rules and execution coaching plans from Sprint 9.

## AI research position

App-side AI research is paused for cost control.

Current user workflow:

1. User enters company name and/or website.
2. User clicks `Copy Research Prompt`.
3. User runs the prompt in ChatGPT.
4. User pastes useful findings back into the tool.

Do not reconnect browser-triggered paid AI research unless the user explicitly asks for it and approves the cost/control model.

The backend `/api/research` endpoint still exists and can call OpenAI when configured, but the frontend should not rely on it by default.

## Sprint 9 latest state

Sprint 9 modified:

- `tool/results.html`
- `tool/app.js`

Implemented report content for:

- remediation rules: ICP Focus, Revenue Motion, Proof / Business Case, Buyer Risk, Revenue Assumptions, CRM Data
- execution coaching plans: Build a 50-account target list, Test ICP assumptions, Create two proof assets, Run a 30-day revenue motion test, Configure CRM for GTM learning

Deferred:

- interactive `Improve this section` actions
- API research
- CRM integration
- Revenue Advisor
- closed-loop learning
- automated outreach or prospect discovery

## Verification notes

There is no formal test suite.

Use:

```text
node --check tool/app.js
node --check tool/intake-schema.js
node --check server/server.js
```

For `tool/results.html`, extract/check the inline script or use the existing render harness artifacts if present.

Recent browser screenshot/PDF capture from Codex was blocked by a Windows sandbox issue:

```text
CreateProcessAsUserW failed: 5
```

So syntax checks, local HTTP checks, and generated export artifacts have been used as fallback verification.

## Git and deployment warnings

As of the recovery on 2026-06-22, Git reports the project files as untracked and `origin/main` as gone from this local checkout. Do not assume normal tracked diffs are available until Git is repaired.

Remote configured in `.git/config`:

```text
https://github.com/sathb01/GTM-Tool.git
```

Render deploys from GitHub `main`, not directly from the OneDrive folder. Local changes are not public until they are committed/pushed or otherwise synced to GitHub.

Public Render URL documented in project context:

```text
https://gtm-tool-1mib.onrender.com
```

## Editing guidance

- Keep changes aligned with the current plain HTML/CSS/JS plus Node server architecture.
- Do not remove migration functions lightly.
- Do not rename field IDs unless you also preserve old saved data through migration.
- Preserve the prompt-only AI research workflow unless instructed otherwise.
- Avoid committing real `server/data/records.json` customer data.
- Keep report copy concise and advisor-like; the product goal is a useful GTM advisory blueprint, not a raw form dump.
