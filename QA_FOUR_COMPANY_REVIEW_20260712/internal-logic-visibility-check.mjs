import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const records = [
  { id: "qa-pre-dtc-pawpath-20260712-full-20260714", assets: ["gtm", "validation", "active", "health"] },
  { id: "qa-pre-retail-brightnest-20260712-full-20260714", assets: ["gtm", "validation", "active", "health"] },
  { id: "qa-post-b2b-forgeline-20260712-full-20260714", assets: ["gtm", "active", "health"] },
  { id: "qa-post-saas-relaymetrics-20260712-full-20260714", assets: ["gtm", "active", "health"] }
];
const forbidden = [
  /Asset Quality Control/i,
  /Assessment Input Confidence/i,
  /Evidence coverage:\s*\d+/i,
  /uncertainty adjustment/i,
  /Potential lift/i,
  /Rule used:/i,
  /Snapshot confidence/i,
  /score effect/i
];

const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const checks = [];

for (const record of records) {
  for (const asset of record.assets) {
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(`${baseUrl}/results.html?asset=${asset}&recordId=${record.id}`, { waitUntil: "networkidle" });
    const state = await page.evaluate(() => ({
      text: document.querySelector("main")?.innerText || "",
      reconciliationLinks: [...document.querySelectorAll("#reportToc a")].filter((item) => /Evidence Reconciliation/i.test(item.textContent)).length,
      internalNewTabs: [...document.querySelectorAll('a[target="_blank"]')].filter((item) => new URL(item.href, location.href).origin === location.origin).length
    }));
    const forbiddenMatches = forbidden.filter((pattern) => pattern.test(state.text)).map((pattern) => pattern.source);
    checks.push({
      recordId: record.id,
      asset,
      passed: response?.status() === 200 && forbiddenMatches.length === 0 && state.reconciliationLinks === 0 && state.internalNewTabs === 0 && errors.length === 0,
      forbiddenMatches,
      reconciliationLinks: state.reconciliationLinks,
      internalNewTabs: state.internalNewTabs,
      errors
    });
    await page.close();
  }
}

await browser.close();
const failures = checks.filter((item) => !item.passed);
console.log(JSON.stringify({ checks: checks.length, passed: checks.length - failures.length, failed: failures.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
