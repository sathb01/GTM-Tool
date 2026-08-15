import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));

const data = {
  companyName: "Phase 8 Guided Redesign QA",
  bestFitCustomerGroup: "Operations leaders at growing B2B service firms",
  bestFitPrimaryPain: "Pipeline work is inconsistent and hard to learn from",
  bestFitTrigger: "A quarterly growth target is at risk",
  bestFitDecisionMaker: "VP Sales",
  quickBuyerProblem: "The team lacks a repeatable qualified-account motion",
  quick90DayGoal: "Test the current ICP, offer, and motion with 25 accounts",
  quick90DaySuccessMetric: "Five qualified conversations and one repeatable learning signal",
  weeklyRevenueHours: "5",
  primaryRevenueOwner: "VP Sales",
  pipelineReviewOwner: "VP Sales",
  revenueReportingCadence: "Weekly",
  revenueTrackingSystem: "HubSpot",
  revenueDataQuality: "Medium",
  quickPrimaryRevenueSource: "Direct outbound email",
  quickCurrentSalesMotion: "Inside sales"
};

await page.addInitScript((value) => {
  if (!localStorage.getItem("gtmReadinessIntake")) {
    localStorage.setItem("gtmReadinessIntake", JSON.stringify(value));
    localStorage.removeItem("gtmReadinessIntake:activeRecordId");
    localStorage.removeItem("gtmReadinessIntake:records");
  }
}, data);

const results = [];
const check = (name, passed, detail = "") => results.push({ check: name, passed: Boolean(passed), ...(detail ? { detail } : {}) });

try {
  await page.goto(`${baseUrl}/results.html?asset=gtm`, { waitUntil: "load" });
  await page.waitForSelector("#workspaceSummaryCards .metric-card");
  const summary = await page.evaluate(() => ({
    cards: Array.from(document.querySelectorAll("#workspaceSummaryCards .metric-card")).map((card) => card.innerText),
    fullText: document.body.innerText,
    linkLabels: Array.from(document.querySelectorAll("#workspaceSummaryCards .metric-card-link")).map((link) => link.textContent.trim())
  }));
  check("Plan Summary renders four distinct cards", summary.cards.length === 4);
  check("Launch decision leads the score card", /Go|Conditional Go|Not Ready/.test(summary.cards[0]));
  check("Input-completeness confidence metric is absent", !/Evidence confidence/i.test(summary.fullText));
  check("Generic summary detours are absent", !summary.linkLabels.some((label) => /Learn more|Improve this section/i.test(label)));

  await page.goto(`${baseUrl}/results.html?asset=active`, { waitUntil: "load" });
  await page.waitForSelector("#active-plan-objective .active-plan-tool-card");
  check("Tool Setup shows one current task", await page.locator("#active-plan-objective .active-plan-tool-card").count() === 1);
  const currentSetupLink = page.locator("#active-plan-objective .active-plan-tool-card a[href*='asset=icp'][href*='taskOrigin=summary']");
  check("First brief opens its actual guided workspace", await currentSetupLink.count() === 1);
  await currentSetupLink.click();
  await page.waitForSelector("#completeGuidedReference");
  await page.locator("#completeGuidedReference").click();
  await page.waitForSelector("#persona-overview");
  check("Completing a brief advances to the next guided task", await page.locator("#completeGuidedReference").count() === 1 && /asset=personas/.test(page.url()));

  await page.goto(`${baseUrl}/results.html?asset=weekly-review-setup`, { waitUntil: "load" });
  await page.waitForSelector("#weekly-review-setup-workspace");
  if (await page.locator("#weeklySetupDay").count()) await page.selectOption("#weeklySetupDay", "Friday");
  if (await page.locator("#weeklySetupOwner").count()) await page.selectOption("#weeklySetupOwner", "VP Sales");
  if (await page.locator("#weeklySetupCrm").count()) await page.fill("#weeklySetupCrm", "HubSpot");
  if (await page.locator("#weeklySetupGoNoGo").count()) await page.fill("#weeklySetupGoNoGo", "Go: Five qualified conversations and one repeatable learning signal.\nNo-Go: Fewer than two qualified conversations after 25 matched accounts.");
  await page.locator("#setWeeklyReviewReady").click();
  await page.waitForFunction(() => JSON.parse(localStorage.getItem("gtmReadinessIntake") || "{}").weeklyGtmReviewSetupWorkspace?.status === "ready");
  const setupState = await page.evaluate(() => JSON.parse(localStorage.getItem("gtmReadinessIntake") || "{}").weeklyGtmReviewSetupWorkspace);
  check("Weekly Review Setup saves a durable ready state", setupState?.status === "ready" && setupState.reviewDay === "Friday");
  check("Weekly Review Setup remains distinct from evidence entry", await page.locator("#weekly-review-workspace").count() === 0);
} finally {
  await browser.close();
}

pageErrors.forEach((error) => check(`No page error: ${error}`, false, error));
const failed = results.filter((item) => !item.passed);
console.log(JSON.stringify({
  checks: results.length,
  passed: results.length - failed.length,
  failed: failed.length,
  failures: failed.map((item) => item.detail || item.check),
  results,
  pageErrors
}, null, 2));
if (failed.length) process.exitCode = 1;
