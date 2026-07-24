# GTM Intelligence OS Release Gate

The release gate runs the permanent synthetic-company checks and writes:

- `release-gate.json` for machine-readable results
- `RELEASE_SUMMARY.md` for a concise human review

Each run is archived under:

```text
QA_PRODUCT_REVIEW_20260721/releases/<timestamp>/
```

No real customer data is written to the archive.

## Local

Start the local server, then run:

```text
npm run qa:release
```

The local gate includes the guided save-and-return persistence test.

## Render

Set these environment variables for the command:

```text
GTM_QA_BASE_URL=https://gtm-tool-1mib.onrender.com
GTM_QA_COOKIE=<authenticated cookie header>
GTM_RELEASE_MARKER=<unique string present in the intended release>
```

Then run:

```text
npm run qa:release
```

The Render gate fails before regression testing if the deployment marker is missing. Live runs exclude the write-based roundtrip suite and use read-only or intercepted-write checks against synthetic QA records.

## Blocking Rule

The process exits with a failure code when any required syntax, schema, persistence, scoring, AI-control, plan, asset, responsive, route, or render gate fails.
