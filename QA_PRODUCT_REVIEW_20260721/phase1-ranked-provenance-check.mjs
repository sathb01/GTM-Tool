import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const cookie = process.env.GTM_QA_COOKIE || "";
const recordIds = [
  "qa3-post-mixed-trailpour-20260724",
  "qa3-post-saas-clientrenew-20260724"
];
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});
const results = [];

try {
  for (const recordId of recordIds) {
    const context = await browser.newContext({
      viewport: { width: 1440, height: 900 },
      ...(cookie ? { extraHTTPHeaders: { Cookie: cookie } } : {})
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${baseUrl}/results.html?v=20260723-phase1-ranked&asset=gtm&recordId=${recordId}`, {
      waitUntil: "load"
    });
    await page.waitForSelector("#revenueImpactPriorities [data-claim-id]", { timeout: 15000 });
    const priorities = await page.locator("#revenueImpactPriorities [data-claim-id]").evaluateAll((items) => (
      items.map((item) => {
        const controls = Array.from(item.querySelectorAll("a, button"));
        const exactActions = controls.filter((control) => [
          "Improve This Priority",
          "Review Execution Evidence",
          "Work on This Priority"
        ].includes(control.textContent.trim()));
        const genericActions = controls.filter((control) => control.textContent.trim() === "Improve This Section");
        const trace = item.querySelector("[data-claim-trace]");
        return {
          id: item.dataset.claimId || "",
          status: item.dataset.claimStatus || "",
          confidence: item.dataset.claimConfidence || "",
          value: item.dataset.claimValue || "",
          sourceFields: String(item.dataset.claimSourceFields || "").split("|").filter(Boolean),
          exactActionCount: exactActions.length,
          exactActionHref: exactActions[0]?.getAttribute("href") || "",
          genericActionCount: genericActions.length,
          traceSourceCount: trace?.querySelectorAll("li").length || 0,
          rawFieldIdsVisible: /possibleCustomerGroups__|revenueMotionAssessments__|offerAssessments__/i.test(trace?.innerText || "")
        };
      })
    ));
    results.push({ recordId, priorities, errors });
    await context.close();
  }
} finally {
  await browser.close();
}

const allPriorities = results.flatMap((result) => result.priorities);
const checks = {
  bothCompaniesHaveRankedPlans: results.every((result) => result.priorities.length >= 3),
  uniqueStableClaimIds: results.every((result) => new Set(result.priorities.map((item) => item.id)).size === result.priorities.length),
  claimValuesPresent: allPriorities.every((item) => item.value),
  statusesPresent: allPriorities.every((item) => item.status),
  confidencesPresent: allPriorities.every((item) => item.confidence),
  sourceFieldsRetained: allPriorities.every((item) => item.sourceFields.length > 0),
  sourceTraceRendered: allPriorities.every((item) => item.traceSourceCount >= 2),
  oneExactActionPerPriority: allPriorities.every((item) => item.exactActionCount === 1 && item.exactActionHref),
  oldGenericActionsRemoved: allPriorities.every((item) => item.genericActionCount === 0),
  noRawFieldIdsVisible: allPriorities.every((item) => !item.rawFieldIdsVisible),
  noPageErrors: results.every((result) => result.errors.length === 0)
};
const failures = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
console.log(JSON.stringify({
  checks: Object.keys(checks).length,
  passed: Object.keys(checks).length - failures.length,
  failed: failures.length,
  failures,
  results
}, null, 2));
if (failures.length) process.exitCode = 1;
