import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const recordId = "qa-post-b2b-forgeline-20260712-full-20260714";
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();
const errors = [];
const navigations = [];
page.on("pageerror", (error) => errors.push(error.message));
page.on("framenavigated", (frame) => { if (frame === page.mainFrame()) navigations.push(frame.url()); });

await page.goto(`${baseUrl}/results.html?asset=active&recordId=${recordId}`, { waitUntil: "networkidle" });
const workLink = page.getByRole("link", { name: "Work on this action" }).first();
await workLink.scrollIntoViewIfNeeded();
const origin = await workLink.evaluate((link) => ({
  sectionId: link.closest("main > section")?.id || "",
  scrollY: Math.round(window.scrollY)
}));
await workLink.click();
await page.waitForLoadState("networkidle");

const runner = await page.evaluate(() => ({
  path: window.location.pathname,
  action: new URLSearchParams(window.location.search).get("action"),
  returnTo: new URLSearchParams(window.location.search).get("actionReturnTo") || "",
  barVisible: Boolean(document.getElementById("active-action-return-bar")),
  workingOn: document.querySelector("#active-action-return-bar strong")?.textContent.trim() || "",
  origin: document.querySelector("#active-action-return-bar .workspace-return-bar-origin")?.textContent.trim() || "",
  saveLabel: document.getElementById("saveActionRunnerButton")?.textContent.trim() || "",
  returnLabel: document.getElementById("activeActionReturnWithoutSaving")?.textContent.trim() || ""
}));

await page.getByRole("button", { name: "Save Evidence and Return" }).click();
await page.waitForURL((url) => !url.searchParams.has("action"), { timeout: 10000 });
await page.locator("#improvementReturnNotice").waitFor({ state: "visible", timeout: 10000 });
await page.waitForTimeout(120);
const returned = await page.evaluate(() => ({
  path: window.location.pathname,
  hash: window.location.hash,
  scrollY: Math.round(window.scrollY),
  notice: document.getElementById("improvementReturnNotice")?.textContent.trim() || "",
  highlighted: document.querySelector("main > section.improvement-return-highlight")?.id || ""
}));

const secondWorkLink = page.getByRole("link", { name: "Work on this action" }).first();
await secondWorkLink.scrollIntoViewIfNeeded();
const noSaveOrigin = await secondWorkLink.evaluate(() => Math.round(window.scrollY));
await secondWorkLink.click();
await page.waitForLoadState("networkidle");
await page.getByRole("link", { name: "Return Without Saving" }).first().click();
await page.waitForURL((url) => !url.searchParams.has("action"), { timeout: 10000 });
await page.waitForTimeout(120);
const returnedWithoutSaving = await page.evaluate(() => ({
  path: window.location.pathname,
  hash: window.location.hash,
  scrollY: Math.round(window.scrollY),
  noticePresent: Boolean(document.getElementById("improvementReturnNotice"))
}));

const pageCount = context.pages().length;
await browser.close();
console.log(JSON.stringify({ origin, runner, returned, noSaveOrigin, returnedWithoutSaving, pageCount, navigations, errors }, null, 2));

if (
  !origin.sectionId
  || !/results\.html$/.test(runner.path)
  || !runner.action
  || !runner.returnTo.includes(`#${origin.sectionId}`)
  || !runner.barVisible
  || !runner.workingOn
  || !runner.origin.startsWith("Return to:")
  || runner.saveLabel !== "Save Evidence and Return"
  || runner.returnLabel !== "Return Without Saving"
  || returned.hash !== `#${origin.sectionId}`
  || Math.abs(returned.scrollY - origin.scrollY) > 120
  || !/Changes saved and the plan has been updated/.test(returned.notice)
  || returned.highlighted !== origin.sectionId
  || returnedWithoutSaving.hash !== `#${origin.sectionId}`
  || Math.abs(returnedWithoutSaving.scrollY - noSaveOrigin) > 120
  || returnedWithoutSaving.noticePresent
  || pageCount !== 1
  || errors.length
) process.exitCode = 1;
