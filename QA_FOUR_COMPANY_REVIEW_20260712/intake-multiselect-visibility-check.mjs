import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
if (process.env.GTM_QA_PASSWORD) {
  const login = await context.request.post(`${baseUrl}/login`, { form: { password: process.env.GTM_QA_PASSWORD } });
  if (!login.ok()) throw new Error(`Login failed with status ${login.status()}.`);
}
const recordsResponse = await context.request.get(`${baseUrl}/api/records`);
if (!recordsResponse.ok()) throw new Error(`Record listing failed with status ${recordsResponse.status()}.`);
const recordsPayload = await recordsResponse.json();
const requestedRecordId = String(process.env.GTM_QA_RECORD_ID || "").trim();
const records = (recordsPayload.records || []).filter((record) => (
  requestedRecordId ? record.id === requestedRecordId : record.data?.toolMode === "Pre-Revenue Validation"
));
const results = [];

for (const record of records) {
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/records/**", async (route) => {
    if (["POST", "PUT", "DELETE"].includes(route.request().method())) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ record: { id: record.id } }) });
      return;
    }
    await route.continue();
  });
  const response = await page.goto(`${baseUrl}/index.html?section=preRevenueHypotheses&recordId=${record.id}#preRevenueHypotheses`, { waitUntil: "networkidle" });
  await page.waitForSelector("#preRevenueHypotheses");

  const inspect = () => page.evaluate(() => {
  const visible = (element) => {
    if (!element) return false;
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
  };
  const controls = [...document.querySelectorAll('#preRevenueHypotheses [data-multi-select-dropdown="true"]')]
    .filter((control) => visible(control));
  const checked = [];
  controls.forEach((control) => {
    const selected = [...control.querySelectorAll('.multi-select-selected-text')];
    checked.push({
      name: control.dataset.fieldName,
      values: selected.map((item) => item.textContent.trim()),
      visibleValues: selected.filter(visible).map((item) => item.textContent.trim()),
      styles: selected.map((item) => ({
        color: getComputedStyle(item).color,
        fill: getComputedStyle(item).webkitTextFillColor,
        fontSize: getComputedStyle(item).fontSize
      }))
    });
  });
  const channel = checked.filter((item) => item.name?.endsWith("__likelyBuyerChannel"));
  return {
    sectionTitle: document.querySelector("#preRevenueHypotheses h2")?.textContent.trim() || "",
    visibleControlCount: controls.length,
    channel,
    failures: checked.filter((item) => item.values.length && item.visibleValues.length !== item.values.length)
  };
  });
  const before = await inspect();
  const interaction = await page.evaluate(() => {
    const controls = [...document.querySelectorAll('[data-multi-select-dropdown="true"]')]
      .filter((control) => {
        const rect = control.getBoundingClientRect();
        const style = getComputedStyle(control);
        return control.dataset.fieldName?.endsWith("__likelyBuyerChannel")
          && style.display !== "none"
          && style.visibility !== "hidden"
          && rect.width > 0
          && rect.height > 0;
      });
    return controls.map((control) => {
      if (!control.querySelector('input[type="checkbox"]:checked')) {
        control.querySelector('input[type="checkbox"]')?.click();
      }
      return {
        name: control.dataset.fieldName,
        selected: [...control.querySelectorAll('.multi-select-selected-text')].map((item) => item.textContent.trim()).filter(Boolean)
      };
    });
  });
  await page.evaluate(() => {
    switchActiveSection("preRevenueContext");
    switchActiveSection("preRevenueHypotheses");
  });
  const after = await inspect();
  results.push({
    recordId: record.id,
    name: record.name,
    httpStatus: response?.status(),
    before,
    interaction,
    after,
    errors
  });
  await page.close();
}

await browser.close();
const failures = results.filter((result) => (
  result.httpStatus !== 200
  || result.before.failures.length
  || result.after.failures.length
  || result.errors.length
  || result.interaction.some((item) => !item.selected.length)
  || result.after.channel.some((item) => item.values.length !== item.visibleValues.length)
));
console.log(JSON.stringify({ recordCount: results.length, results, failures: failures.map((item) => item.recordId) }, null, 2));
if (!results.length || failures.length) {
  process.exitCode = 1;
}
