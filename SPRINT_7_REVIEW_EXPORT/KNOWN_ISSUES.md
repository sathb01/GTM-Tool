# Known Issues

- In-app browser screenshots are still blocked by the current Windows sandbox error: `CreateProcessAsUserW failed: 5`.
- Browser-generated PDF headers/footers such as localhost URL, timestamp, or page number are controlled by the browser print dialog. The report CSS cannot fully suppress those if browser headers/footers are enabled.
- The GTM Tool folder currently appears to Git as an untracked working folder, so normal tracked-file diffs are not available.
