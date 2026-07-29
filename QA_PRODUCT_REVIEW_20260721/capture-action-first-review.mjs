import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const recordId = "qa3-post-saas-clientrenew-20260724";
const outputDir = path.resolve("QA_PRODUCT_REVIEW_20260721", "screenshots", "action-first");
fs.mkdirSync(outputDir, { recursive: true });

const response = await fetch(`${baseUrl}/api/records/${encodeURIComponent(recordId)}`);
if (!response.ok) throw new Error(`Could not load ${recordId}: ${response.status}`);
const sourceRecord = (await response.json()).record;
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});

async function contextWithRecord(viewport, freshPlan = false) {
  const context = await browser.newContext({ viewport });
  let record = structuredClone(sourceRecord);
  if (freshPlan) {
    delete record.data.activePlanToolSetupWorkspace;
    delete record.data.activePlanWeeklyWorkspace;
    Object.keys(record.data).forEach((key) => {
      if (/^activePlan__(?:action-|weeklyReview__|updatedAt)/.test(key)) delete record.data[key];
    });
  }
  await context.route("**/api/records/**", async (route) => {
    if (route.request().method() === "GET") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ record }) });
      return;
    }
    if (route.request().method() === "PUT") {
      const body = route.request().postDataJSON();
      record = { ...record, ...body, id: recordId, data: body.data || record.data };
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ record }) });
      return;
    }
    await route.continue();
  });
  return context;
}

async function capture(name, asset, viewport = { width: 1440, height: 1000 }, options = {}) {
  const context = await contextWithRecord(viewport, options.freshPlan);
  const page = await context.newPage();
  await page.goto(`${baseUrl}/results.html?v=action-first-visual&asset=${asset}&recordId=${recordId}`, { waitUntil: "load" });
  if (options.startWeek) {
    await page.waitForSelector("[data-tool-setup-status]", { timeout: 20000 });
    await page.evaluate(() => {
      document.querySelectorAll("[data-tool-setup-status]").forEach((control) => {
        control.value = "Ready";
        control.dispatchEvent(new Event("change", { bubbles: true }));
      });
    });
    await page.click("#startWeekOneButton");
    await page.waitForSelector("#active-plan-this-week [data-weekly-priority]", { timeout: 20000 });
  } else if (options.selector) {
    await page.waitForSelector(options.selector, { timeout: 20000 });
  }
  const file = path.join(outputDir, `${name}.png`);
  await page.screenshot({ path: file, fullPage: options.fullPage !== false });
  console.log(file);
  await context.close();
}

try {
  await capture("clientrenew-summary-desktop", "gtm", { width: 1440, height: 1000 }, { selector: "#workspaceSummaryCards" });
  await capture("clientrenew-tool-setup-desktop", "active", { width: 1440, height: 1000 }, { freshPlan: true, selector: "#active-plan-objective [data-tool-setup-status]" });
  await capture("clientrenew-this-week-desktop", "active", { width: 1440, height: 1000 }, { freshPlan: true, startWeek: true });
  await capture("clientrenew-this-week-mobile", "active", { width: 390, height: 844 }, { freshPlan: true, startWeek: true });
  await capture("clientrenew-persona-desktop", "personas", { width: 1440, height: 1000 }, { selector: "#persona-conversation-guide" });
  await capture("clientrenew-icp-desktop", "icp", { width: 1440, height: 1000 }, { selector: "#icp-brief" });
} finally {
  await browser.close();
}
