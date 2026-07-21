import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const password = String(process.env.GTM_QA_PASSWORD || "");
const recordId = "qa-pre-retail-brightnest-20260712-full-20260714";
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
if (password) {
  const login = await context.request.post(`${baseUrl}/login`, { form: { password } });
  if (!login.ok()) throw new Error(`Login failed with status ${login.status()}.`);
}
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
await page.goto(`${baseUrl}/index.html?section=preRevenueHypotheses&recordId=${recordId}#preRevenueHypotheses`, { waitUntil: "networkidle" });
await page.evaluate(() => {
  localStorage.setItem("gtmReadinessIntake:improvementFocus", JSON.stringify({ sectionId: "preRevenueHypotheses", area: "Old review" }));
});
await page.click("#newCompanyButton");
await page.waitForURL(/index\.html\?new=1#company$/);
await page.waitForSelector("#company");
const result = await page.evaluate(() => ({
  url: `${location.pathname}${location.search}${location.hash}`,
  activeSection: document.querySelector("#sections > section")?.id || "",
  activeRecordId: localStorage.getItem("gtmReadinessIntake:activeRecordId") || "",
  improvementFocus: localStorage.getItem("gtmReadinessIntake:improvementFocus") || "",
  companyName: document.querySelector('[name="companyName"]')?.value || ""
}));
await browser.close();
console.log(JSON.stringify({ ...result, errors }, null, 2));
if (result.activeSection !== "company" || result.activeRecordId || result.improvementFocus || result.companyName || errors.length) process.exitCode = 1;
