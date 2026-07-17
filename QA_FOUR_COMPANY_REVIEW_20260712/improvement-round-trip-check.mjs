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

await page.goto(`${baseUrl}/results.html?asset=gtm&recordId=${recordId}`, { waitUntil: "networkidle" });
const improveButton = page.getByRole("button", { name: "Improve This Section" }).first();
await improveButton.scrollIntoViewIfNeeded();
const origin = await improveButton.evaluate((button) => ({
  sectionId: button.closest("main > section")?.id || "",
  scrollY: Math.round(window.scrollY),
  scrollHeight: document.documentElement.scrollHeight
}));
await improveButton.click();
await page.waitForLoadState("networkidle");

const facilitation = await page.evaluate(() => ({
  path: window.location.pathname,
  journeyVisible: !document.getElementById("improvementJourney")?.hidden,
  improving: document.getElementById("improvementJourneyName")?.textContent.trim() || "",
  origin: document.getElementById("improvementJourneyOrigin")?.textContent.trim() || "",
  progress: document.getElementById("improvementJourneyProgress")?.textContent.trim() || "",
  saveLabel: document.getElementById("saveButton")?.textContent.trim() || "",
  returnLabel: document.getElementById("journeyReturnLink")?.textContent.trim() || "",
  returnTo: new URLSearchParams(window.location.search).get("returnTo") || ""
}));

await page.getByRole("button", { name: "Save Changes and Return" }).click();
await page.waitForLoadState("networkidle");
await page.waitForTimeout(760);
const returned = await page.evaluate(() => ({
  path: window.location.pathname,
  hash: window.location.hash,
  scrollY: Math.round(window.scrollY),
  scrollHeight: document.documentElement.scrollHeight,
  notice: document.getElementById("improvementReturnNotice")?.textContent.trim() || "",
  highlighted: document.querySelector("main > section.improvement-return-highlight")?.id || ""
}));

const secondImproveButton = page.getByRole("button", { name: "Improve This Section" }).first();
await secondImproveButton.scrollIntoViewIfNeeded();
const noSaveOrigin = await secondImproveButton.evaluate(() => Math.round(window.scrollY));
await secondImproveButton.click();
await page.waitForLoadState("networkidle");
await page.getByRole("link", { name: "Return Without Saving" }).first().click();
await page.waitForLoadState("networkidle");
await page.waitForTimeout(180);
const returnedWithoutSaving = await page.evaluate(() => ({
  path: window.location.pathname,
  hash: window.location.hash,
  scrollY: Math.round(window.scrollY),
  noticePresent: Boolean(document.getElementById("improvementReturnNotice"))
}));

const pageCount = context.pages().length;
await browser.close();
console.log(JSON.stringify({ origin, facilitation, returned, noSaveOrigin, returnedWithoutSaving, pageCount, errors }, null, 2));

if (
  !origin.sectionId
  || !/facilitation\.html$/.test(facilitation.path)
  || !facilitation.journeyVisible
  || !facilitation.improving
  || !facilitation.origin.startsWith("Return to:")
  || !/\d+ of \d+ questions answered/.test(facilitation.progress)
  || facilitation.saveLabel !== "Save Changes and Return"
  || facilitation.returnLabel !== "Return Without Saving"
  || !facilitation.returnTo.includes(`results.html`)
  || !facilitation.returnTo.includes(`#${origin.sectionId}`)
  || !/results\.html$/.test(returned.path)
  || returned.hash !== `#${origin.sectionId}`
  || !/Changes saved and the plan has been updated/.test(returned.notice)
  || returned.highlighted !== origin.sectionId
  || Math.abs(returned.scrollY - origin.scrollY) > 120
  || !/results\.html$/.test(returnedWithoutSaving.path)
  || returnedWithoutSaving.hash !== `#${origin.sectionId}`
  || Math.abs(returnedWithoutSaving.scrollY - noSaveOrigin) > 120
  || returnedWithoutSaving.noticePresent
  || pageCount !== 1
  || errors.length
) process.exitCode = 1;
