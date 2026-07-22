import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const cases = [
  ["qa2-post-mixed-fieldsip-20260721", "quickIcp"],
  ["qa2-post-saas-renewalgrid-20260721", "quickIcp"]
];
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const results = [];

try {
  for (const [recordId, section] of cases) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${baseUrl}/index.html?section=${section}&recordId=${recordId}#${section}`, { waitUntil: "networkidle" });
    const binding = await page.evaluate(async (recordId) => {
      const requiredSuffixes = ["groupName", "whoTheyAre", "problem", "whyNow", "observableCompanySignals", "listBuildingClues", "evidenceSource", "implementationFit", "urgency", "abilityToPay", "easeOfAccess", "proofEvidence"];
      const groups = ["customer-group-1", "customer-group-2"].map((rowId) => {
        const fields = Object.fromEntries(requiredSuffixes.map((suffix) => {
          const name = `possibleCustomerGroups__${rowId}__${suffix}`;
          const controls = Array.from(document.querySelectorAll(`[name='${name}']`));
          const values = controls
            .filter((control) => control.type !== "checkbox" || control.checked)
            .map((control) => String(control.value || "").trim())
            .filter(Boolean);
          return [suffix, values];
        }));
        return { rowId, fields, passed: requiredSuffixes.every((suffix) => fields[suffix].length > 0) };
      });
      const firstProblemName = "possibleCustomerGroups__customer-group-1__problem";
      const firstProblemOptions = Array.from(document.querySelectorAll(`[name='${firstProblemName}']`)).map((control) => control.value);
      const recordResponse = await fetch(`/api/records/${encodeURIComponent(recordId)}`);
      const savedProblem = recordResponse.ok ? (await recordResponse.json()).record?.data?.[firstProblemName] || "" : "";
      const problemControl = document.querySelector(`[data-field-name='${firstProblemName}']`);
      return {
        groups,
        debug: {
          savedProblem,
          parsedProblem: splitMultiSelectValues(savedProblem, firstProblemOptions),
          selectedValueString: problemControl?.selectedValueString || ""
        },
        passed: groups.every((group) => group.passed)
      };
    }, recordId);
    results.push({ recordId, ...binding });
    await context.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify(results, null, 2));
if (results.some((result) => !result.passed)) process.exitCode = 1;
