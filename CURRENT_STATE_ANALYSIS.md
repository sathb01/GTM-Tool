# GTM Intelligence OS Current State Analysis

Last updated: 2026-06-18

## Product Overview

GTM Intelligence OS is a browser-based GTM readiness intake, planning, and execution application. It helps a company capture baseline company information, prioritize the best-fit customer focus, clarify the offer, define buyer personas, identify buying triggers, inspect proof and traction, map revenue motions, and generate an actionable GTM plan.

The product currently supports two report paths:

- Quick GTM Readiness Report: uses Company Information and GTM Information to produce a directional readiness report.
- Detailed Readiness Report: reveals the full intake workbook and uses the richer sections to improve score confidence and produce a more useful plan.

The app is intentionally structured as a guided intake rather than a free-form worksheet. Many sections now use cards, repeatable rows, dropdowns, generated summaries, and live snapshot cards to make the user produce more specific GTM inputs.

## UX Flow

The intake starts with:

1. Company Information
2. GTM Information
3. Report buttons

By default, detailed sections are hidden. The user can either generate a quick report or click Continue to Detailed Readiness Report. Once detailed mode is opened, the rest of the sections appear below the first two sections.

The detailed flow is:

1. Best-Fit Customer Focus
2. Revenue Goals, Strategy, and Constraints
3. Customer Evidence and Traction
4. ICP Hypothesis and Market Segmentation
5. Buyer Personas and Buying Committee
6. Offer Readiness: Problem, Value, Price, and Proof
7. Buying Triggers and Targeting Signals
8. Revenue Motion, Channels, and Pipeline

The intake page supports saved company records through the Brand controls. Users can search saved brands, browse saved brands, create a new brand, save, and clear the form. Clearing the form asks for confirmation because it may cause data loss.

## Assessment Structure

### Company Information

Captures baseline company profile, respondent, report period, product or offer URLs, industry, business model, geography, company size, revenue, recurring revenue applicability, MRR, ARR, customer count, average deal size, primary sales motion, growth constraints, public presence URLs, GTM systems, and research notes.

Industry and business model are stored as stable taxonomy IDs with display labels and a derived GTM archetype.

### GTM Information

This is the simplified base intake formerly called Executive Quick Review. It contains the 12 readiness score fields and quick supporting prompts around best-fit customer, buyer problem, urgency, offer promise, measurable outcome, revenue source, sales motion, 90-day goal, constraint, who to avoid, and weekly revenue execution time.

The 12 score fields are the source for the overall readiness score:

- marketUrgency
- icpClarity
- positioningClarity
- offerClarity
- pricingConfidence
- channelFocus
- salesMotion
- contentAssets
- funnelTracking
- experimentReadiness
- budget
- teamCapacity

### Best-Fit Customer Focus

Captures 1-3 possible customer groups and helps identify the best-fit customer group to focus on first. It includes plain-language guidance for customer segments and ICP, possible customer group cards, segment fit scoring, suggested best-fit logic, best-fit customer profile fields, ICP fit rules, buying signals, avoid-for-now segments, and advanced ICP details.

The current simplified customer group scoring uses five core signals:

- urgency
- ability to pay
- ease of access
- proof/customer evidence
- implementation fit

Additional strategy fields capture strategic value, sales-cycle fit, and revenue potential.

### Revenue Goals, Strategy, and Constraints

Captures the current business priority, 30/60/90-day GTM goals, ideal client attribute, supported sales cycle, capacity notes, low-yield activities, constraint scan, 30/60/90 success cards, and top blockers to resolve.

The blocker section now applies to 30-day, 60-day, and 90-day success focus rather than only 90-day goals.

### Customer Evidence and Traction

Captures proven customer outcomes, proof/reference candidates, customer evidence inventory, expansion opportunities, delivery fit risks, and customer success signal rankings. This section feeds ICP caution rules, proof recommendations, and report output.

### ICP Hypothesis and Market Segmentation

This is a more detailed ICP section retained for detailed review. It captures vertical fit, use-case wedge, budget category, bad-fit signals, positive/negative fit criteria, disqualification rules, size fit, stage fit, buyer role map, and trigger events.

Some older ICP fields are preserved for saved-record compatibility and migrated into the newer Best-Fit Customer Focus fields.

### Buyer Personas and Buying Committee

Captures how buying decisions happen, who starts the conversation, who owns budget, who feels pain, who can block the deal, the number of people involved, review requirements, role cards for the buying committee, persona priority, and buying committee risks.

The role-card model covers:

- Economic Buyer
- Executive Sponsor
- Champion
- Day-to-Day User
- Implementation Owner
- Technical / Security Reviewer
- Procurement / Finance
- Likely Blocker

### Offer Readiness: Problem, Value, Price, and Proof

This section now works as an offer portfolio and per-offer readiness assessment. The user first lists offers, packages, pilots, products, or services, then chooses the primary GTM offer. Offers marked Full readiness analysis open detailed assessment panels.

Each full offer assessment includes:

- Buyer Problem and Urgency
- Measurable Value
- Buyer Transformation Summary
- Offer Promise
- First Use Case and Buying Path
- Packaging and Pricing
- Pilot Plan, if needed
- Alternatives, Objections, Proof, and Assets
- Offer Readiness Snapshot

The section has a live Offer Readiness Snapshot card that summarizes the active offer's target buyer, readiness score, stage, confidence, strongest areas, gaps, and next moves.

### Buying Triggers and Targeting Signals

This section now works as shared signal infrastructure plus a signal play portfolio. A signal play connects customer group, offer/use case, buyer persona, and GTM motion. Plays marked Full signal analysis open detailed scored panels.

The section captures:

- signal data sources
- signal monitoring owner
- monitoring cadence
- routing owner
- data source readiness
- global negative signals
- signal play portfolio
- primary signal play
- buying trigger events
- fit signals
- negative signal rules
- signal scoring and routing
- signal-based action plan

### Revenue Motion, Channels, and Pipeline

This section now works as shared revenue infrastructure plus a revenue motion play portfolio. A revenue motion connects customer group, offer, channel/source, sales motion, primary buyer, signal play, and goal. Motions marked Full motion analysis open detailed scored panels.

The section captures:

- CRM or revenue tracking system
- pipeline reporting cadence
- primary revenue owner
- pipeline review owner
- selling capacity
- revenue data quality
- overall pipeline snapshot
- revenue motion portfolio
- primary revenue motion
- channel performance
- pipeline metrics
- sales motion and conversion map
- deal routing and involvement rules
- stalled deals and lost momentum
- next experiment

## Output Generation

The results page reads the active saved intake data from browser storage, normalizes legacy fields, calculates scores, and renders:

- overall GTM readiness score
- readiness stage
- score confidence
- recommendation
- four-category scorecard
- quick summary
- top recommended actions
- detail-needed list
- best-fit customer focus output
- buyer personas and buying committee output
- buying triggers and targeting signals output
- offer readiness output
- measurable value claims output
- customer evidence and traction output
- revenue motion output
- stalled deals output
- success plan output
- blocker output
- 30/60/90 plan
- raw summary for remaining visible fields

The results page also includes a copy button that creates a plain-text GTM readiness plan for easy pasting elsewhere.

## AI Features

API-backed AI research has been intentionally tabled for cost control. The user-facing research workflow now copies a ChatGPT prompt instead of calling OpenAI from the browser. The prompt is appended to Research notes and copied to the clipboard when possible.

There is still a backend `/api/research` endpoint in `server/server.js`. If `OPENAI_API_KEY` is configured, it can call the OpenAI Responses API with web search and return JSON field suggestions. However, the current frontend workflow does not rely on that endpoint, and `tool/ai-research.js` is intentionally disabled.

## Technical Architecture

The app is a small Node-served static web application:

- `server/server.js` serves static files from `tool/`.
- `tool/index.html` is the intake UI.
- `tool/app.js` handles rendering, autosave, migrations, dynamic tables, snapshots, prompt copy, and report navigation.
- `tool/intake-schema.js` defines the main intake schema.
- `tool/gtm-taxonomy.js` defines industry, business model, and GTM archetype taxonomy.
- `tool/results.html` renders the report and scoring output.
- `server/data/records.json` stores server-side brand records.

Local and Render deployment both use:

```text
npm start
```

Render runs the Node server using `render.yaml`.

## Persistence

The app uses both browser local storage and a lightweight server JSON store:

- Browser storage keeps active draft state and saved records in the current browser profile.
- The backend stores records in `server/data/records.json` when the app is served over HTTP and the API is available.
- Saved records contain `id`, `name`, `createdAt`, `updatedAt`, and a flat `data` object.

## Known Limitations

- The current storage model is a JSON file, not a multi-user database.
- There is no user-level account model. Optional password protection is shared-password based.
- AI research is not currently active in the frontend because of API cost concerns.
- The backend AI endpoint still exists and can incur API costs if reconnected and configured.
- Many form values are stored as flat HTML field names, including table keys, which makes analytics possible but requires careful key parsing.
- Some legacy field IDs and migration code remain to preserve older saved records.
- The overall readiness score depends on manual 1-5 ratings, so it is only as reliable as the user's self-assessment.
- Detailed readiness snapshots are heuristic, not statistically validated scoring models.
- The local browser verification in Codex has recently been unreliable due to a Windows sandbox launch error, so syntax and HTTP checks have been used as fallback verification.
