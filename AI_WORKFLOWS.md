# GTM Tool AI Workflows

Last updated: 2026-07-16

## Current AI Position

Contextual intake and recommendation help is available through the explicit `Find or ask` assistant. Automatic public-company research remains tabled for cost control, and its active user workflow is still prompt-based.

## Embedded Intake and Recommendation Help

The intake and report pages use:

```text
POST /api/assistant
```

Behavior:

- Runs only after the user selects `Ask AI`; local section search does not call AI.
- Uses the current saved company and visible section to recommend answers, explain questions or recommendations, review gaps, and suggest a next action.
- Distinguishes saved evidence from recommendations and does not invent customer evidence.
- Never silently writes an AI answer into the intake or plan.
- Keeps `OPENAI_API_KEY` on the server and defaults to `gpt-4.1-mini` unless `OPENAI_MODEL` is set.
- Excludes contact and credential fields, caps context and output size, and applies an hourly per-network request limit.

## Public Research Prompt Workflow

Automatic AI research is currently tabled for cost control. The active public-research workflow is prompt-based:

1. User enters company name and/or website.
2. User clicks Copy Research Prompt.
3. The app builds a structured research prompt.
4. The app copies the prompt to the clipboard when possible.
5. The app appends the prompt to Research notes.
6. User pastes the prompt into ChatGPT.
7. User pastes useful findings back into the tool.

This avoids OpenAI API usage fees from the app.

## Frontend Prompt Workflow

Main functions in `tool/app.js`:

- `buildResearchPrompt(companyName, website)`
- `prepareResearchPrompt()`
- `copyText(text)`
- `nonEmptyFieldSummary(data)`

The prompt asks ChatGPT to use public sources only, including:

- company website
- product pages
- pricing pages
- demo/contact pages
- resource pages
- LinkedIn
- visible social profiles
- directories
- review sites
- marketplaces
- public news and announcements

The prompt is designed to produce paste-friendly results rather than direct API field writes.

## Current Prompt Goals

The research prompt supports:

- company profile context
- website URLs and public presence
- named competitor and alternative information
- ICP clues
- buyer role clues
- offer and positioning clues
- proof assets and public evidence
- channel and GTM motion clues
- trigger events and public signals
- open questions and uncertainty notes

The app no longer tries to silently fill every field with AI output.

## Backend AI Research Endpoint

The backend still contains an AI research endpoint:

```text
POST /api/research
```

Location:

```text
server/server.js
```

Behavior:

- Requires `OPENAI_API_KEY`.
- Uses `OPENAI_MODEL` or the current server model default.
- Sends company name, website, current fields, and a slice of the schema to OpenAI.
- Uses the Responses API with `web_search_preview`.
- Expects JSON with:

```json
{
  "fields": {
    "fieldName": "value"
  },
  "researchNotes": "short notes with source URLs"
}
```

If `OPENAI_API_KEY` is not configured, the endpoint returns 501 with:

```text
AI Research is not configured yet.
```

## Disabled Browser API Layer

`tool/ai-research.js` is intentionally disabled. It contains only a comment and no active research behavior. This prevents the old API override script from calling `/api/research`.

## Cost-Control Decision

The current product decision is:

- Do not run automated app-side AI research for now.
- Provide a high-quality research prompt that the user can run in ChatGPT.
- Avoid API calls unless a future explicit workflow is approved.

This is important because direct API web research can become expensive if used across many companies, fields, and URLs.

## Good Future AI Workflow Options

### Option 1: Prompt-Only Workflow

Keep the current approach. Improve the generated prompt and ask ChatGPT for structured paste-back sections.

Best for:

- zero app-side API cost
- low engineering complexity
- human review before form entry

Tradeoff:

- requires manual copy/paste
- no automatic field-level validation

### Option 2: Field-Limited API Research

Only use API research for fields that public web research can realistically help with.

Good candidates:

- primary website
- product/solution pages
- pricing page
- demo/contact page
- blog/resources
- LinkedIn company page
- founder/executive profiles
- review profiles
- named competitors
- public proof assets
- public channels and social presence

Poor candidates:

- internal budget
- team capacity
- private pipeline metrics
- sales-cycle reality
- customer proof permission
- current blockers
- confidence ratings

Best for:

- lower API spend
- cleaner AI scope
- fewer hallucinated internal claims

Tradeoff:

- still needs API budget
- still needs source-aware validation

### Option 3: User-Approved Research Queue

Let the app show a checklist of URLs/fields to research, estimate cost or scope, then ask the user to approve each run.

Best for:

- controlled spend
- high user trust
- auditability

Tradeoff:

- more UI and state-management work

### Option 4: Bring-Your-Own-Result Parser

Keep research in ChatGPT, but add a parser that accepts pasted structured research notes and suggests field updates for review.

Best for:

- no API research cost
- still reduces manual entry
- keeps the user in control

Tradeoff:

- needs a paste parser and review UI
- may still need local heuristics or a small API call if parsing is complex

## Recommended Near-Term AI Layer

The best next step is a paste-back workflow:

1. Generate a strong research prompt.
2. Ask ChatGPT to return sections with clear headings and table rows.
3. Add a paste-back parser that reads the response.
4. Show suggested field updates in a review panel.
5. Let the user approve individual updates.

This keeps costs low and makes the app feel smarter without reintroducing uncontrolled API usage.

## AI Safety and Quality Rules

Future AI workflows should follow these rules:

- Never invent private company facts.
- Separate sourced facts from inference.
- Mark uncertain fields as uncertain.
- Prefer source URLs for public claims.
- Never overwrite user-entered values without approval.
- Treat AI suggestions as drafts.
- Do not use AI to fill manual score fields unless the user explicitly asks for a suggested score.
- Do not call paid APIs until the user has opted into that action.

## Candidate AI Output Format

A future paste-back result should use a format like:

```markdown
## Public Presence
| Field | URL | Notes |
| --- | --- | --- |

## Suggested Field Updates
| Field label | Field key | Suggested value | Confidence | Source |
| --- | --- | --- | --- | --- |

## Competitors and Alternatives
| Competitor | Why buyers choose them | Our possible advantage | Source |
| --- | --- | --- | --- |

## Open Questions
- Question 1
- Question 2
```

This structure maps well to the current flat field model.

## AI Integration Risks

- API-backed web research can create unexpected cost.
- Public sources may be stale or wrong.
- Some GTM readiness fields require internal company knowledge and should not be inferred from the web.
- The app does not currently have server-side schema validation for AI field updates.
- The existing `/api/research` endpoint can still be activated by environment variables, so reconnecting it should be deliberate.
