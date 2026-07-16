# GTM Tool Backend

The backend serves the intake tool and stores saved brand records on the server.

## Local Run

From the project root:

```bash
npm start
```

Then open:

```text
http://localhost:8787
```

## API

- `GET /api/records` lists saved brands.
- `POST /api/records` creates a brand record.
- `PUT /api/records/:id` creates or updates a brand record.
- `POST /api/research` returns reviewed, source-backed company research proposals when `OPENAI_API_KEY` is configured.

## AI Research Setup

Set this environment variable on the server:

```text
OPENAI_API_KEY=your OpenAI API key
```

Optional:

```text
OPENAI_MODEL=gpt-4.1-mini
```

In Render:

1. Open the `gtm-tool` web service.
2. Go to `Environment`.
3. Add `OPENAI_API_KEY`.
4. Redeploy the service.

The browser must not contain the API key. `Research Company` calls the backend endpoint, and the backend calls OpenAI with web search. The server allowlists supported public fields, and the browser requires user review before applying any proposal.

## Embedded AI Help

The Find or ask control uses the authenticated server endpoint:

```text
GET /api/assistant
POST /api/assistant
```

Set these Render environment variables:

```text
OPENAI_API_KEY=your OpenAI API key
OPENAI_MODEL=gpt-4.1-mini
```

The browser never receives the API key. AI runs only after the user selects `Ask AI`. The server excludes contact and credential fields from the model context, limits context size, and rate-limits requests per network address.

## Access Password Setup

Set this environment variable on the server before sharing the public URL:

```text
TOOL_PASSWORD=choose a strong shared access password
```

Optional but recommended:

```text
AUTH_SECRET=choose a long random secret
```

Behavior:

- If `TOOL_PASSWORD` is not set, the tool is open.
- If `TOOL_PASSWORD` is set, users must log in before using the tool.
- The login protects the intake pages and backend API endpoints.
- The password should be added in Render's `Environment` settings, not committed to Git.

## Data Storage

Records are stored in:

```text
server/data/records.json
```

That file is ignored by Git so private client data is not committed.

## Public Deployment Note

Because this now has a backend, deploy it to a service that can run a Node server, such as Render, Railway, Fly.io, or a VPS. Static-only hosts such as Netlify Drop can show the form but will not store shared records unless paired with a backend.
