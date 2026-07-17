# GTM Tool Change Log

Last updated: 2026-06-12

This file records the major actions and changes made during the GTM Tool refinement work.

## 2026-07-16 Guided Improvement Round Trip

- Standardized every `Improve This Section` action to open its facilitation flow in the same browser tab.
- Added a persistent improvement bar showing what is being improved, where the user will return, and answered-question progress.
- Replaced the old save/regenerate controls with `Save Changes and Return` and `Return Without Saving`.
- Returns users to the exact originating asset, section, and scroll position.
- Shows a saved-and-updated confirmation and briefly highlights the originating report section after a successful save.
- Added an isolated end-to-end test for both saved and unsaved return paths.

## 2026-07-16 GTM Plan Summary Navigation

- Added the opening GTM plan view as the first item in every Assets navigation list.
- Renamed that opening view from `GTM Action Plan` to `GTM Plan Summary` so its role is clear and its navigation label matches the page.
- Preserved the existing `asset=gtm` route so saved and shared links remain compatible.
- Made all four summary cards recalculate from the latest saved intake and execution state, including evidence support, current weekly priorities, and blocked work.
- Reformatted the Recommended 90-Day Focus statement as four concise action bullets.
- Reformatted Decision Required and Plan Completeness as concise action bullets.

## 2026-07-16 Split Intake Sidebar Navigation

- Separated the sidebar into an upper intake-navigation box and a distinct Assets box below it.
- Made Foundation, Validation when relevant, Strategy, and Execution collapsible groups inside the intake box.
- Automatically opens the group containing the current section while leaving the other groups collapsed.
- Keeps Assets expanded by default, allows the user to collapse it, and remembers that choice in the browser.
- Preserved independent sidebar scrolling on desktop and a single natural flow on mobile.
- Removed `View` from ICP, Persona, and Validation Plan asset link names.

## 2026-07-16 Reviewed AI Intake Assistance

- Replaced the copy-prompt primary action with reviewed public-company research from the company name and preferably the website.
- Added company-identity confirmation, source links, confidence, public-fact versus inferred labels, and conflict warnings.
- Prevented automatic replacement of existing answers and required explicit selection before applying research.
- Restricted research autofill to a server allowlist and excluded private operating facts and readiness judgments.
- Added contextual `Help me answer this` assistance to a focused set of difficult customer, problem, urgency, offer, success, and hypothesis fields.
- Kept AI suggestions advisory and required the user to select `Use this answer` before saving.
- Added alpha usage controls of five research runs per network per day and 30 assistance requests per network per hour.

## 2026-07-16 Active Plan Weekly Rollover

- Replaced the static weekly checklist behavior with a saved close-week and rollover workflow.
- Required a result or evidence note before a priority can be completed.
- Added carry forward, revise, drop, and blocked decisions for unfinished priorities.
- Limited each new week to three priorities, recommending two or fewer rollover items while allowing all three with confirmation that new planned work will be deferred.
- Kept blocked work recorded without consuming next-week capacity unless the user defines an actionable unblock step.
- Built the next week from selected rollover work, one evidence-based change, and the next planned stage.
- Added current-week highlighting and saved weekly history with completion counts, decisions, learning, and next changes.
- Synchronized progress saved in the Action Runner with the current weekly plan.

## 2026-07-16 Embedded AI Help

- Replaced the nonfunctional Find or ask placeholder with a working section finder and contextual AI assistant on intake and report pages.
- Added explicit AI actions for recommending section answers, explaining questions and recommendations, reviewing answer gaps, and identifying the next action.
- Added an authenticated `/api/assistant` server endpoint using the OpenAI Responses API and a broadly available, cost-conscious model default.
- Kept the API key server-side, excluded contact and credential fields from AI context, capped context and output size, and added an hourly request limit.
- Added clear configuration, API-key, access, and billing messages when OpenAI rejects a request.
- AI suggestions never silently write to the intake; users review and choose what to enter.

## 2026-07-16 Active Plan Overview

- Replaced the four separate Active Plan overview fields with one concise bulleted summary covering Current Focus, Evidence That Matters, the end-of-cycle decision, and the review rhythm.

## 2026-07-16 User-Facing Plan Logic and Persistent Storage

- Removed calculated confidence labels, source-trace rules, score weights, uncertainty penalties, and projected score lifts from user-facing plan sections.
- Kept the overall readiness score, plain-language status, strengths, gaps, recommended actions, and user-entered operating evidence.
- Reframed offer, targeting-strategy, and revenue-motion diagnostics as Current Readiness, What Is Ready, What Needs Work, and Next Moves.
- Simplified Strategic Insights to Observation, Why It Matters, and Recommended Action.
- Replaced Assessment Input Confidence with plain-language Plan Completeness guidance.
- Configured the Render Blueprint for a paid Starter web service with a 1 GB persistent disk mounted directly at `server/data`.

## 2026-07-16 Plan Status and Active Plan Simplification

- Moved Plan Status to the first visible report section by removing the user-facing Asset Quality Control panel.
- Kept asset-quality logic available for internal QA without asking users to recheck a technical score.
- Removed the duplicated Current Priority and What the Evidence Changes analysis from Plan Status.
- Removed Plan Resources blocks from Plan Status and Active Plan because the asset sidebar already provides navigation.
- Removed the confusing Saved Execution Evidence Changes block from Active Plan.
- Removed Evidence Reconciliation from normal asset navigation and routed weekly evidence decisions through Weekly GTM Review.
- Changed internal GTM Tool links to remain in the same browser tab so plan work does not create a trail of duplicate windows.

## 2026-07-16 Portfolio Restoration and Asset Remediation

- Corrected the initial row IDs for offer, targeting-strategy, and revenue-motion portfolios so saved portfolio data binds to the visible intake cards.
- Restored the fully populated ForgeLine Revenue Acquisition Strategy Portfolio to its visible intake card.
- Changed the Active Plan executable-action quality gap to open the exact Revenue Motion intake remediation instead of a generic Active Plan view.
- Added explicit completion steps, required fields, an example, and a direct Return to Active Plan link to the remediation workshop.
- Added a targeted regression check covering portfolio restoration, Active Plan quality 4/4, and the remediation return path.

## 2026-07-16 Login and Browser Security

- Updated the password login page to use the GTM OS navy, coral, and gray interaction palette.
- Added consistent keyboard focus styling to the login form.
- Added Content Security Policy, HSTS, clickjacking protection, MIME sniffing protection, referrer restrictions, and browser permissions restrictions to every server response.
- Verified the hardened server against the four-company asset suite: 100/100 renders and 26/26 save/reload checks passed.

## Project Continuity

- Created `PROJECT_CONTEXT.md` so future ChatGPT/Codex sessions can recover project state even if chat history is incomplete.
- Documented that project files on disk are the source of truth.
- Verified the existing run folder structure under `runs/acme-analytics-2026-05-19/`.

## Intake Redundancy Review

- Reviewed screenshots of the intake form for repeated questions and missing answer carry-forward.
- Added answer carry-forward logic in `tool/app.js` so key answers can populate related blank fields.
- Examples of carry-forward include average deal size, CRM, customer size, vertical, pain, buyer roles, sales wedge, and bad-fit signals.
- Removed or reworded several prompts that repeated the same idea across sections.

## Multi-Brand Storage

- Added browser-local multi-brand storage.
- Added a `Brand` search field.
- Added saved-brand browsing.
- Added `Save Company`, `New Blank Company`, and `Clear Form`.
- Added autosave after the user pauses typing or changes a field.
- Updated results page logic so it reads the active saved brand record.
- Later added backend sync hooks so saved brands can sync to a server when served over HTTP.

## Section 1 / Company Information

- Renamed the research button to `AI Research`.
- Added improved AI Research fallback notes when no backend AI endpoint is configured.
- Changed `Primary geography / markets served` from free text to a dropdown with regional and country-level options.
- Removed `Confidentiality level`.
- Changed `Main growth constraint today` to a dropdown with common growth constraints.
- Added repeatable `Other / additional growth constraints`.
- Changed `Current annual revenue` to a dropdown.
- Added `Monthly recurring revenue (MRR)`.
- Added `Annual recurring revenue (ARR)`.
- Added dollar-prefix and auto-format behavior for money fields.
- Added conditional `Other` text boxes for dropdowns with `Other`, including GTM systems/data sources.

## Executive Snapshot

- Renamed `Fast-Start Executive Snapshot` to `Executive Snapshot`.
- Updated description to `Should be completed by company or department head.`
- Removed redundant traction/source questions.
- Replaced top/second/third sales source fields with a ranked revenue-source table.
- Added `Other sales sources`.
- Replaced paid-problem list with `Which benefits do customers pay you for?`
- Added benefit dropdowns and measurement fields.
- Removed `Sales or marketing activities producing the best conversations`.
- Added `Revenue and/or Pipeline Success Criteria` with 30/60/90 day rows and up to three ranked criteria.
- Replaced `Biggest internal constraint` with ranked `Your Top Constraints`.
- Added dynamic follow-up prompts based on the selected constraint.
- Replaced senior-time question with two trigger lists:
  - prospects that need senior involvement
  - prospects that can be handled without senior involvement
- Reworded avoid-for-now customer/segment question and added a helpful hint.

## Quick Response ICP

- Moved `Build the single best customer profile` into its own section:
  `Quick Response Ideal Customer Profile`.
- Kept the rough-answer structure for now, with plans to build a more guided ICP questionnaire later.

## Revenue Goals, Strategy, and Constraints

- Moved and renamed priority question to:
  `What is the single most important need for the company right now?`
- Added a 60-day primary GTM goal.
- Removed executive/founder involvement per opportunity.
- Removed maximum implementation complexity.
- Replaced separate constraint dropdowns with a constraint-level table.
- Each constraint category now has:
  - level
  - why

## Current Traction and Customer Proof

- Changed current customers into a top-five customer fit table.
- Added `Why each was a good fit`.
- Removed best-fit wins.
- Changed `Usage and value proof` wording to:
  `What value do you provide to your customer(s)?`
- Replaced perceived-value up/down checkboxes with a 1-5 performance ranking table.
- Changed opportunity inventory to:
  `List 5-10 important revenue opportunities from your current pipeline`.
- Updated opportunity fields to include:
  - opportunity type
  - use case / pain
  - source / lead type
  - status
  - value / deal size
  - next action
  - owner
- Removed last 10-20 serious sales conversations table.

## ICP Hypothesis and Market Segmentation

- Changed best-fit size/scale into a structured table with:
  - revenue
  - headcount
  - other scale marker
- Changed prospect stage to ranked top three.
- Added buyer role map with dropdowns for common buyer roles and the role each plays.
- Added helper text to initial use-case wedge.
- Changed trigger events to ranked `Prospect Buy Triggers`.
- Added example-style placeholders for:
  - bad-fit signals
  - positive must-have
  - positive nice-to-have
  - negative caution
- Changed disqualification rule wording.
- Removed strategic exception.
- Removed prospect segment scoring matrix.

## Buyer Personas, Buying Committee, and Proof

- Changed persona value-driver fields into dropdowns.
- Dropdowns use selected value-proof options from Current Traction when available.
- Added `Existing and missing proof assets` table.
- Added asset-exists checkbox and asset name field.
- If a proof criterion is not marked as existing, saving the form auto-adds it to the proof gap tracker unless already listed.

## Backend

- Added a Node backend in `server/server.js`.
- Added `package.json` with `npm start`.
- Added `BACKEND.md`.
- Added `.gitignore`.
- Added `server/data/.gitkeep`.
- Backend serves the tool and exposes:
  - `GET /api/records`
  - `POST /api/records`
  - `PUT /api/records/:id`
  - `POST /api/research` placeholder
- Backend stores records in `server/data/records.json`.
- `server/data/*.json` is ignored by Git to avoid committing client data.
- Added `Start GTM Tool.bat` for easier local startup on Windows.
- Implemented server-side `/api/research` endpoint for AI Research.
- `/api/research` calls OpenAI when `OPENAI_API_KEY` is configured.
- AI Research uses the company name, website, current form fields, and intake schema to return structured field suggestions.
- The endpoint returns a clear setup message when `OPENAI_API_KEY` is missing.
- Added simple password authentication controlled by `TOOL_PASSWORD`.
- Protected intake pages and API endpoints when `TOOL_PASSWORD` is set.
- Added signed session cookie support with optional `AUTH_SECRET`.

## Render Deployment

- Added `render.yaml`.
- Updated server to listen on Render-compatible host/port.
- Confirmed local backend smoke test worked.
- Render deployment is not fully live yet because GitHub needs the complete tool files pushed to `main`.
- `render.yaml` and backend core files were added to GitHub through the GitHub connector.
- The full `tool` folder still needs to be committed or uploaded to GitHub for Render to serve the complete public app.

## Current Workflow

Current local tool path:

```text
C:\Users\sathb\OneDrive\Documents\GitHub\GTM-Tool
```

Local app URL while backend is running:

```text
http://localhost:8787
```

Deployment workflow:

```text
local edits -> GitHub push -> Render auto-deploy
```

Important:

- `localhost` only works on the user's computer.
- A public URL requires successful Render deployment.
- AI Research still needs a real backend OpenAI implementation and API key stored server-side.

## 2026-06-12 Evening Render, Auth, And AI Setup

- Confirmed Render service was live at `https://gtm-tool-1mib.onrender.com`.
- Identified why the login screen did not appear after the first rebuild:
  - Render was deploying from GitHub `main`.
  - GitHub still had the older `server/server.js` without auth or the real AI Research endpoint.
- Updated GitHub `server/server.js` directly with the current backend from the local project.
- GitHub commit created for the backend/auth update:
  - `5f7bc8f` - `Add auth and AI research backend`
- Current backend now includes:
  - password login controlled by `TOOL_PASSWORD`
  - signed session cookies controlled by `AUTH_SECRET`
  - protected tool pages and API endpoints
  - saved brand/company records API
  - AI Research endpoint at `POST /api/research`
  - OpenAI API usage through server-side `OPENAI_API_KEY`
- Walked through Render environment variable setup:
  - `AUTH_SECRET`
  - `TOOL_PASSWORD`
  - `OPENAI_API_KEY`
- Resolved the Render duplicate-key issue by deleting the extra `OPENAI_API_KEY` row and keeping the existing key row.
- User planned to click `Save, rebuild and deploy` after environment variables were corrected.

Next checks:

- After Render finishes deploying, open:

```text
https://gtm-tool-1mib.onrender.com/login
```

- Confirm the password login appears.
- Log in with the value stored in `TOOL_PASSWORD`.
- Test the `AI Research` button with a brand/company name or website entered.
- If AI Research errors, first confirm the saved `OPENAI_API_KEY` value is a complete valid key.
- Still need to return to the local Git permissions/workflow issue so future changes can be pushed normally instead of relying on manual GitHub file updates.

## 2026-06-15 AI Research Cost Control

- Paused browser-triggered API-backed AI Research to avoid ongoing OpenAI API usage costs.
- Renamed the intake header button from `AI Research` to `Copy Research Prompt`.
- Replaced the browser research action with a ChatGPT prompt workflow.
- The prompt is copied to the clipboard when possible and also appended to the research notes field.
- The requested ChatGPT output format is paste-friendly:
  - public presence table
  - intake field suggestions
  - research notes, source URLs, and open questions
- Left `tool/ai-research.js` as an intentional no-op so the old API override script does not call `/api/research`.

## 2026-06-15 Target Prioritization

- Added a `Target prioritization matrix` to the Quick Response Ideal Customer Profile section.
- The matrix scores segments on urgency, ability to pay, ease of access, proof/customer evidence, implementation fit, strategic value, sales-cycle fit, and revenue potential.
- The intake table supports 3 starting segments and additional rows.
- The results page now summarizes target priority, highlights the top segment, and flags one or two low-scoring segments as `Do not chase yet`.
- The copied GTM plan now includes the target-prioritization recommendation when segment scores are present.

## 2026-06-15 Competitive Landscape

- Added competitive landscape capture, later folded into the Offer Readiness section flow.
- Added a repeatable named competitor table with columns for perceived differentiators, why customers choose us, why customers choose the competitor, and the most common objection against switching.
- Moved `Alternatives prospects use today` into `Alternatives & Competition`.
- Moved `Common objections` and objection handling into `Objections`.
- Preserved the existing `alternatives` and `objections` field IDs to protect saved records.
- Updated the ChatGPT research prompt to ask for named competitors and switching context.

## 2026-06-15 Offer Readiness Redesign

- Renamed `Problem, Offer, Packaging, Pricing, and Proof` to `Offer Readiness: Problem, Value, Price, and Proof`.
- Replaced loose blank text areas with structured buyer problem, urgency, value, promise, first-use-case, pricing, and pilot-plan prompts.
- Added `Measurable value claims`, `What changes for the buyer?`, `Offer packaging`, `Buyer objections and risk reduction`, and `Proof readiness` tables.
- Consolidated proof capture into one proof-readiness table instead of separate existing/missing proof and proof-gap tables.
- Added an `Offer Readiness Summary` section to the results page.
- Updated the copyable ChatGPT research prompt to request offer-readiness tables and source-backed field suggestions.
- Added ordered section content rendering so the Offer Readiness section can interleave field groups and tables.
- Moved `Offer promise and positioning` after buyer problem, measurable value, and before/after clarification.
- Reordered Offer Readiness to: Buyer Problem & Urgency, Measurable Value, Before / After, Offer Promise, First Use Case / Buying Path, Packaging & Pricing, Pilot Plan, Alternatives & Competition, Objections, Proof Readiness, Sales Assets.
- Updated the value-claim table to use `Metric affected` as the required measurement column.
- Updated the offer-promise block title and category options to match the requested positioning flow.
- Renamed the packaging/pricing block and tightened pricing model and approval-level dropdowns to the requested option sets.
- Renamed the pilot block to `Pilot plan, if needed` and kept `Pilot price` flexible so it can accept a price, `Free`, `Paid`, or a range.
- Renamed the alternatives block to `Alternatives and competition`; retained the alternatives checkbox list and alternative-comparison strategy table.
- Renamed the objections block to `Objections and risk reduction`; retained the objections checkbox list and objection-handling table.
- Changed `Proof / asset needed` in the objection-handling table from free text to the shared proof-type dropdown.
- Restored the final Offer Readiness section headings and order to the recommended final layout.
- Added a live `Offer Readiness Summary` card at the bottom of the intake section.
- The summary card updates on input/change and pulls target buyer, urgent problem, offer promise, first offer, next step, pricing confidence, strongest proof, proof gap, and likely objection.

## 2026-06-15 Company Information Taxonomy

- Renamed `Prepared by / respondent` to `Your Name`.
- Renamed `Review period covered` to `Report Time Period` and expanded the dropdown to last 90 days, last 6 months, last 12 months, current quarter, current fiscal year, current calendar year, and custom date range.
- Added conditional custom start and finish date fields using `DD/MM/YYYY` placeholders.
- Split the former primary offering text area into primary and secondary product/offer name plus product-page URL fields.
- Added reusable industry and business-type taxonomy data in `tool/gtm-taxonomy.js`.
- Replaced free-text industry/business classification with required grouped dropdowns that store stable IDs and save display labels.
- Added optional `Other / Not sure` detail fields for industry and business model.
- Added derived GTM archetype metadata and score-model mapping for future scoring logic.
- Updated the results page to show friendly Industry, Business model, and GTM archetype labels instead of raw IDs.
- Moved the recurring-revenue checkbox directly after `Current annual revenue`.
- MRR and ARR now only appear when `Recurring revenue applies to this business` is checked.

## 2026-06-15 Local Launcher

- Added `Open GTM Tool.vbs` to start the local GTM Tool server in the background without leaving a PowerShell or command window open.
- Added `Stop GTM Tool.bat` to stop the hidden local server listening on port `8787`.

## 2026-06-15 Value Claim Cards

- Replaced the horizontal `Value claim` table in Offer Readiness with repeatable vertical value-claim cards.
- Each card captures buyer outcome, buyer language, measurement, current state, improvement, timeframe, proof strength, evidence, before state, and after state.
- The first value claim card appears by default, with an `Add another value claim` button up to 5 cards.
- Cards after the first can be removed.
- Added live generated value-claim summaries and save them in hidden `generatedSummary` fields.
- Removed the separate visible `Before / After` intake block because before/after now lives inside each value claim card.
- Added a `Measurable Value Claims` section to the results page.

## 2026-06-16 Executive Quick Review

- Replaced the old `Executive Snapshot` section with `Executive Quick Review`.
- Added a `Quick Review | Detailed Review` toggle near the top of the intake.
- Quick Review is the default mode for new sessions and shows only Company Basics, Executive Quick Review, and the action bar.
- Detailed Review shows the full workbook while keeping the 12 score fields only in Executive Quick Review.
- Executive Quick Review renders four cards: Market and Customer; Offer, Value, and Proof; Revenue Motion; Execution Readiness.
- Moved all 12 GTM readiness score fields out of Pipeline and into Executive Quick Review, with no duplicate score controls.

## 2026-06-16 Best-Fit Customer Focus

- Refactored `Quick Response Ideal Customer Profile` into the visible `Best-Fit Customer Focus` section.
- Added plain-English education cards for customer segments and ICP.
- Replaced the old default ICP table and wide target matrix with 1-3 possible customer group cards.
- Added 15-point segment fit scoring, live recommendations, and a suggested best-fit customer group.
- Added a best-fit profile card, collapsed advanced ICP details, and moved avoid-for-now guidance to the bottom.
- Preserved old saved ICP and prioritization data through migration/fallback logic.
- Updated downstream carry-forward logic and results output for the new best-fit customer fields.

## 2026-06-16 Revenue Planning Cards

- Clarified the lower part of `Revenue Goals, Strategy, and Constraints`.
- Renamed the constraint-level table to `Constraint Scan` with clearer helper text and Medium/High wording.
- Replaced the visible `30/60/90 Success Plan` table with `What Success Looks Like` cards for 30, 60, and 90 days.
- Replaced the visible `GTM Constraint Tracker` table with repeatable `Top Blockers to Resolve` cards.
- Added generated success statements and blocker summaries.
- Preserved legacy `successPlan` and `gtmConstraintTracker` data through migration into the new card fields.
- Updated results to show `90-Day Success Plan`, `Top Blockers to Resolve`, and use the new cards in the generated 90-day plan.
- Added validation so the user must complete all 12 readiness ratings before generating results.
- Moved old Snapshot detail into Detailed Review sections instead of deleting it:
  - channel ranking and channel detail into `Channel Performance`
  - proof/referral candidates into Current Traction and Customer Proof
  - success criteria into `30/60/90 Success Plan`
  - constraints into `GTM Constraint Tracker`
  - low-yield activities into Revenue Goals, Strategy, and Constraints
  - senior/delegate triggers into Lead Sources, Pipeline, and Sales Motion
  - avoid segments into Quick Response Ideal Customer Profile
- Results now use four scorecard categories, show Quick score confidence, show an Executive Quick Summary, list Top Recommended Actions, and suggest Detail Needed to Improve Confidence.
