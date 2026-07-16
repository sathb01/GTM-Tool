# Known Issues

- In-app browser screenshots/PDF capture are still blocked by the Windows sandbox issue: `CreateProcessAsUserW failed: 5`.
- Browser-generated print headers and footers, including localhost URL and timestamp, must be disabled in the browser print dialog if they appear. CSS can hide in-page elements but cannot fully control browser chrome headers/footers.
- Page counts in this export are estimated from generated text because browser PDF rendering is unavailable in the current sandbox.
- The GTM Tool folder currently appears to Git as an untracked working folder, so normal tracked-file diffs are not available.
