# Known Issues

- Codex browser screenshot capture is still blocked in this environment by the Windows sandbox runner error: `CreateProcessAsUserW failed: 5`.
- Screenshots were therefore not captured inside Codex. The app can still be opened manually at `http://127.0.0.1:8787/results.html?v=20260618-sprint2a`.
- Activity Model calculations remain deterministic and simple by design. If average deal size or a numeric revenue goal is missing, the model shows a missing-data message instead of inventing numbers.
- Sprint 2A does not validate against a live CRM because CRM integrations are intentionally out of scope.
