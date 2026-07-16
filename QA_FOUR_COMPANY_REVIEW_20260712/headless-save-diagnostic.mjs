import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const recordId = "qa-post-saas-relaymetrics-20260712-full-20260714";

for (const [asset, control, statusSelector] of [
  ["active", "#saveActivePlanButton", "#activePlanSaveStatus"],
  ["outreach", "#saveOutreachSequence", "#outreachSaveStatus"]
]) {
  const page = await browser.newPage();
  const events = [];
  page.on("console", (message) => events.push({ type: `console:${message.type()}`, text: message.text() }));
  page.on("pageerror", (error) => events.push({ type: "pageerror", text: error.stack || error.message }));
  page.on("request", (request) => {
    if (request.url().includes("/api/records/")) events.push({ type: "request", text: `${request.method()} ${request.url()}` });
  });
  page.on("response", (response) => {
    if (response.url().includes("/api/records/")) events.push({ type: "response", text: `${response.status()} ${response.url()}` });
  });
  await page.goto(`http://127.0.0.1:8787/results.html?asset=${asset}&recordId=${recordId}`, { waitUntil: "networkidle" });
  const clickState = await page.evaluate((selector) => {
    const button = document.querySelector(selector);
    if (!button) return { found: false };
    const rect = button.getBoundingClientRect();
    const topElement = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    button.click();
    return { found: true, topElement: topElement?.id || topElement?.tagName || "", rect: { x: rect.x, y: rect.y, width: rect.width, height: rect.height } };
  }, control);
  await page.waitForTimeout(1500);
  const state = await page.evaluate(({ control, statusSelector }) => ({
    buttonText: document.querySelector(control)?.textContent?.trim() || "",
    disabled: Boolean(document.querySelector(control)?.disabled),
    status: document.querySelector(statusSelector)?.textContent?.trim() || ""
  }), { control, statusSelector });
  console.log(JSON.stringify({ asset, clickState, state, events }, null, 2));
  await page.close();
}

await browser.close();
