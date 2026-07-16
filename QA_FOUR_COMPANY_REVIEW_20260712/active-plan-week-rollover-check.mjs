import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const recordId = "qa-post-b2b-forgeline-20260712-full-20260714";
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const errors = [];
let savedPayload = null;
page.on("pageerror", (error) => errors.push(error.message));
await page.route(`**/api/records/${recordId}`, async (route) => {
  if (route.request().method() !== "PUT") return route.continue();
  savedPayload = JSON.parse(route.request().postData() || "{}");
  await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ record: { id: recordId, name: savedPayload.name, data: savedPayload.data } }) });
});
const response = await page.goto(`${baseUrl}/results.html?asset=active&recordId=${recordId}`, { waitUntil: "networkidle" });
const initialPriorities = await page.locator("[data-weekly-priority]").count();
const carriedTitle = (await page.locator("[data-weekly-priority] h3").nth(2).textContent())?.trim();
for (let index = 0; index < 2; index += 1) {
  const card = page.locator("[data-weekly-priority]").nth(index);
  await card.locator('[data-weekly-priority-field="status"]').selectOption("Complete");
  await card.locator('[data-weekly-priority-field="evidence"]').fill(`Completed result ${index + 1}`);
}
await page.locator('[data-rollover-index="2"] [data-rollover-field="disposition"]').evaluate((select) => {
  select.value = "Carry forward";
  select.dispatchEvent(new Event("change", { bubbles: true }));
});
await page.locator("#closeActivePlanWeek").evaluate((button) => button.click());
await page.locator("#active-plan-this-week h2").filter({ hasText: "Week 2 Priorities" }).waitFor();
const nextPriorities = await page.locator("[data-weekly-priority]").count();
const historyText = await page.locator("#active-plan-week-history").textContent();
const state = savedPayload?.data?.activePlanWeeklyWorkspace;
const result = {
  status: response?.status(),
  initialPriorities,
  nextPriorities,
  saved: Boolean(savedPayload),
  currentWeek: state?.currentWeek,
  historyCount: state?.history?.length,
  completedRecorded: state?.history?.at(-1)?.priorities?.filter((item) => item.status === "Complete").length,
  historyVisible: new RegExp(`2 of ${initialPriorities} completed`, "i").test(historyText || ""),
  carriedForward: state?.currentPriorities?.some((item) => item.title === carriedTitle),
  errors
};
console.log(JSON.stringify(result, null, 2));
await browser.close();
if (result.status !== 200 || result.initialPriorities < 3 || result.nextPriorities !== 3 || result.currentWeek !== 2 || result.historyCount < 1 || result.completedRecorded !== 2 || !result.historyVisible || !result.carriedForward || errors.length) process.exitCode = 1;
