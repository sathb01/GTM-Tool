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
  const pinned = nav.querySelector(".nav-foundation");
  const scroll = nav.querySelector(".nav-scroll-area");
  const beforeTop = pinned.getBoundingClientRect().top;
  scroll.scrollTop = scroll.scrollHeight;
  const afterTop = pinned.getBoundingClientRect().top;
  return {
    foundationLinks: [...pinned.querySelectorAll("a")].map((item) => item.textContent.trim()),
    scrollGroups: [...scroll.querySelectorAll(".nav-group-label")].map((item) => item.textContent.trim()),
    assetsInScroll: Boolean(scroll.querySelector(".nav-assets")),
    assetsInFoundation: Boolean(pinned.querySelector(".nav-assets")),
    independentlyScrollable: scroll.scrollHeight > scroll.clientHeight && scroll.scrollTop > 0,
    foundationStayedPinned: Math.abs(beforeTop - afterTop) < 1,
    navOverflow: getComputedStyle(nav).overflow,
    scrollOverflow: getComputedStyle(scroll).overflowY
  };
});
await page.setViewportSize({ width: 760, height: 900 });
const mobile = await page.evaluate(() => ({
  navDisplay: getComputedStyle(document.querySelector("#sectionNav")).display,
  navHeight: getComputedStyle(document.querySelector("#sectionNav")).height,
  scrollOverflow: getComputedStyle(document.querySelector(".nav-scroll-area")).overflowY
}));
const result = { status: response?.status(), desktop, mobile, errors };
console.log(JSON.stringify(result, null, 2));
await browser.close();
if (result.status !== 200 || !desktop.foundationLinks.includes("Company Information") || !desktop.scrollGroups.includes("Validation") || !desktop.assetsInScroll || desktop.assetsInFoundation || !desktop.independentlyScrollable || !desktop.foundationStayedPinned || desktop.scrollOverflow !== "auto" || mobile.navDisplay !== "block" || mobile.scrollOverflow !== "visible" || errors.length) process.exitCode = 1;
