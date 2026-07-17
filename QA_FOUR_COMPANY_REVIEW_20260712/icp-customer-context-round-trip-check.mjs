import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const recordId = "qa-post-b2b-forgeline-20260712-full-20260714";
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
  fieldPresent: Boolean(document.getElementById("customerContextStarter"))
}));

await page.getByRole("link", { name: "Return Without Saving" }).click();
await page.waitForLoadState("networkidle");
await page.waitForTimeout(120);
const returned = await page.evaluate(() => ({
  path: window.location.pathname,
  hash: window.location.hash,
  scrollY: Math.round(window.scrollY),
  noticePresent: Boolean(document.getElementById("improvementReturnNotice"))
}));

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
  || !/results\.html$/.test(returned.path)
  || returned.hash !== "#icp-brief"
  || Math.abs(returned.scrollY - originScroll) > 120
  || returned.noticePresent
  || pageCount !== 1
  || errors.length
) process.exitCode = 1;
