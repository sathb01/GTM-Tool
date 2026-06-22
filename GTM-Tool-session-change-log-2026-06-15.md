# GTM Tool Session Change Log

Work session: June 15, 2026  
Project: `C:\Users\sathb\OneDrive\Documents\GitHub\GTM-Tool`

## Summary

This session focused on reducing AI research API cost, improving the intake structure, adding stronger target and offer-readiness logic, and making the local GTM Tool easier to launch.

## AI Research Cost Control

- Paused browser-triggered API-backed AI research to avoid ongoing OpenAI API usage costs.
- Replaced the `AI Research` browser action with `Copy Research Prompt`.
- The prompt is copied when possible and appended to `Research notes / ChatGPT paste-back`.
- `tool/ai-research.js` now acts as a no-op so the browser does not call `/api/research`.
- The research prompt asks ChatGPT for paste-friendly public presence, intake suggestions, offer-readiness tables, competitor context, objections, proof gaps, and source URLs.

## Brand Bar / Local Form Controls

- Changed the Brand search field placeholder to `Search`.
- Changed `New Blank Company` to `New`.
- Changed `Save Company` to `Save`.
- Aligned the `Browse` button height with the search input.
- Added a warning before clearing the form:
  `Clear form may result in loss of data.. Do you wish to proceed?`

## Local Launcher

- Added `Open GTM Tool.vbs` to start the local server hidden without leaving PowerShell visible.
- Added `Stop GTM Tool.bat` to stop the hidden server on port `8787`.
- Confirmed the app is served locally at `http://127.0.0.1:8787/`.
- Added cache-busting script versions during development so the browser is less likely to hold stale form code.

## Company Information

- Renamed `Prepared by / respondent` to `Your Name`.
- Renamed `Review period covered` to `Report Time Period`.
- Expanded report period options:
  - Last 90 days
  - Last 6 months
  - Last 12 months
  - Current quarter
  - Current fiscal year
  - Current Calendar Year
  - Custom Date Range
- Added conditional custom start and finish date fields with `DD/MM/YYYY` placeholders.
- Split the former primary offering text area into:
  - Primary Product Line / Offer
  - Primary product page URL
  - Secondary Product Line / Offer
  - Secondary product page URL
- Added `tool/gtm-taxonomy.js` with reusable Industry and Business Type taxonomies.
- Replaced free-text industry/business classification with required grouped dropdowns that store stable IDs.
- Added optional `Other / Not sure` detail fields.
- Added derived GTM archetype metadata and score-model mapping.
- Updated results to show friendly Industry, Business model, and GTM archetype labels instead of raw IDs.

## Target Prioritization

- Added a `Target prioritization matrix` under Quick Response Ideal Customer Profile.
- Users can score 3 or more possible customer segments.
- Scoring criteria:
  - Urgency
  - Ability to pay
  - Ease of access
  - Proof/customer evidence
  - Implementation fit
  - Strategic value
  - Sales-cycle fit
  - Revenue potential
- Results now identify the top priority segment.
- Results flag one or two lower-scoring segments as `Do not chase yet`.

## Offer Readiness

- Renamed the section to `Offer Readiness: Problem, Value, Price, and Proof`.
- Added ordered content rendering so the section can flow logically instead of showing a flat grid of blank boxes.
- Final section flow:
  - Buyer Problem & Urgency
  - Measurable Value
  - Before / After
  - Offer Promise
  - First Use Case / Buying Path
  - Packaging & Pricing
  - Pilot Plan
  - Alternatives & Competition
  - Objections
  - Proof Readiness
  - Sales Assets

## Measurable Value / Value Claims

- Replaced the wide horizontal value-claim table with repeatable vertical `Value Claim` cards.
- One card appears by default.
- Users can add up to 5 value claims.
- Cards after the first can be removed.
- Each card captures buyer outcome, buyer language, metric, baseline/current state, expected improvement, timeframe, proof strength, evidence, before state, and after state.
- Each card generates a live value-claim summary and saves it in a hidden `generatedSummary` field.
- Results now include a dedicated `Measurable Value Claims` section.

## Before / After

- Restored a standalone `Before / After` block in the final recommended Offer Readiness flow.
- The block captures:
  - Process
  - Cost / effort
  - Revenue / growth
  - Risk
  - Visibility / control
  - Customer experience

## Offer Promise

- Confirmed `Offer Promise` comes after problem, value, and before/after clarification.
- Uses:
  - `One-sentence offer promise`
  - `Differentiator`
  - `Category / offer type`
  - `Main proof point`
- Category options:
  - Software
  - Service
  - Platform
  - Marketplace
  - Consulting
  - Managed service
  - Product
  - Hybrid

## Packaging & Pricing

- Structured the packaging and pricing block around:
  - Pricing model
  - Public pricing
  - Minimum viable deal size
  - Average expected deal size
  - Buyer approval level
  - Discounting rule
- Added/retained the `Offer packaging` table for:
  - Entry offer
  - Core offer
  - Expansion offer
- Pricing model options:
  - Subscription
  - Project fee
  - Usage-based
  - Seat-based
  - Transaction fee
  - Retainer
  - Percentage of savings/revenue
  - Custom
  - Hybrid
- Buyer approval options:
  - User
  - Manager
  - Department head
  - Executive
  - Procurement
  - Board / owner

## Pilot Plan

- Updated the block to `Pilot Plan`.
- Helper text:
  `Only use a pilot if it reduces buyer risk and leads to a clear paid next step.`
- Fields:
  - Is a pilot needed?
  - Pilot length
  - Pilot price
  - Pilot success metric
  - Buyer requirements
  - Conversion path
  - Pilot risk
- Pilot price remains flexible so it can accept `Free`, `Paid`, a price, or a range.

## Alternatives & Competition

- Kept the `Alternatives prospects use today` checkbox list:
  - Manual work
  - Spreadsheets
  - Internal team
  - Incumbent vendor
  - Point solution
  - Agency
  - Consultant
  - Generic tool
  - Doing nothing
  - Other
- Added/retained `Alternative comparison` table:
  - Alternative / competitor
  - Why buyers use it
  - Where it is weak
  - Our advantage
  - Proof needed
- Added/retained named competitor table:
  - Perceived differentiators
  - Why customers choose you
  - Why customers choose the competitor
  - Most common objection against switching

## Objections

- Kept `Common objections` checkbox list:
  - Price
  - Timing
  - Trust
  - ROI
  - Risk
  - Data
  - Implementation
  - Internal ownership
  - Competing priorities
  - Switching cost
  - Adoption
- Added/retained `Objection handling` table:
  - Objection
  - Why buyer believes this
  - Best response
  - Proof / asset needed
  - Deal stage where it appears
- Changed `Proof / asset needed` from text to the shared proof-type dropdown.

## Proof Readiness

- Consolidated proof capture into one `Proof readiness` table.
- Proof type options:
  - Customer quote
  - Case study
  - Before/after metric
  - ROI calculator
  - Demo
  - Reference customer
  - Review/testimonial
  - Usage data
  - Benchmark
  - Security/privacy documentation
  - Implementation plan
  - Pilot result
  - Other

## Results Page

- Added Target Prioritization summary.
- Added Offer Readiness Summary.
- Added Measurable Value Claims section.
- Updated the copyable GTM plan output to include target prioritization and the new offer-readiness structure.
- Results hide internal classification IDs and show friendly labels for business classification.

## Files Touched

- `tool/intake-schema.js`
- `tool/app.js`
- `tool/index.html`
- `tool/results.html`
- `tool/ai-research.js`
- `tool/gtm-taxonomy.js`
- `server/server.js`
- `Open GTM Tool.vbs`
- `Stop GTM Tool.bat`
- `CHANGE_LOG.md`
- `PROJECT_CONTEXT.md`

## Verification Performed

- JavaScript syntax checks passed for:
  - `tool/app.js`
  - `tool/intake-schema.js`
  - `tool/gtm-taxonomy.js`
  - `server/server.js`
- Results page inline script parsing passed.
- Local server served updated schema and cache-busted script URLs.
- Local app reachable at `http://127.0.0.1:8787/`.

## Render / Deployment Note

These changes are local until they are committed/pushed or otherwise synced to GitHub. Render will continue deploying from GitHub `main`, so the public Render app will not include these changes until GitHub receives the updated files.
