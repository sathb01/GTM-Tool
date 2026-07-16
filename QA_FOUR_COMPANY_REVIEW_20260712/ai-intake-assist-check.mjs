import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const recordId = "qa-post-b2b-forgeline-20260712-full-20260714";
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const errors = [];
let researchRequests = 0;
let assistantRequests = 0;
let savedPayload = null;
page.on("pageerror", (error) => errors.push(error.stack || error.message));
await page.route("**/api/research", async (route) => {
  researchRequests += 1;
  await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({
    matchedCompany: { name: "ForgeLine Operations", website: "https://forgeline.example", matchConfidence: "High", matchReason: "The supplied website and company name match." },
    proposals: [
      { fieldId: "companyName", label: "Company name", value: "ForgeLine Operations", confidence: "High", classification: "Public fact", evidence: "Named on the company website.", sourceUrls: ["https://forgeline.example"] },
      { fieldId: "publicPresence__instagram__url", label: "Instagram", value: "https://instagram.com/forgeline", confidence: "High", classification: "Public fact", evidence: "Linked from the website.", sourceUrls: ["https://forgeline.example"] }
    ],
    conflicts: [],
    notes: "Public company research test."
  }) });
});
await page.route("**/api/assistant", async (route) => {
  assistantRequests += 1;
  await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ answer: "Specialty manufacturers with urgent throughput constraints and limited internal process-improvement capacity." }) });
});
await page.route(`**/api/records/${recordId}`, async (route) => {
  if (route.request().method() !== "PUT") return route.continue();
  savedPayload = JSON.parse(route.request().postData() || "{}");
  await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ record: { id: recordId, name: savedPayload.name, data: savedPayload.data } }) });
});

const response = await page.goto(`${baseUrl}/index.html?section=executiveQuickReview&recordId=${recordId}`, { waitUntil: "networkidle" });
await page.locator("#topResearchButton").click();
const panelVisible = await page.locator(".ai-research-panel").isVisible();
await page.locator("#runAiCompanyResearch").click();
await page.locator("[data-research-proposal]").first().waitFor();
const existingUnchecked = !(await page.locator('[data-research-proposal="0"] input[type="checkbox"]').isChecked());
await page.locator("#selectBlankResearchFields").click();
await page.locator('[data-research-proposal="1"] input[type="checkbox"]').check();
await page.locator("#applyAiResearch").click();
await page.waitForTimeout(1500);
const applyStatus = await page.locator("#aiResearchApplyStatus").textContent();
const researchApplied = savedPayload?.data?.["publicPresence__instagram__url"] === "https://instagram.com/forgeline";
await page.locator(".ai-research-close").click();

const fieldWrapper = page.locator('[data-field-id="quickBestFitCustomer"]');
const fieldHelpVisible = await fieldWrapper.locator(".ai-field-help-button").isVisible();
await fieldWrapper.locator(".ai-field-help-button").click();
await fieldWrapper.locator(".ai-field-suggestion").waitFor({ state: "visible" });
await fieldWrapper.locator("[data-use-ai-field]").click();
await fieldWrapper.locator(".ai-field-status").filter({ hasText: "added and saved" }).waitFor();
const fieldValue = await fieldWrapper.locator('[name="quickBestFitCustomer"]').inputValue();

const result = {
  status: response?.status(),
  panelVisible,
  researchRequests,
  proposalCount: await page.locator("[data-research-proposal]").count(),
  existingUnchecked,
  applyStatus,
  researchApplied,
  fieldHelpVisible,
  assistantRequests,
  fieldValue,
  errors
};
console.log(JSON.stringify(result, null, 2));
await browser.close();
if (result.status !== 200 || !panelVisible || researchRequests !== 1 || result.proposalCount !== 2 || !existingUnchecked || !/added and saved/i.test(applyStatus || "") || !researchApplied || !fieldHelpVisible || assistantRequests !== 1 || !/Specialty manufacturers/.test(fieldValue) || errors.length) process.exitCode = 1;
