import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const recordId = "qa-pre-dtc-pawpath-20260712-full-20260714";
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

const results = [];
for (const asset of ["validation", "validation-workspace"]) {
  await page.goto(`${baseUrl}/results.html?asset=${asset}&recordId=${recordId}`, { waitUntil: "networkidle" });
  const button = page.getByRole("button", { name: "Download Validation Workbook" }).first();
  const visible = await button.isVisible();
  let filename = "";
  let failure = "";
  if (visible) {
    const [download] = await Promise.all([page.waitForEvent("download"), button.click()]);
    filename = download.suggestedFilename();
    failure = await download.failure() || "";
  }
  results.push({ asset, visible, filename, failure });
}

await page.goto(`${baseUrl}/results.html?asset=icp&recordId=${recordId}`, { waitUntil: "networkidle" });
const visibleWorkbookCount = (selector) => page.locator(selector).evaluateAll((elements) => elements.filter((element) => {
  const style = window.getComputedStyle(element);
  return !element.hidden && style.display !== "none" && style.visibility !== "hidden";
}).length);
const workbookOnIcp = await visibleWorkbookCount('button[aria-label="Download Validation Workbook"]');
await page.goto(`${baseUrl}/results.html?asset=active&recordId=${recordId}`, { waitUntil: "networkidle" });
const workLink = page.getByRole("link", { name: "Work on this action" }).first();
await workLink.click();
await page.waitForLoadState("networkidle");
const workbookInActionRunner = await visibleWorkbookCount('button[aria-label="Download Validation Workbook"]');

await browser.close();
console.log(JSON.stringify({ results, workbookOnIcp, workbookInActionRunner, errors }, null, 2));
if (results.some((result) => !result.visible || !/\.xlsx$/i.test(result.filename) || result.failure) || workbookOnIcp || workbookInActionRunner || errors.length) process.exitCode = 1;
