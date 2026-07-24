import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const cookie = String(process.env.GTM_QA_COOKIE || "").trim();
const headers = cookie ? { Cookie: cookie } : {};
const recordIds = [
  "qa3-post-mixed-trailpour-20260724",
  "qa3-post-saas-clientrenew-20260724"
];
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});
const results = [];

async function resetRecord(recordId) {
  const response = await fetch(`${baseUrl}/api/records/${encodeURIComponent(recordId)}`, { headers });
  if (!response.ok) throw new Error(`Could not load ${recordId}: ${response.status}`);
  const record = (await response.json()).record;
  const data = structuredClone(record.data || {});
  delete data.activePlanWeeklyWorkspace;
  Object.keys(data).forEach((key) => {
    if (/^activePlan__(?:action-|weeklyReview__|updatedAt)/.test(key)) delete data[key];
  });
  const saved = await fetch(`${baseUrl}/api/records/${encodeURIComponent(recordId)}`, {
    method: "PUT",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({ ...record, data })
  });
  if (!saved.ok) throw new Error(`Could not reset ${recordId}: ${saved.status}`);
}

async function loadWorkspace(recordId) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    ...(cookie ? { extraHTTPHeaders: { Cookie: cookie } } : {})
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${baseUrl}/results.html?v=20260724-full-cycle&asset=active&recordId=${recordId}`, { waitUntil: "load" });
  await page.waitForSelector("#active-plan-this-week [data-weekly-priority]", { timeout: 20000 });
  return { context, page, errors };
}

async function priorityState(page) {
  return page.evaluate(() => Array.from(document.querySelectorAll("[data-weekly-priority]")).map((card) => ({
    title: card.querySelector("h3")?.textContent.trim() || "",
    status: card.querySelector('[data-weekly-priority-field="status"]')?.value || "",
    evidence: card.querySelector('[data-weekly-priority-field="evidence"]')?.value || ""
  })));
}

async function setPriority(page, index, status, evidence) {
  const card = page.locator("[data-weekly-priority]").nth(index);
  await card.locator('[data-weekly-priority-field="status"]').selectOption({ label: status });
  await card.locator('[data-weekly-priority-field="evidence"]').fill(evidence);
}

async function saveProgress(page) {
  await page.click("#saveWeeklyProgressButton");
  await page.waitForFunction(() => /saved|complete/i.test(document.getElementById("weeklyProgressSaveStatus")?.textContent || ""), null, { timeout: 20000 });
}

async function closeWeek(page, expectedCurrentWeek, options = {}) {
  const { decision = "Continue", learning, nextChange = "", rolloverIndex = null } = options;
  await page.evaluate(() => {
    const section = document.getElementById("active-plan-review");
    const details = section?.querySelector(":scope > details.section-details");
    if (details) details.open = true;
  });
  await page.fill("#activeWeekLearning", learning);
  await page.selectOption("#activeWeekDecision", decision);
  await page.fill("#activeWeekNextChange", nextChange);
  if (Number.isInteger(rolloverIndex)) {
    const row = page.locator(`[data-rollover-index="${rolloverIndex}"]`);
    await row.locator('[data-rollover-field="disposition"]').selectOption({ label: "Carry forward" });
  }
  await page.click("#closeActivePlanWeek");
  const nextWeek = expectedCurrentWeek === 4 ? 1 : expectedCurrentWeek + 1;
  await page.waitForFunction((week) => document.querySelector("#active-plan-this-week h2")?.textContent.includes(`Week ${week} Priorities`), nextWeek, { timeout: 30000 });
}

try {
  for (const recordId of recordIds) {
    await resetRecord(recordId);
    const { context, page, errors } = await loadWorkspace(recordId);
    const checks = {};
    const observations = {};
    let expectedWeek2Complete = 0;
    let expectedWeek2Total = 0;
    try {
      const week1 = await priorityState(page);
      checks.week1HasThreePriorities = week1.length === 3;
      for (let index = 0; index < week1.length; index += 1) {
        await setPriority(page, index, "Complete", `Week 1 priority ${index + 1} completed with a measured result and saved evidence.`);
      }
      await saveProgress(page);
      checks.allCompletePromptsClose = await page.locator("#weeklyClosePrompt").isVisible();
      checks.completedRowsCannotRollOver = await page.evaluate((expected) => {
        const rows = Array.from(document.querySelectorAll(".weekly-rollover-row.is-complete"));
        const visibleControls = rows.flatMap((row) => Array.from(row.querySelectorAll("[data-rollover-field]")))
          .filter((control) => control.offsetParent !== null);
        return rows.length === expected && visibleControls.length === 0;
      }, week1.length);
      await closeWeek(page, 1, {
        learning: "The first week created the required operating foundation and all three outputs met their completion rules."
      });

      const week2 = await priorityState(page);
      checks.week2HasFocusedPriorities = week2.length >= 2 && week2.length <= 3;
      expectedWeek2Total = week2.length;
      expectedWeek2Complete = Math.max(1, week2.length - 1);
      for (let index = 0; index < expectedWeek2Complete; index += 1) {
        await setPriority(page, index, "Complete", `Week 2 priority ${index + 1} completed; the result met the completion rule.`);
      }
      const unfinishedIndex = week2.length - 1;
      await setPriority(page, unfinishedIndex, "In progress", `Week 2 priority ${unfinishedIndex + 1} started but needs one more focused work block.`);
      await saveProgress(page);
      observations.partialWeekUi = await page.evaluate(() => ({
        promptHidden: document.getElementById("weeklyClosePrompt")?.hidden,
        promptVisible: Boolean(document.getElementById("weeklyClosePrompt")?.offsetParent),
        statuses: Array.from(document.querySelectorAll('[data-weekly-priority-field="status"]')).map((control) => control.value),
        saveStatus: document.getElementById("weeklyProgressSaveStatus")?.textContent || ""
      }));
      checks.partialCompletionDoesNotPromptClose = observations.partialWeekUi.promptHidden === true
        && observations.partialWeekUi.promptVisible === false;
      const carriedTitle = week2[unfinishedIndex].title;
      const completedWeek2Titles = week2.slice(0, unfinishedIndex).map((item) => item.title);
      await closeWeek(page, 2, {
        learning: "Two priorities were completed. One remains useful and should continue without adding extra work.",
        nextChange: "",
        rolloverIndex: unfinishedIndex
      });

      const week3 = await priorityState(page);
      checks.onlyUnfinishedWorkCarriesForward = week3.some((item) => item.title === carriedTitle)
        && completedWeek2Titles.every((title) => !week3.some((item) => item.title === title));
      checks.week3StaysWithinThreePriorities = week3.length > 0 && week3.length <= 3;
      for (let index = 0; index < week3.length; index += 1) {
        await setPriority(page, index, "Complete", `Week 3 priority ${index + 1} completed with outcome evidence.`);
      }
      await saveProgress(page);
      await closeWeek(page, 3, {
        decision: "Revise",
        learning: "The carried work is complete. The evidence supports revising one operating variable in the final week.",
        nextChange: "Tighten the qualification threshold before adding volume."
      });

      const week4 = await priorityState(page);
      checks.week4IncludesFocusedChange = week4.some((item) => /qualification threshold/i.test(item.title));
      for (let index = 0; index < week4.length; index += 1) {
        await setPriority(page, index, "Complete", `Week 4 priority ${index + 1} completed and documented.`);
      }
      await saveProgress(page);
      await closeWeek(page, 4, {
        learning: "The 30-day cycle is complete with four weekly decisions and no unresolved carried work."
      });

      const apiResponse = await fetch(`${baseUrl}/api/records/${encodeURIComponent(recordId)}`, { headers });
      const savedRecord = (await apiResponse.json()).record;
      const workspace = savedRecord.data.activePlanWeeklyWorkspace || {};
      observations.history = workspace.history?.map((entry) => ({
        cycle: entry.cycle,
        week: entry.week,
        complete: entry.priorities?.filter((priority) => priority.status === "Complete").length,
        total: entry.priorities?.length
      })) || [];
      observations.currentWeek = workspace.currentWeek;
      observations.cycle = workspace.cycle;
      observations.currentPriorities = workspace.currentPriorities?.length || 0;
      checks.fourWeeksSavedInHistory = observations.history.length === 4
        && [1, 2, 3, 4].every((week) => observations.history.some((entry) => entry.cycle === 1 && entry.week === week));
      checks.partialWeekSavedAccurately = observations.history.some((entry) => entry.week === 2
        && entry.complete === expectedWeek2Complete
        && entry.total === expectedWeek2Total);
      checks.nextCycleStartsAtWeekOne = observations.currentWeek === 1 && observations.cycle === 2;
      checks.nextCycleLimitedToThreePriorities = observations.currentPriorities > 0 && observations.currentPriorities <= 3;
      checks.noPageErrors = errors.length === 0;
    } finally {
      await context.close();
    }
    const failures = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
    results.push({
      recordId,
      checks: Object.keys(checks).length,
      passed: Object.keys(checks).length - failures.length,
      failed: failures.length,
      failures,
      observations,
      errors
    });
  }
} finally {
  await browser.close();
}

const checks = results.reduce((sum, result) => sum + result.checks, 0);
const failed = results.reduce((sum, result) => sum + result.failed, 0);
const failures = results.flatMap((result) => result.failures.map((failure) => `${result.recordId}: ${failure}`));
console.log(JSON.stringify({
  checks,
  passed: checks - failed,
  failed,
  failures,
  results
}, null, 2));
if (failed) process.exitCode = 1;
