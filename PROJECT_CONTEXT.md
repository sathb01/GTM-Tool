# GTM Intelligence OS Project Context

Last verified: 2026-06-11

## Purpose

This file is the project continuity note for future ChatGPT/Codex sessions. If chat history is missing or incomplete, read this file first before making changes.

Official user-facing product name: `GTM Intelligence OS`.

The repository and local folder retain the historical `GTM-Tool` name to avoid breaking deployment and workspace paths.

## Current Project Location

Primary project folder:

`C:\Users\sathb\OneDrive\Documents\GitHub\GTM-Tool`

Current run folder:

`runs/acme-analytics-2026-05-19/`

## Current Status

The run folder structure has already been created/updated.

`runs/acme-analytics-2026-05-19/` contains:

- `README.md`
- `summary.md`
- `grounded-brand-2026-05-19/`
- `knockaround-2026-05-19/`

Each brand subfolder is expected to contain:

- `README.md`
- `ICP.md`
- `personas.md`
- `messaging.md`
- `offer.md`
- `channels.md`
- `assets.md`
- `experiments.md`

This structure was checked on 2026-06-11 and appeared complete.

## Intake Form Refinement Notes

On 2026-06-11, intake form refinement began based on screenshots showing repeated questions and answers not carrying into related sections.

First-pass changes:

- Added carry-forward logic in `tool/app.js` so core answers can fill related blank fields automatically.
- Carried forward examples include average deal size, CRM, best-fit size, vertical, pain, trigger signal, economic buyer, champion, sales wedge, and bad-fit signals.
- Removed the duplicate `proofAssets` prompt because the proof gap tracker and sales asset checklist already cover that job.
- Reworded some repeated prompts so later sections ask for gaps or observable detail instead of asking the same question again.

Known next refinement area:

- Continue reviewing the intake for redundant sales-channel, ICP, proof, trigger, and pipeline questions before adding the user's remaining fix list.

## Multi-Company Storage Update

On 2026-06-11, the intake tool was updated from a single draft slot to a browser-based multi-company record system.

Added behavior:

- Users can save multiple company / brand records from the intake page.
- Users can switch between saved brands from the `Brand` search box or the `Browse` saved-brand list.
- Switching records auto-saves the current record first when there is data on the form.
- The form autosaves after the user pauses typing or changes a field.
- `New Blank Company` starts a new unsaved form after preserving the current record.
- `Clear Form` clears the active form and removes the active single-draft state without deleting saved company records.
- The results page reads the active saved company record so the matching GTM Readiness Plan can be reopened later.

Storage note:

- This is currently browser-local storage, not a shared server database. Records persist in the same browser/profile on the same machine.

Backend update:

- A Node backend was added in `server/server.js`.
- `npm start` serves the tool and API at `http://localhost:8787`.
- Saved brand records can now sync to server-side JSON storage when the tool is served over HTTP.
- API endpoints include `GET /api/records`, `POST /api/records`, `PUT /api/records/:id`, and placeholder `POST /api/research`.
- Server-side records are stored in `server/data/records.json`, which is ignored by Git.
- `/api/research` has now been implemented to call OpenAI when `OPENAI_API_KEY` is configured.
- The AI Research endpoint sends company name, website, current form fields, and intake schema context to OpenAI, then returns `fields` and `researchNotes`.
- Simple password authentication has been added. Set `TOOL_PASSWORD` in Render before sharing real company data.
- Optional `AUTH_SECRET` can be set in Render for signed sessions.
- Next deployment step: push `server/server.js`, `tool/app.js`, `BACKEND.md`, `CHANGE_LOG.md`, and `PROJECT_CONTEXT.md` to GitHub, then add `TOOL_PASSWORD`, `OPENAI_API_KEY`, and optional `AUTH_SECRET` in Render environment settings and redeploy.

## Section 1 Fixes Started

On 2026-06-11, Section 1 fixes began.

Completed:

- Renamed the research button to `AI Research`.
- Improved the AI Research fallback message and research prompt in `tool/app.js`.
- Changed `Primary geography / markets served` from free text to a dropdown with regional and country-level options.
- Removed `Confidentiality level` from Section 1.
- Changed `Main growth constraint today` to a dropdown of common growth constraints, grouped by category in the option text.
- Added `Other / additional growth constraints` as a repeatable add-another field.
- Changed `Current annual revenue` to a dropdown.
- Added `Monthly recurring revenue (MRR)` and `Annual recurring revenue (ARR)`.
- Added dollar-prefix and automatic numeric formatting for money fields such as MRR, ARR, average deal size, opportunity value, and pipeline average deal size.
- Added conditional `Other` text boxes for dropdowns that include an `Other` option, including GTM systems/data-source tool selections.

Important AI Research note:

- The current static HTML tool can call `window.GTM_RESEARCH_ENDPOINT` if a backend endpoint is configured.
- A true ChatGPT-powered research button needs a small backend service so the OpenAI API key is not exposed in the browser.
- When the AI Research backend is added, the `Website URLs, social media, and public presence` table should be one of the first sections it prefills.

## Executive Snapshot Redesign

On 2026-06-11, the former `Fast-Start Executive Snapshot` section was redesigned.

Completed:

- Renamed it to `Executive Snapshot` with the description `Should be completed by company or department head.`
- Removed the redundant `Where is the company getting the most traction today?` field.
- Replaced top/second/third sales source dropdowns with a ranked revenue-source table.
- Added `Other sales sources` as an add-another list.
- Replaced `Problems customers are willing to pay to solve` with a benefits table including benefit dropdowns and measurement fields.
- Removed `Sales or marketing activities producing the best conversations`.
- Replaced the single 90-day success metric with 30/60/90 day revenue and/or pipeline success criteria.
- Replaced `Biggest internal constraint` with a ranked top-constraints table and related follow-up prompts.
- Replaced the senior-time question with separate add-another trigger lists for prospects that need senior involvement and prospects that can be handled without it.
- Improved the avoid-for-now question wording and added a hint.
- Moved `Build the single best customer profile` into a new `Quick Response Ideal Customer Profile` section.

## Revenue Goals And Traction Updates

On 2026-06-11, the Revenue Goals and Current Traction sections were updated.

Revenue Goals completed:

- Changed `Which matters most right now?` to `What is the single most important need for the company right now?` and moved it to the top of the section.
- Added a 60-day primary GTM goal.
- Removed executive/founder involvement per opportunity.
- Removed maximum implementation complexity.
- Replaced separate constraint dropdowns with a constraint-level table that includes `Low / Mid / High` and a `Why?` field for each constraint category.

Current Traction completed:

- Changed current customers into a top-five customer fit table with `Customer or active user` and `Why each was a good fit`.
- Removed best-fit wins.
- Changed usage/value proof wording to `What value do you provide to your customer(s)?`
- Replaced increase/lower perceived value checkboxes with a performance ranking table.
- Changed opportunity inventory into `List 5-10 important revenue opportunities from your current pipeline`.
- Updated opportunity columns to opportunity type, use case/pain, source/lead type, status, value, next action, and owner.
- Removed the last 10-20 serious sales conversations table.

## ICP And Persona Updates

On 2026-06-11, the ICP and Buyer Personas sections were updated.

ICP completed:

- Changed best-fit size/scale from a textarea to a structured table with revenue, headcount, and other scale marker.
- Changed prospect stage into a ranked top-three table.
- Added a buyer role map with common buyer-role dropdowns and role-played dropdowns.
- Added explanatory helper text to initial use-case wedge.
- Changed trigger events to ranked `Prospect Buy Triggers`.
- Added example-style placeholders for bad-fit, must-have, nice-to-have, and caution signals.
- Changed disqualification rule wording to `Do you have any clear Disqualification rules? If so, list them.`
- Removed strategic exception.
- Removed prospect segment scoring matrix.

Buyer Personas and proof completed:

- Changed persona value-driver fields into dropdowns that use selected values from Current Traction when available.
- Added `Existing and missing proof assets` table.
- Proof criteria dropdowns use selected Current Traction value proof items when available.
- If a proof criterion is listed without `Asset exists?` checked, saving the form auto-adds it to the proof gap tracker unless it is already listed.

## Important Continuity Note

The latest visible chat history may be incomplete because the conversation was resumed from a compacted or partial thread. The project files on disk should be treated as the source of truth.

Future sessions should not recreate the folder structure unless files are actually missing. Continue by reviewing, filling, editing, or validating the existing files.

## 2026-06-12 Evening Status

The public Render service is:

```text
https://gtm-tool-1mib.onrender.com
```

Render deploys from GitHub `main`, not directly from the local OneDrive project folder.

Tonight's important fix:

- GitHub `server/server.js` was still the older backend file, so Render rebuilt successfully but did not show the login screen.
- The auth-enabled and AI-enabled backend was pushed to GitHub in commit:

```text
5f7bc8f - Add auth and AI research backend
```

Render environment variables discussed and corrected:

- `AUTH_SECRET`
- `TOOL_PASSWORD`
- `OPENAI_API_KEY`

The duplicate `OPENAI_API_KEY` error in Render meant two rows had the same key. The duplicate row should be deleted, keeping the original `OPENAI_API_KEY` row.

Next session should start by checking:

1. Did Render finish `Save, rebuild and deploy`?
2. Does `https://gtm-tool-1mib.onrender.com/login` show the login page?
3. Can the user log in with the `TOOL_PASSWORD` value?
4. The former `AI Research` button has since been paused; see the 2026-06-15 note below.

Deferred but important:

- Fix local Git permissions/workflow so changes can be committed and pushed normally from `C:\Users\sathb\OneDrive\Documents\GitHub\GTM-Tool`.

## 2026-06-15 AI Research Paused

API-backed AI Research was tabled because broad OpenAI API research calls may be too expensive.

Current behavior:

- The top button now says `Copy Research Prompt`.
- The browser no longer calls `/api/research`.
- The button generates a ChatGPT prompt, copies it when clipboard access is available, and also appends it to `Research notes / ChatGPT paste-back`.
- The prompt asks ChatGPT to return paste-friendly sections:
  - `PUBLIC PRESENCE TABLE`
  - `INTAKE FIELD SUGGESTIONS`
  - `RESEARCH NOTES`
- `tool/ai-research.js` is intentionally disabled as a no-op note so old API override behavior does not run.

Deferred idea:

- Later, consider narrow opt-in API research with section-level selection, strict token caps, caching by company/domain, and an explicit cost warning before each run.

## 2026-06-15 Target Prioritization Added

Added a simple target-prioritization matrix under `Quick Response Ideal Customer Profile`.

Current behavior:

- Users can score 3+ possible customer segments.
- Criteria are urgency, ability to pay, ease of access, proof/customer evidence, implementation fit, strategic value, sales-cycle fit, and revenue potential.
- Each criterion uses a 1-5 dropdown and the table shows a total out of 40.
- The results page now includes `Target Prioritization`.
- Results identify the top priority segment and one or two `Do not chase yet` segments based on the lowest totals.

## 2026-06-15 Competitive Landscape Added

Added competitive landscape capture, later folded into the `Offer Readiness: Problem, Value, Price, and Proof` section flow.

Current behavior:

- `Alternatives & Competition` appears inside Offer Readiness.
- The block includes a repeatable competitor table, seeded with 3 rows and allowing more.
- Each competitor row captures perceived differentiators, why customers choose the company, why customers choose that competitor, and the most common objection against switching.
- `Alternatives prospects use today` lives in `Alternatives & Competition`.
- `Common objections` and the objection-handling table live in the `Objections` block.
- The field IDs for `alternatives` and `objections` were preserved so existing saved data should carry forward.
- The ChatGPT research prompt now asks for named competitors, differentiators, reasons buyers choose each side, and switching objections.

## 2026-06-15 Offer Readiness Redesign

The former `Problem, Offer, Packaging, Pricing, and Proof` section was redesigned based on the attached PDF guidance.

Current behavior:

- Section renamed to `Offer Readiness: Problem, Value, Price, and Proof`.
- Removed broad standalone boxes for pain/urgency, economic value, before/after, pricing, and pilot/proof of concept.
- Added structured fields for buyer problem, trigger event, current workaround, cost of inaction, urgency, offer promise, differentiator, first use case, next-step CTA, pricing model, deal size, buyer approval level, discounting, and pilot plan.
- Added structured tables for:
  - measurable value claims
  - before/after transformation
  - offer packaging
  - buyer objections and risk reduction
  - proof readiness
- Results page now includes an `Offer Readiness Summary` card that pulls target buyer, urgent problem, offer promise, first offer, recommended next step, pricing confidence, strongest proof, biggest proof gap, and likely objection.
- ChatGPT research prompt was updated to ask for the new offer-readiness inputs in paste-friendly table format.
- The intake renderer now supports ordered `content` blocks inside a section so fields and tables can be interleaved.
- Current Offer Readiness flow is: Buyer Problem & Urgency, Measurable Value, Before / After, Offer Promise, First Use Case / Buying Path, Packaging & Pricing, Pilot Plan, Alternatives & Competition, Objections, Proof Readiness, Sales Assets.
- The value-claim table uses `Metric affected` as the required measurement column.
- The objection-handling table uses the shared proof-type dropdown for `Proof / asset needed`.
- Offer Readiness now ends with a live `Offer Readiness Summary` card inside the intake section. It updates from form data and summarizes target buyer, urgent problem, generated/entered offer promise, first offer, recommended next step, pricing confidence, strongest proof, biggest proof gap, and most likely objection.

## 2026-06-15 Company Information Taxonomy

The `Company Information and GTM Footprint` section now uses more structured business classification.

Current behavior:

- `Prepared by / respondent` is now `Your Name`.
- `Review period covered` is now `Report Time Period`.
- Report period options are last 90 days, last 6 months, last 12 months, current quarter, current fiscal year, current calendar year, and custom date range.
- Choosing `Custom Date Range` reveals start and finish date fields with `DD/MM/YYYY` placeholders.
- The former primary offering text area was split into:
  - primary product/offer name
  - primary product page URL
  - secondary product/offer name
  - secondary product page URL
- Industry and business model are required grouped dropdowns powered by `tool/gtm-taxonomy.js`.
- The stored form data keeps stable IDs (`industryId`, `businessTypeId`) plus friendly labels/groups for display.
- Selecting `Other / Not sure` reveals an optional text field for industry or business-model detail.
- `deriveGtmArchetype` maps the selected industry/business type to a first-pass GTM archetype and `scoreModel`.
- Results display friendly Industry, Business model, and GTM archetype labels and hide internal classification IDs from the summary.
- The recurring-revenue checkbox appears directly after `Current annual revenue`.
- MRR and ARR fields are conditional and only show when recurring revenue applies.

## 2026-06-15 Local Launcher

Added `Open GTM Tool.vbs` as the preferred local launcher. It checks whether `http://127.0.0.1:8787/` is already running, starts the bundled Node server hidden if needed, waits briefly, and opens the local app URL. `Stop GTM Tool.bat` stops the hidden server process for port `8787`.

## 2026-06-15 Value Claim Cards

The `Value and measurable outcomes` block inside Offer Readiness now uses repeatable cards instead of a wide table.

Current behavior:

- One `Value Claim` card appears by default.
- Users can add up to 5 value claims with `Add another value claim`.
- Cards after the first include a remove button.
- Each card captures buyer outcome, buyer language, metric, baseline/current state, expected improvement, timeframe, proof strength, evidence, before state, and after state.
- A generated value claim updates live and is saved in `valueClaims__value-claim-N__generatedSummary`.
- The former separate visible Before / After intake block was removed to avoid duplicate data entry.
- Results include a dedicated `Measurable Value Claims` section and hide raw value-claim fields from the general Intake Summary.

## 2026-06-16 Executive Quick Review

The old `Executive Snapshot` section has been refactored into `Executive Quick Review`.

Current behavior:

- A `Quick Review | Detailed Review` toggle appears near the top of the intake.
- Quick Review is the default mode unless a saved record or local setting says otherwise.
- Quick Review shows only Company Basics, Executive Quick Review, and the action bar.
- Detailed Review shows the full workbook.
- Executive Quick Review has four cards:
  - Market and Customer
  - Offer, Value, and Proof
  - Revenue Motion
  - Execution Readiness
- The 12 GTM readiness score fields live only in Executive Quick Review.
- The app blocks results generation until all 12 readiness ratings are complete.
- Detailed content from the old Executive Snapshot was preserved and moved:
  - `channelPerformance` in Lead Sources, Pipeline, and Sales Motion
  - `proofCustomers` in Current Traction and Customer Proof
  - `successPlan` and `gtmConstraintTracker` in Revenue Goals, Strategy, and Constraints
  - `lowYieldActivity` in Revenue Goals, Strategy, and Constraints
  - `seniorTimeTriggers` and `delegateProspectTriggers` in Lead Sources, Pipeline, and Sales Motion
  - `avoidSegments` in Quick Response Ideal Customer Profile
- Results now include Quick score confidence, Executive Quick Summary, Top Recommended Actions, and Detail Needed to Improve Confidence.

## 2026-06-16 Best-Fit Customer Focus

The former `Quick Response Ideal Customer Profile` section now appears as `Best-Fit Customer Focus`.

Current behavior:

- The section stays under the existing `quickIcp` id for compatibility.
- It starts with non-input education cards explaining customer segments and ICP.
- Users brainstorm 1-3 possible customer groups in repeatable cards.
- Each customer group has a 15-point fit score based on urgency, ability to pay, ease of access, proof/evidence, and implementation fit.
- The app shows a live segment score and recommendation for each card.
- The best-fit profile fields replace the old large ICP table in the default view.
- Advanced ICP fields are hidden behind `Show advanced ICP details`.
- `avoidSegments` remains the same field id but now appears at the bottom as `Who should we avoid for now?`.
- Legacy `bestCustomerProfile` and `targetPrioritization` data is migrated into the new fields where possible.
- Results now include a `Best-Fit Customer Focus` section with the selected ICP, customer-group scores, avoid-for-now guidance, and detail gaps.

## 2026-06-16 Revenue Planning Cards

The lower part of `Revenue Goals, Strategy, and Constraints` has been refactored from abstract tables into guided planning cards.

Current behavior:

- `constraintLevels` remains the same table id but is titled `Constraint Scan`.
- The old visible `30/60/90 Success Plan` table has been replaced by `successLooksLike` cards.
- `successLooksLike` uses fixed rows: `30-days`, `60-days`, and `90-days`.
- Each success card auto-fills its `primaryFocus` from `goal30`, `goal60`, or `goal90` when blank.
- The old visible `GTM Constraint Tracker` table has been replaced by repeatable `topBlockers` cards.
- `topBlockers` allows 1-3 blocker cards and generates a blocker summary.
- Legacy `successPlan` and `gtmConstraintTracker` definitions are preserved under `legacyTables` and old saved data is migrated into the new fields.
- Results show dedicated `90-Day Success Plan` and `Top Blockers to Resolve` sections and the generated 90-day plan uses the new success/blocker summaries when available.

## Suggested Prompt For Future Sessions

Paste this into a new ChatGPT/Codex session if needed:

```text
Please read PROJECT_CONTEXT.md in my GTM-Tool project first. The prior chat history may be incomplete. Use the files on disk as the source of truth and continue from the current run folder:

runs/acme-analytics-2026-05-19/
```
