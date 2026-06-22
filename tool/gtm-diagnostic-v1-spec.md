# GTM Readiness Tool v1 Spec

## Product intent

The tool is a reusable GTM readiness diagnostic for any prospective client. It should not hardcode client names, accounts, or output folders into the application flow.

The intended workflow is:

1. Enter a prospective client's company name and website.
2. Generate a reusable ChatGPT research prompt that the user can run manually.
3. Let the user review and complete the intake using consistent dropdown options wherever possible.
4. Generate a GTM readiness score.
5. Surface GTM improvement suggestions.
6. Produce a practical plan to improve readiness.

## Current MVP boundary

The current app is a static browser-based MVP. It stores intake data in `localStorage` and generates deterministic results in the browser.

The Word intake form has been converted into an online intake workbook in `index.html`, driven by `intake-schema.js`. The schema preserves the major sections, controlled answer options, checklists, scoring fields, and table-style inventories from the document.

Live API-backed AI research is intentionally paused for the MVP to avoid surprise usage costs. The intake page now creates a reusable ChatGPT research prompt and copies it to the clipboard when possible. The prompt asks ChatGPT to return paste-friendly tables for public presence, field suggestions, source URLs, research notes, and open questions.

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

## Deferred AI prefill endpoint contract

This is not active in the current MVP. Revisit only if API spend controls, caching, and section-level opt-in are added.

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
