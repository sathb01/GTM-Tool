import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const recordId = "qa3-post-saas-clientrenew-20260724";
const cookie = String(process.env.GTM_QA_COOKIE || "").trim();
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const checks = [];
const check = (name, passed, detail = "") => checks.push({ name, passed: Boolean(passed), ...(detail ? { detail } : {}) });

async function inspect(viewport) {
  const context = await browser.newContext({
    viewport,
    ...(cookie ? { extraHTTPHeaders: { Cookie: cookie } } : {})
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(`${baseUrl}/results.html?v=target-criteria-layout&asset=targets&recordId=${recordId}`, { waitUntil: "load" });
  await page.waitForSelector("#targetSearchCriteriaEditor", { state: "attached", timeout: 15000 });
  await page.locator("#targetSearchCriteriaEditor").evaluate((details) => { details.open = true; });
  await page.waitForSelector("#targetDiscoveryCategories", { state: "visible", timeout: 15000 });
  const state = await page.evaluate(() => {
    const rect = (selector) => {
      const box = document.querySelector(selector)?.getBoundingClientRect();
      return box ? { left: box.left, right: box.right, top: box.top, bottom: box.bottom, width: box.width, height: box.height } : null;
    };
    const columnCount = (selector) => getComputedStyle(document.querySelector(selector)).gridTemplateColumns.split(/\s+/).filter(Boolean).length;
    const pairs = [
      ["#targetDiscoveryCategories", "#targetDiscoveryGeography"],
      ["#targetDiscoveryEmployeeMin", "#targetDiscoveryEmployeeMax"],
      ["#targetDiscoveryTechnology", "#targetDiscoveryService"],
      ["#targetDiscoveryTeam", "#targetDiscoveryReferralPaths"],
      ["#targetDiscoveryBatchSize", "#targetDiscoveryInitialTarget"]
    ];
    const controls = [...document.querySelectorAll(".target-search-criteria-grid input, .target-search-criteria-grid textarea")];
    const pairOffsets = pairs.map(([first, second]) => Math.abs(rect(first).top - rect(second).top));
    const summaryCards = [...document.querySelectorAll(".target-search-brief .messaging-result-card")].map((card) => {
      const box = card.getBoundingClientRect();
      return { left: box.left, top: box.top, width: box.width, height: box.height };
    });
    const grid = document.querySelector(".target-search-criteria-grid").getBoundingClientRect();
    return {
      summaryColumns: columnCount(".target-search-brief"),
      criteriaColumns: columnCount(".target-search-criteria-grid"),
      summaryCards,
      pairOffsets,
      textareaHeights: controls.filter((control) => control.tagName === "TEXTAREA").map((control) => control.getBoundingClientRect().height),
      inputHeights: controls.filter((control) => control.tagName === "INPUT").map((control) => control.getBoundingClientRect().height),
      exclusionWidth: rect("#targetDiscoveryExclusions").width,
      singleWidth: rect("#targetDiscoveryCategories").width,
      controlsInsideGrid: controls.every((control) => {
        const box = control.getBoundingClientRect();
        return box.left >= grid.left - 1 && box.right <= grid.right + 1;
      }),
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      errors: []
    };
  });
  state.errors = errors;
  await context.close();
  return state;
}

try {
  const desktop = await inspect({ width: 1440, height: 1000 });
  const mobile = await inspect({ width: 720, height: 1000 });
  const sameHeight = (values, tolerance = 2) => values.length > 1 && Math.max(...values) - Math.min(...values) <= tolerance;

  check("Desktop criteria summary uses two balanced columns", desktop.summaryColumns === 2 && desktop.summaryCards.length === 5, JSON.stringify(desktop.summaryCards));
  check("Odd final summary card spans the full row", desktop.summaryCards[4].width >= desktop.summaryCards[0].width * 1.9, JSON.stringify(desktop.summaryCards));
  check("Desktop answer controls align in matching pairs", desktop.criteriaColumns === 2 && desktop.pairOffsets.every((offset) => offset <= 2), JSON.stringify(desktop.pairOffsets));
  check("Textarea answer boxes use one consistent height", sameHeight(desktop.textareaHeights), JSON.stringify(desktop.textareaHeights));
  check("Compact answer boxes use one consistent height", sameHeight(desktop.inputHeights), JSON.stringify(desktop.inputHeights));
  check("Exclusion criteria spans both answer columns", desktop.exclusionWidth >= desktop.singleWidth * 1.9, JSON.stringify({ exclusion: desktop.exclusionWidth, single: desktop.singleWidth }));
  check("Desktop criteria stay within their layout", desktop.controlsInsideGrid && desktop.horizontalOverflow <= 1 && desktop.errors.length === 0, JSON.stringify(desktop));
  check("Narrow layout uses one aligned column", mobile.summaryColumns === 1 && mobile.criteriaColumns === 1 && mobile.controlsInsideGrid && mobile.horizontalOverflow <= 1 && mobile.errors.length === 0, JSON.stringify(mobile));
} finally {
  await browser.close();
}

const failures = checks.filter((item) => !item.passed);
console.log(JSON.stringify({ checks: checks.length, passed: checks.length - failures.length, failed: failures.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
