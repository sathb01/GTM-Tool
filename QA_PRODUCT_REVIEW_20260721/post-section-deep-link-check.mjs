import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = "http://127.0.0.1:8787";
const recordId = "qa2-post-mixed-fieldsip-20260721";
const sections = ["company", "executiveQuickReview", "quickIcp", "goals", "traction", "personas", "offer", "signals", "pipeline"];
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const results = [];

try {
  for (const section of sections) {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/api/records/**", async (route) => {
      if (["POST", "PUT", "DELETE"].includes(route.request().method())) {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ record: { id: recordId } }) });
        return;
      }
      await route.continue();
    });
    const response = await page.goto(`${baseUrl}/index.html?section=${section}&recordId=${recordId}#${section}`, { waitUntil: "networkidle" });
    const state = await page.evaluate(() => ({
      activeSection: document.querySelector("#sections > section")?.id || "",
      activeRecordId: localStorage.getItem("gtmReadinessIntake:activeRecordId") || "",
      companyName: document.querySelector('[name="companyName"]')?.value || "",
      reviewMode: localStorage.getItem("gtmReadinessIntake") || ""
    }));
    results.push({ section, status: response?.status(), ...state, errors, passed: response?.status() === 200 && state.activeSection === section && state.activeRecordId === recordId && errors.length === 0 });
    await context.close();
  }
} finally {
  await browser.close();
}

const failures = results.filter((result) => !result.passed);
console.log(JSON.stringify({ checks: results.length, passed: results.length - failures.length, failed: failures.length, failures, results }, null, 2));
if (failures.length) process.exitCode = 1;

