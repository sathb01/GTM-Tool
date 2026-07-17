import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const recordId = "qa-post-b2b-forgeline-20260712-full-20260714";
const originalPayload = await fetch(`${baseUrl}/api/records/${recordId}`).then((response) => response.json());
const originalRecord = originalPayload.record;
const testAnswer = "QA temporary customer context: specialty manufacturing operations leaders with urgent throughput constraints and limited internal improvement capacity.";
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

await page.goto(`${baseUrl}/results.html?asset=icp&recordId=${recordId}`, { waitUntil: "networkidle" });
const improveButton = page.getByRole("button", { name: "Improve This Section" });
const buttonVisible = await improveButton.isVisible();
await improveButton.scrollIntoViewIfNeeded();
const originScroll = await improveButton.evaluate(() => Math.round(window.scrollY));
await improveButton.click();
await page.waitForLoadState("networkidle");

const intake = await page.evaluate(() => ({
  path: window.location.pathname,
  focus: new URLSearchParams(window.location.search).get("focus"),
  task: new URLSearchParams(window.location.search).get("task"),
  returnTo: new URLSearchParams(window.location.search).get("returnTo") || "",
  heading: document.querySelector(".improvement-focus h3")?.textContent.trim() || "",
  saveLabel: [...document.querySelectorAll(".improvement-focus button")].map((button) => button.textContent.trim()).find((label) => label === "Save Changes and Return") || "",
  returnLabel: document.querySelector(".improvement-focus a")?.textContent.trim() || "",
  fieldPresent: Boolean(document.getElementById("customerContextStarter")),
  fieldInsideGuidance: Boolean(document.querySelector('.improvement-focus [data-field-id="customerContextStarter"]')),
  exampleBeforeInput: (() => {
    const field = document.querySelector('.improvement-focus [data-field-id="customerContextStarter"]');
    const example = field?.querySelector(".field-example");
    const input = field?.querySelector("textarea");
    return Boolean(example && input && (example.compareDocumentPosition(input) & Node.DOCUMENT_POSITION_FOLLOWING));
  })(),
  redundantReturnCopy: /Return to:/i.test(document.querySelector(".improvement-focus")?.textContent || ""),
  genericAdviceLists: document.querySelectorAll(".improvement-focus > ul, .improvement-focus > ol").length
}));

await page.locator("#customerContextStarter").fill(testAnswer);
await page.getByRole("button", { name: "Save Changes and Return" }).click();
await page.waitForURL((url) => /results\.html$/.test(url.pathname), { timeout: 10000 });
await page.locator("#improvementReturnNotice").waitFor({ state: "visible", timeout: 10000 });
await page.waitForTimeout(120);
const returned = await page.evaluate(() => ({
  path: window.location.pathname,
  hash: window.location.hash,
  scrollY: Math.round(window.scrollY),
  noticePresent: Boolean(document.getElementById("improvementReturnNotice")),
  customerContext: [...document.querySelectorAll("#icp-brief .field")].find((field) => field.querySelector("h3")?.textContent.trim() === "Customer context starter")?.textContent || ""
}));

await fetch(`${baseUrl}/api/records/${recordId}`, {
  method: "PUT",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(originalRecord)
});

const pageCount = context.pages().length;
await browser.close();
console.log(JSON.stringify({ buttonVisible, originScroll, intake, returned, pageCount, errors }, null, 2));

if (
  !buttonVisible
  || !/index\.html$/.test(intake.path)
  || intake.focus !== "quickIcp"
  || intake.task !== "customer-context"
  || !intake.returnTo.includes("results.html")
  || !intake.returnTo.includes("#icp-brief")
  || !/^Improving: ICP customer context/.test(intake.heading)
  || intake.saveLabel !== "Save Changes and Return"
  || intake.returnLabel !== "Return Without Saving"
  || !intake.fieldPresent
  || !intake.fieldInsideGuidance
  || !intake.exampleBeforeInput
  || intake.redundantReturnCopy
  || intake.genericAdviceLists
  || !/results\.html$/.test(returned.path)
  || returned.hash !== "#icp-brief"
  || Math.abs(returned.scrollY - originScroll) > 120
  || !returned.noticePresent
  || !returned.customerContext.includes(testAnswer)
  || pageCount !== 1
  || errors.length
) process.exitCode = 1;
