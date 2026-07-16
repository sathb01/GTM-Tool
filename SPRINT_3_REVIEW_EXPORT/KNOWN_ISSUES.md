# Known Issues

- In-app browser screenshot capture is still blocked by the Windows sandbox issue: `CreateProcessAsUserW failed: 5`.
- The PDF download uses the browser print dialog. Users may need to turn off browser headers and footers when saving the PDF.
- Strategic Insights are deterministic. They use existing intake data only and do not perform external research.
