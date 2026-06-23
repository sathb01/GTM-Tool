# Known Issues

- Browser print headers and footers can still show timestamp, page number, or localhost URL if the browser print dialog has headers and footers enabled.
- The app now displays export guidance, but CSS alone cannot disable browser-controlled print headers and footers in every browser.
- The new single-record server lookup requires the local app server to be restarted before that endpoint is active in the already-running local session.
- Export mode selection remains intentionally simple: Export Report chooses the appropriate report depth from the saved data instead of exposing a large mode selector.

