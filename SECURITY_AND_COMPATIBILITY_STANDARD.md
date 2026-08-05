# Product Safety and Compatibility Standard

This is the required standard for GTM Tool and any future tool or agent built in this project. It applies before a feature is released, not after a problem is found.

## The product rule

Every change must be additive, reversible where practical, and safe for existing records. A new feature may not silently change, expose, discard, or reinterpret a user's saved information.

## Compatibility requirements

- Keep existing field IDs and record formats readable. When a change needs a new format, add a versioned migration and retain a read path for earlier records.
- Add new data under a clearly named, versioned object rather than repurposing an unrelated field.
- Make migration idempotent: safely running it more than once produces the same valid result.
- Add a fixture for an older saved record and prove it still loads, saves, and produces a usable plan.
- Keep API changes backward compatible or publish a versioned endpoint. Do not change a response shape without a compatibility window.
- Put unfinished capabilities behind an explicit feature flag or unavailable state; never let partial work affect saved records.
- Include a rollback note and an automated regression check with every behavior change.

## Privacy and conversation boundary

- Product records must never store Codex, ChatGPT, support-chat, or internal build transcripts unless the user has explicitly chosen a product feature that stores that exact content.
- Do not commit `.env`, API keys, session cookies, real records, browser exports, prompt logs, support transcripts, or backups.
- Keep private runtime data outside source control and restrict who can read production backups and logs.
- Before each production release, scan the repository and build artifacts for secrets and for files named like chat, transcript, conversation, session export, record dump, or backup.
- If private dialogue or a secret is ever committed, treat it as exposed: remove it from active access, rotate the secret, assess the audience, and use a deliberate history-remediation process before declaring the incident closed.

## Security requirements before real customer data

The current shared-password and JSON-file prototype is not an acceptable production data boundary for multiple customers. Before accepting real customer data, the product must have all of the following:

1. Individual sign-in through a maintained identity provider, not a shared password.
2. A managed database with encrypted storage and encrypted backups, replacing the shared JSON file.
3. An organization/tenant ID on every record and server-side authorization on every read, create, update, and delete. A user must never be able to retrieve another organization's record by changing an ID in a URL or request.
4. Role-based permissions for administrators, editors, and viewers.
5. Server-side request validation with allowlisted fields, size limits, safe error messages, and protection against unexpected properties.
6. Rate limits and abuse controls for login, record APIs, AI endpoints, and expensive research actions.
7. Secure secret management in the hosting platform, rotation procedures, and no secrets in browser code, repository history, logs, or error output.
8. Audit records for access and material changes, without recording private prompts, credentials, or full sensitive content.
9. Data-retention, export, deletion, and backup-restore procedures that are tested.
10. Dependency monitoring, automated security checks, an API inventory, and an independent penetration test before launch.

## Required release gate

No release that handles real customer data may pass until it has documented evidence for:

- syntax and functional regression checks;
- old-record migration and rollback checks;
- authorization tests for every record API, including an attempted cross-organization access;
- validation tests for malformed, oversized, and unexpected API input;
- secret and sensitive-file scan;
- dependency vulnerability scan;
- backup restore test;
- review of logs and error pages for sensitive information;
- manual accessibility and task-completion check; and
- critical and high security findings resolved or explicitly accepted by the product owner with a time-bound remediation plan.

## AI and agent requirements

- AI actions must be explicit, bounded, reviewable, and logged only with the minimum metadata needed for operations.
- Send only the minimum relevant context to an AI provider. Exclude credentials, contact details, private notes, and unrelated records by default.
- Do not let an AI action write, send outreach, modify CRM data, or change a plan without a user confirmation.
- Treat AI output as a suggestion, not a fact. Preserve sources and uncertainty when public research is used.
- New agents must follow the same identity, authorization, audit, data-minimization, and release-gate rules as the main application.

## Current status

This standard is the target operating rule. The existing prototype has several good controls (server-side API key, signed cookie, basic security headers, rate limits, ignored runtime record file), but it does not yet meet the production requirements above. Do not invite customers to store real sensitive business data until the production checklist is complete.
