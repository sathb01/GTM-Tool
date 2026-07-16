import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const recordId = "qa-pre-dtc-pawpath-20260712-full-20260714";
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const context = await browser.newContext({ viewport: { width: 1440, height: 760 } });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
const response = await page.goto(`${baseUrl}/index.html?section=preRevenueContext&recordId=${recordId}`, { waitUntil: "networkidle" });
const desktop = await page.evaluate(() => {
  const nav = document.querySelector("#sectionNav");
  const intakeBox = nav.querySelector(".nav-intake-box");
  const assetsBox = nav.querySelector(".nav-assets-box");
  const groupList = nav.querySelector(".nav-group-list");
  const groups = [...nav.querySelectorAll(".nav-section-group")];
  const foundation = groups.find((item) => item.dataset.navGroup === "Foundation");
  const validation = groups.find((item) => item.dataset.navGroup === "Validation");
  foundation.open = true;
  const foundationLinks = [...foundation.querySelectorAll("a")].map((item) => item.textContent.trim());
  const beforeTop = intakeBox.getBoundingClientRect().top;
  groupList.scrollTop = groupList.scrollHeight;
  const afterTop = intakeBox.getBoundingClientRect().top;
  return {
    foundationLinks,
    groups: groups.map((item) => item.dataset.navGroup),
    validationOpenByDefault: validation.open,
    separateBoxes: Boolean(intakeBox && assetsBox && assetsBox.getBoundingClientRect().top > intakeBox.getBoundingClientRect().top),
    assetsOpenByDefault: assetsBox.open,
    assetsOutsideIntake: !intakeBox.contains(assetsBox),
    independentlyScrollable: groupList.scrollHeight > groupList.clientHeight && groupList.scrollTop > 0,
    intakeBoxStayedPinned: Math.abs(beforeTop - afterTop) < 1,
    navOverflow: getComputedStyle(nav).overflow,
    scrollOverflow: getComputedStyle(groupList).overflowY
  };
});
await page.setViewportSize({ width: 760, height: 900 });
const mobile = await page.evaluate(() => ({
  navDisplay: getComputedStyle(document.querySelector("#sectionNav")).display,
  navHeight: getComputedStyle(document.querySelector("#sectionNav")).height,
  scrollOverflow: getComputedStyle(document.querySelector(".nav-group-list")).overflowY
}));
const postPage = await context.newPage();
postPage.on("pageerror", (error) => errors.push(error.message));
await postPage.goto(`${baseUrl}/index.html?focus=pipeline&review=revenue&recordId=qa-post-b2b-forgeline-20260712-full-20260714#pipeline`, { waitUntil: "networkidle" });
const postRevenue = await postPage.evaluate(() => ({
  groups: [...document.querySelectorAll(".nav-section-group")].map((item) => item.dataset.navGroup),
  openGroups: [...document.querySelectorAll(".nav-section-group[open]")].map((item) => item.dataset.navGroup),
  separateAssets: Boolean(document.querySelector("#sectionNav > .nav-assets-box"))
}));
const result = { status: response?.status(), desktop, mobile, postRevenue, errors };
console.log(JSON.stringify(result, null, 2));
await browser.close();
if (result.status !== 200 || !desktop.foundationLinks.includes("Company Information") || !desktop.groups.includes("Validation") || !desktop.validationOpenByDefault || !desktop.separateBoxes || !desktop.assetsOpenByDefault || !desktop.assetsOutsideIntake || !desktop.independentlyScrollable || !desktop.intakeBoxStayedPinned || desktop.scrollOverflow !== "auto" || mobile.navDisplay !== "block" || mobile.scrollOverflow !== "visible" || !["Foundation", "Strategy", "Execution"].every((group) => postRevenue.groups.includes(group)) || !postRevenue.openGroups.includes("Execution") || !postRevenue.separateAssets || errors.length) process.exitCode = 1;
