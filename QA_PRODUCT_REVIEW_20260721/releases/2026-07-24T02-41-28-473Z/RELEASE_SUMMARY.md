# GTM Intelligence OS Release Gate

- Status: **FAILED**
- Environment: render
- Base URL: https://gtm-tool-1mib.onrender.com
- Commit: dc1b18a
- Started: 2026-07-24T02:41:28.473Z
- Finished: 2026-07-24T02:44:03.134Z
- Checks: 1024 passed, 1 failed, 1025 total

| Gate | Category | Status | Passed | Failed | Duration |
| --- | --- | --- | ---: | ---: | ---: |
| Deployment marker | deployment | passed | 1 | 0 | 0.3s |
| Syntax: intake application | syntax | passed | 1 | 0 | 0.1s |
| Syntax: intake schema | syntax | passed | 1 | 0 | 0.1s |
| Syntax: server | syntax | passed | 1 | 0 | 0.1s |
| Syntax: AI intake assistance | syntax | passed | 1 | 0 | 0.1s |
| Syntax: shared feedback | syntax | passed | 1 | 0 | 0.1s |
| Synthetic profile quality | content | passed | 210 | 0 | 0.1s |
| Semantic answer quality | content | passed | 66 | 0 | 0.2s |
| Intake startup and section persistence | persistence | passed | 3 | 0 | 5.2s |
| Visible field binding | schema | passed | 2 | 0 | 3.9s |
| Score and evidence separation | scoring | passed | 17 | 0 | 2.5s |
| Claim dependency integrity | scoring | passed | 9 | 0 | 2.7s |
| Conflict resolution | content | passed | 12 | 0 | 1.3s |
| Ranked recommendation provenance | content | passed | 11 | 0 | 2.4s |
| Improvement route usability | routes | failed | 0 | 1 | 1.8s |
| Adaptive AI control safety | ai | passed | 43 | 0 | 9.6s |
| Four-company AI context isolation | ai | passed | 8 | 0 | 5.1s |
| Canonical plan integrity | plans | passed | 30 | 0 | 3.8s |
| Asset contracts and exports | assets | passed | 440 | 0 | 21.8s |
| Experience and accessibility | responsive | passed | 80 | 0 | 16.7s |
| Post-revenue section deep links | routes | passed | 9 | 0 | 10.3s |
| Four-company intake and output sweep | render | passed | 78 | 0 | 66.3s |

## Blocking Failures

- Improvement route usability: Command failed: C:\Users\sathb\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe QA_PRODUCT_REVIEW_20260721\phase1-improvement-route-audit.mjs
