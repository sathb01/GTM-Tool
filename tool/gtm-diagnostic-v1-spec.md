# GTM Readiness Tool v1 Spec

## Product intent

The tool is a reusable GTM readiness diagnostic for any prospective client. It should not hardcode client names, accounts, or output folders into the application flow.

The intended workflow is:

1. Enter a prospective client's company name and website.
2. Use AI-assisted public research to pre-populate as many intake fields as possible.
3. Let the user review and complete the intake using consistent dropdown options wherever possible.
4. Generate a GTM readiness score.
5. Surface GTM improvement suggestions.
6. Produce a practical plan to improve readiness.

## Current MVP boundary

The current app is a static browser-based MVP. It stores intake data in `localStorage` and generates deterministic results in the browser.

The Word intake form has been converted into an online intake workbook in `index.html`, driven by `intake-schema.js`. The schema preserves the major sections, controlled answer options, checklists, scoring fields, and table-style inventories from the document.

Live AI research requires a backend or API endpoint. The intake page now supports an optional `window.GTM_RESEARCH_ENDPOINT` value. If configured, the page will send company name and website to that endpoint and apply returned field suggestions. If no endpoint exists, the UI creates a reusable AI research prompt in the notes field.

## Core intake sections

- Company research
- Market and customer
- GTM readiness assessment
- Goals and constraints

## Scoring areas

- Market and ICP
- Positioning and offer
- Channels and sales motion
- Data and learning
- Execution capacity

Each scored field uses a 1-5 dropdown scale so responses stay consistent across clients.

## Results output

The results page should include:

- Overall readiness score out of 100
- Readiness stage
- Scorecard by GTM area
- Improvement suggestions based on weakest areas
- 90-day GTM plan
- Intake summary for review

## Future AI prefill endpoint contract

Request:

```json
{
  "companyName": "Example Co",
  "website": "https://example.com"
}
```

Response:

```json
{
  "fields": {
    "industry": "B2B SaaS",
    "businessModel": "Subscription",
    "companyStage": "Scaling",
    "primaryMarket": "Mid-market operations teams",
    "targetCustomer": "Operations leaders with manual workflow pain"
  },
  "researchNotes": "Public research summary with source URLs."
}
```
