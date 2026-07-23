import { createRequire } from "node:module";
import { qaProfiles } from "./company-profiles.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const cookie = process.env.GTM_QA_COOKIE || "";
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});
const results = [];

try {
  for (const profile of qaProfiles) {
    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
      ...(cookie ? { extraHTTPHeaders: { Cookie: cookie } } : {})
    });
    const page = await context.newPage();
    const requests = [];
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/api/assistant", async (route) => {
      const body = route.request().postDataJSON();
      requests.push(body);
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ answer: `Recommendation for ${profile.name}`, model: "qa-intercept" })
      });
    });
    const preRevenue = profile.mode === "preRevenue";
    const section = preRevenue ? "preRevenueHypotheses" : "executiveQuickReview";
    const fieldId = preRevenue ? "preHypothesisNotes" : "quickBestFitCustomer";
    await page.goto(`${baseUrl}/index.html?section=${section}&recordId=${profile.id}#${section}`, { waitUntil: "load" });
    await page.waitForSelector(`[data-field-id="${fieldId}"]`, { timeout: 15000 });
    await page.waitForFunction((id) => Boolean(document.querySelector(`[name="${id}"]`)?.value), fieldId, { timeout: 15000 });
    const field = page.locator(`[data-field-id="${fieldId}"]`);
    const before = await field.locator(`[name="${fieldId}"]`).inputValue();
    await field.locator(".ai-field-help-button:not([data-review-ai-field])").click();
    await field.locator(".ai-field-suggestion").waitFor({ state: "visible" });
    const after = await field.locator(`[name="${fieldId}"]`).inputValue();
    const request = requests[0];
    const pageContext = JSON.parse(request?.pageContext || "{}");
    const otherNames = qaProfiles.filter((item) => item.id !== profile.id).map((item) => item.name);
    results.push({
      profile: profile.key,
      correctCompany: pageContext.companyName === profile.name,
      correctField: request?.field?.id === fieldId,
      noOtherCompany: otherNames.every((name) => !JSON.stringify(pageContext).includes(name)),
      unchangedBeforeUse: before === after,
      recommendationVisible: await field.locator(".ai-field-suggestion p").innerText() === `Recommendation for ${profile.name}`,
      useAnswerVisible: await field.locator("[data-use-ai-field]").isVisible(),
      errors
    });
    await context.close();
  }
} finally {
  await browser.close();
}

const checks = {
  allFourCompaniesCovered: results.length === 4,
  correctCompanyContext: results.every((item) => item.correctCompany),
  correctQuestionContext: results.every((item) => item.correctField),
  noCrossCompanyContext: results.every((item) => item.noOtherCompany),
  noWriteBeforeApproval: results.every((item) => item.unchangedBeforeUse),
  recommendationsVisibleAtQuestion: results.every((item) => item.recommendationVisible),
  explicitUseAvailable: results.every((item) => item.useAnswerVisible),
  noPageErrors: results.every((item) => item.errors.length === 0)
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
