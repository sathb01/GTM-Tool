import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const cookie = process.env.GTM_QA_COOKIE || "";
const recordId = "qa3-post-saas-clientrenew-20260724";
const headers = cookie ? { Cookie: cookie } : {};
const sourceResponse = await fetch(`${baseUrl}/api/records/${encodeURIComponent(recordId)}`, { headers });
if (!sourceResponse.ok) throw new Error(`Could not load ${recordId}: ${sourceResponse.status}`);
let testRecord = structuredClone((await sourceResponse.json()).record);
delete testRecord.data.activePlanWeeklyWorkspace;
testRecord.data.activePlanToolSetupWorkspace = {
  statuses: { icp: "Ready", personas: "Ready", targets: "Ready", messaging: "Ready", outreach: "Ready", "weekly-review-setup": "Ready" },
  reasons: {},
  ready: true,
  started: true
};
Object.keys(testRecord.data).forEach((key) => {
  if (/^activePlan__(?:action-|weeklyReview__|updatedAt)/.test(key)) delete testRecord.data[key];
});
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  ...(cookie ? { extraHTTPHeaders: { Cookie: cookie } } : {})
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

try {
  await page.route("**/api/records/**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ record: testRecord })
      });
      return;
    }
    if (route.request().method() !== "PUT") return route.continue();
    const body = route.request().postDataJSON();
    testRecord = { ...testRecord, ...body, id: recordId, data: body.data || testRecord.data };
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ record: testRecord })
    });
  });

  await page.goto(`${baseUrl}/results.html?asset=active&action=1&recordId=${recordId}`, { waitUntil: "load" });
  await page.waitForSelector("#active-plan-this-week", { timeout: 20000 });
  const initial = await page.evaluate(() => ({
    actionRunnerPresent: Boolean(document.getElementById("action-runner")),
    actionParameterRemoved: !new URLSearchParams(window.location.search).has("action"),
    planModeVisible: document.body.innerText.includes("Plan Mode"),
    planOutlookCollapsed: !document.querySelector("#active-plan-weeks > details.section-details")?.open,
    closeWeekCollapsed: !document.querySelector("#active-plan-review > details.section-details")?.open,
    toolSetupComplete: document.querySelector("#active-plan-objective")?.innerText.includes("Tool Setup is complete") || false,
    samePageNavHidden: document.getElementById("currentSectionNav")?.hidden || getComputedStyle(document.getElementById("currentSectionNav")).display === "none",
    priorityCount: document.querySelectorAll("[data-weekly-priority]").length,
    instructionCount: document.querySelectorAll(".active-plan-task-instruction").length,
    resultCount: document.querySelectorAll('[data-weekly-priority-field="result"]').length,
    learningCount: document.querySelectorAll('[data-weekly-priority-field="learning"]').length,
    blockerCount: document.querySelectorAll('[data-weekly-priority-field="blocker"]').length,
    resourceCount: document.querySelectorAll(".active-plan-task-resources").length,
    workOnActionLinks: Array.from(document.querySelectorAll("#active-plan-this-week a")).filter((link) => /Work on this action/i.test(link.textContent)).length,
    planLinks: Array.from(document.querySelectorAll("#active-plan-this-week a")).filter((link) => /GTM Action Plan/i.test(link.textContent)).length,
    onThisWeekHash: window.location.hash === "#active-plan-this-week"
  }));

  await page.evaluate(() => {
    document.querySelectorAll("[data-weekly-priority]").forEach((card, index) => {
      const status = card.querySelector('[data-weekly-priority-field="status"]');
      const result = card.querySelector('[data-weekly-priority-field="result"]');
      status.value = "Complete";
      status.dispatchEvent(new Event("change", { bubbles: true }));
      result.value = `Completed priority ${index + 1} with a measured result.`;
      result.dispatchEvent(new Event("input", { bubbles: true }));
    });
  });
  await page.click("#saveWeeklyProgressButton");
  await page.waitForFunction(() => Boolean(document.getElementById("weeklyProgressSaveStatus")?.textContent.trim()), null, { timeout: 20000 });
  await page.waitForFunction(() => !document.getElementById("weeklyClosePrompt")?.hidden, null, { timeout: 20000 });
  const completed = await page.evaluate(() => ({
    closePromptVisible: !document.getElementById("weeklyClosePrompt")?.hidden,
    saveMessage: document.getElementById("weeklyProgressSaveStatus")?.textContent || "",
    rolloverSummary: document.getElementById("weeklyRolloverSummary")?.textContent || "",
    completedRolloverRows: document.querySelectorAll(".weekly-rollover-row.is-complete").length,
    visibleCompletedRolloverRows: Array.from(document.querySelectorAll(".weekly-rollover-row.is-complete"))
      .filter((row) => row.offsetParent !== null).length,
    visibleRolloverControls: Array.from(document.querySelectorAll(".weekly-rollover-row.is-complete label"))
      .filter((label) => getComputedStyle(label).display !== "none").length,
    completeNotes: Array.from(document.querySelectorAll(".weekly-complete-note"))
      .filter((note) => note.offsetParent !== null).length,
    rolloverDecisionVisible: Boolean(document.getElementById("weeklyRolloverDecision")?.offsetParent),
    fullRolloverConfirmVisible: Boolean(document.getElementById("weeklyFullRolloverConfirm")?.offsetParent)
  }));
  const screenshotDirectory = String(process.env.GTM_QA_SCREENSHOT_DIR || "").trim();
  if (screenshotDirectory) {
    fs.mkdirSync(screenshotDirectory, { recursive: true });
    await page.evaluate(() => {
      const details = document.querySelector("#active-plan-review > details.section-details");
      if (details) details.open = true;
    });
    await page.locator("#active-plan-review").screenshot({
      path: path.join(screenshotDirectory, "active-plan-complete-desktop.png"),
    });
    await page.setViewportSize({ width: 390, height: 844 });
    await page.locator("#active-plan-review").screenshot({
      path: path.join(screenshotDirectory, "active-plan-complete-mobile.png"),
    });
  }

  const checks = {
    postRevenueActionRunnerRemoved: !initial.actionRunnerPresent && initial.actionParameterRemoved,
    internalModeLabelRemoved: !initial.planModeVisible && initial.toolSetupComplete,
    futureWorkStartsCollapsed: initial.planOutlookCollapsed && initial.closeWeekCollapsed,
    redundantSamePageNavigationRemoved: initial.samePageNavHidden,
    weeklyPlanLimitedToThreePriorities: initial.priorityCount === 3,
    eachPriorityHasPlainInstruction: initial.instructionCount === initial.priorityCount,
    eachPriorityCapturesResultLearningAndBlocker: initial.resultCount === initial.priorityCount
      && initial.learningCount === initial.priorityCount
      && initial.blockerCount === initial.priorityCount,
    eachPriorityShowsRelevantResources: initial.resourceCount >= 2,
    duplicateWorkflowLinksRemoved: initial.workOnActionLinks === 0 && initial.planLinks === 0,
    oldActionLinkReturnsToThisWeek: initial.onThisWeekHash,
    allCompletePromptsWeekClose: completed.closePromptVisible && /ready|complete/i.test(completed.saveMessage),
    completedWorkCannotCarryForward: completed.completedRolloverRows === initial.priorityCount
      && completed.visibleCompletedRolloverRows === 0
      && completed.visibleRolloverControls === 0
      && completed.completeNotes === 0
      && !completed.rolloverDecisionVisible
      && !completed.fullRolloverConfirmVisible
      && /Nothing will carry forward/i.test(completed.rolloverSummary),
    noPageErrors: errors.length === 0
  };
  const failures = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
  console.log(JSON.stringify({
    checks: Object.keys(checks).length,
    passed: Object.keys(checks).length - failures.length,
    failed: failures.length,
    failures,
    initial,
    completed,
    errors
  }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await context.close();
  await browser.close();
}
