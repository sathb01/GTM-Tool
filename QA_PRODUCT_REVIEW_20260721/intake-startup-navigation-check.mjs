import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const contextOptions = { viewport: { width: 1440, height: 900 }, ...(process.env.GTM_QA_COOKIE ? { extraHTTPHeaders: { Cookie: process.env.GTM_QA_COOKIE } } : {}) };
const recordId = "qa2-post-mixed-fieldsip-20260721";
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const results = [];

try {
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  const activeSection = () => page.locator("#sections > section").getAttribute("id");
  const waitForSection = (sectionId) => page.waitForFunction(
    (expected) => document.querySelector("#sections > section")?.id === expected,
    sectionId,
    { timeout: 15000 }
  );

  await page.goto(`${baseUrl}/index.html?section=quickIcp&recordId=${recordId}#quickIcp`, { waitUntil: "load" });
  await waitForSection("quickIcp");
  results.push({ check: "explicit company section opens", expected: "quickIcp", actual: await activeSection() });

  await page.goto(`${baseUrl}/index.html`, { waitUntil: "load" });
  await waitForSection("company");
  results.push({ check: "fresh general URL starts at company information", expected: "company", actual: await activeSection() });

  await page.goto(`${baseUrl}/index.html?section=quickIcp&recordId=${recordId}#quickIcp`, { waitUntil: "load" });
  await waitForSection("quickIcp");
  await page.reload({ waitUntil: "load" });
  await waitForSection("quickIcp");
  results.push({ check: "refresh preserves the current section", expected: "quickIcp", actual: await activeSection() });
  await context.close();
} finally {
  await browser.close();
}

const failures = results.filter((result) => result.actual !== result.expected);
console.log(JSON.stringify({ checks: results.length, passed: results.length - failures.length, failed: failures.length, results }, null, 2));
if (failures.length) process.exitCode = 1;
