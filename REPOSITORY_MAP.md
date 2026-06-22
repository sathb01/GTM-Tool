# GTM Tool Repository Map

Last updated: 2026-06-18

## Root

```text
GTM-Tool/
  .gitignore
  AGENTS.md
  BACKEND.md
  CHANGE_LOG.md
  CURRENT_STATE_ANALYSIS.md
  DATA_MODEL.md
  SCORING_MODEL.md
  AI_WORKFLOWS.md
  REPOSITORY_MAP.md
  GTM Intake Form.docx
  GTM-Tool-session-change-log-2026-06-15.md
  Open GTM Tool.vbs
  Start GTM Tool.bat
  Stop GTM Tool.bat
  package.json
  PROJECT_CONTEXT.md
  render.yaml
  runs/
  server/
  tool/
```

## Runtime Entry Points

### `package.json`

Defines the Node app and start command:

```text
npm start
```

The start script runs:

```text
node server/server.js
```

### `render.yaml`

Render deployment config:

- service type: web
- runtime: node
- build command: `npm install`
- start command: `npm start`
- plan: free

### `server/server.js`

Node HTTP server. Responsibilities:

- serves static files from `tool/`
- handles optional shared-password login
- signs and verifies session cookies
- exposes saved-record API
- stores records in JSON
- exposes optional AI research API
- prevents static file caching with `Cache-Control: no-store`

Important endpoints:

- `GET /api/records`
- `POST /api/records`
- `PUT /api/records/:id`
- `POST /api/research`
- `GET /login`
- `POST /login`

Important environment variables:

- `PORT`
- `HOST`
- `TOOL_PASSWORD`
- `AUTH_SECRET`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

## Tool Frontend

### `tool/index.html`

The main intake page. Contains:

- page layout and CSS
- Brand search/browse/save/new/clear controls
- Copy Research Prompt button
- save status and research status
- section navigation
- form container
- detailed action bar
- script includes for taxonomy, schema, AI placeholder, and app logic

Current script cache version observed:

```text
20260617-revenue-motions
```

### `tool/intake-schema.js`

Main schema source for the intake. Defines:

- storage key
- score fields
- all schema sections
- fields
- tables
- content blocks
- helper text
- help blocks
- dropdown options
- fixed table rows
- repeatable card tables

Current major sections:

- `company`
- `executiveQuickReview`
- `quickIcp`
- `goals`
- `traction`
- `icp`
- `personas`
- `offer`
- `signals`
- `pipeline`

### `tool/app.js`

Main frontend application logic. Responsibilities:

- render fields, tables, cards, repeatable rows, help blocks, and sections
- show only Company Information and GTM Information until detailed mode is opened
- handle Quick and Detailed report buttons
- save and autosave drafts
- load and save backend records
- handle brand picker and brand browser
- normalize repeatable list data
- migrate older saved records
- derive taxonomy metadata
- update conditional fields
- create generated summaries
- create offer, signal, and revenue motion assessment panels
- calculate live readiness snapshots
- generate and copy the ChatGPT research prompt
- submit to the results page

Important functions:

- `renderSections`
- `sectionVisible`
- `submitIntake`
- `showDetailedSections`
- `getFormData`
- `setFormData`
- `saveDraft`
- `loadDraft`
- `loadBackendRecords`
- `normalizeRepeatableData`
- `normalizeLegacyIcpData`
- `normalizeLegacyGoalData`
- `migrateTractionData`
- `migratePersonaData`
- `migrateOfferData`
- `migrateSignalData`
- `migrateRevenueMotionData`
- `buildResearchPrompt`
- `prepareResearchPrompt`
- `offerReadinessSnapshot`
- `signalReadinessSnapshot`
- `revenueMotionReadinessSnapshot`

### `tool/results.html`

The report page. Contains:

- CSS and report layout
- schema-aware labels
- overall readiness scoring
- category scoring
- score confidence
- recommendations
- quick summary
- best-fit customer focus rendering
- buyer persona rendering
- signal play rendering
- offer readiness rendering
- measurable value claim rendering
- customer evidence rendering
- revenue motion rendering
- stalled deal rendering
- success plan rendering
- blocker rendering
- 30/60/90 plan generation
- copyable report text generation

Important functions:

- `readinessScoreFromFields`
- `categoryScore`
- `stageForScore`
- `recommendationForScore`
- `quickScoreConfidence`
- `buildSuggestions`
- `buildPlan`
- `buildCopyText`
- `renderBestFitCustomerFocus`
- `renderBuyerPersonas`
- `renderBuyingTriggersSignals`
- `renderOfferReadiness`
- `renderCustomerEvidenceTraction`
- `renderRevenueMotionResults`

### `tool/gtm-taxonomy.js`

Defines classification data:

- industry options
- business type options
- archetype groups
- trust-sensitive industries
- industry lookup
- business type lookup
- derived GTM archetype logic

The derived archetype is stored with the intake data and shown on the results page.

### `tool/ai-research.js`

Currently disabled. It intentionally does not call the AI research API.

### Other `tool/` Documents

- `tool/gtm-diagnostic-intake.md`
- `tool/gtm-diagnostic-v1-spec.md`
- `tool/diagnostic-templates.md`

These appear to be older planning/specification documents. `diagnostic-templates.md` is currently empty.

## Backend Data

### `server/data/records.json`

Lightweight JSON data store for saved brand records. It should not be committed with real client data.

### `server/data/.gitkeep`

Keeps the data directory in Git.

## Local Launch Files

### `Start GTM Tool.bat`

Starts the local Node server in a visible command window.

### `Open GTM Tool.vbs`

Starts the local Node server in the background and opens the app without leaving a visible PowerShell window.

### `Stop GTM Tool.bat`

Stops the local server on port 8787.

## Documentation Files

### `BACKEND.md`

Backend setup and deployment notes, including API endpoints, AI research environment variables, password setup, and data storage.

### `PROJECT_CONTEXT.md`

Continuity note for future sessions. Contains project background, historical changes, current location, and implementation notes.

### `CHANGE_LOG.md`

Chronological implementation log.

### `GTM-Tool-session-change-log-2026-06-15.md`

Session-specific change log from June 15.

## Generated Current-State Export Files

The current export consists of:

- `CURRENT_STATE_ANALYSIS.md`
- `DATA_MODEL.md`
- `SCORING_MODEL.md`
- `AI_WORKFLOWS.md`
- `REPOSITORY_MAP.md`
- `CURRENT_STATE_EXPORT.zip`

## Files Most Important for Future AI-Layer Work

Read these first:

1. `tool/intake-schema.js`
2. `tool/app.js`
3. `tool/results.html`
4. `server/server.js`
5. `tool/gtm-taxonomy.js`
6. `DATA_MODEL.md`
7. `AI_WORKFLOWS.md`
8. `SCORING_MODEL.md`

## Development Notes

- The frontend is plain HTML, CSS, and JavaScript.
- There is no build step.
- The backend is plain Node ESM.
- There are no external package dependencies at the moment.
- Syntax checks can be run with Node's `--check`.
- Since there is no test suite, verification currently relies on syntax checks, local HTTP checks, and browser/manual testing.

