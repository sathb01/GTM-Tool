import { createRequire } from "node:module";
import { qaProfiles } from "./company-profiles.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const contextOptions = { viewport: { width: 1440, height: 900 }, ...(process.env.GTM_QA_COOKIE ? { extraHTTPHeaders: { Cookie: process.env.GTM_QA_COOKIE } } : {}) };
const selectedProfiles = process.env.GTM_QA_PROFILE
  ? qaProfiles.filter((profile) => profile.key === process.env.GTM_QA_PROFILE)
  : qaProfiles;

const intakeSections = {
  preRevenue: ["company", "preRevenueContext", "preRevenueHypotheses", "preRevenueProblem", "preRevenueWedge", "preRevenueBuyerDiscovery", "preRevenueValidationMotion", "preRevenueEvidenceTracker"],
  postRevenue: ["company", "executiveQuickReview", "quickIcp", "goals", "traction", "personas", "offer", "signals", "pipeline"]
};

const commonAssets = [
  ["active", "#active-plan-objective"],
  ["icp", "#icp-brief, #draft-icp"],
  ["personas", "#persona-overview"],
  ["messaging", "#messaging-workspace"],
  ["targets", "#target-list-workspace"],
  ["proof-assets", "#proof-asset-workspace"],
  ["outreach", "#outreach-sequence-workspace"],
  ["weekly-review", "#weekly-review-workspace"]
];

function assetsFor(profile) {
  return profile.mode === "preRevenue"
    ? [["gtm", "#draft-icp"], ["validation", "#plan-decision"], ["validation-workspace", "#validation-workspace-overview"], ...commonAssets]
    : [["gtm", "#decision-summary"], ["health", "#plan-health-dashboard"], ["reconciliation", "#evidence-reconciliation-workspace"], ...commonAssets];
}

const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const checks = [];

async function inspectPage(page, expectedSelector, expectedCompany, expectedRecordId) {
  return page.evaluate(({ expectedSelector, expectedCompany, expectedRecordId }) => {
    const visible = (element) => {
      if (!element) return false;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    const controls = Array.from(document.querySelectorAll("button, a")).filter(visible);
    const texts = Array.from(document.querySelectorAll("p, h1, h2, h3, li, label")).filter(visible);
    const overlap = (a, b) => {
      const first = a.getBoundingClientRect();
      const second = b.getBoundingClientRect();
      const width = Math.min(first.right, second.right) - Math.max(first.left, second.left);
      const height = Math.min(first.bottom, second.bottom) - Math.max(first.top, second.top);
      if (width <= 4 || height <= 4) return false;
      const intersectionArea = width * height;
      const smallerArea = Math.min(first.width * first.height, second.width * second.height);
      if (smallerArea <= 0 || intersectionArea / smallerArea < 0.25) return false;
      const x = Math.max(first.left, second.left) + width / 2;
      const y = Math.max(first.top, second.top) + height / 2;
      const stack = document.elementsFromPoint(x, y);
      const controlIndex = stack.findIndex((element) => element === a || a.contains(element));
      const textIndex = stack.findIndex((element) => element === b || b.contains(element));
      return controlIndex >= 0 && textIndex >= 0 && controlIndex < textIndex;
    };
    const overlaps = [];
    controls.forEach((control) => texts.forEach((text) => {
      if (control.contains(text) || text.contains(control) || control.closest("section") !== text.closest("section")) return;
      const componentSelector = ".field-example, .multi-select-dropdown, .repeatable-item, .card-actions, .active-plan-link-row";
      const controlComponent = control.closest(componentSelector);
      if (controlComponent && controlComponent === text.closest(componentSelector)) return;
      if (overlap(control, text)) overlaps.push(`${control.textContent.trim().slice(0, 40)} <> ${text.textContent.trim().slice(0, 60)}`);
    }));
    const mainText = document.querySelector("main")?.innerText || document.body.innerText || "";
    const companyInputValue = document.querySelector('[name="companyName"]')?.value || "";
    return {
      expectedVisible: visible(document.querySelector(expectedSelector)),
      companyVisible: mainText.includes(expectedCompany) || companyInputValue === expectedCompany,
      recordCorrect: localStorage.getItem("gtmReadinessIntake:activeRecordId") === expectedRecordId,
      mainTextLength: mainText.length,
      mainTextPreview: mainText.slice(0, 1000),
      blankOrFailed: /report failed to render|page failed to render|something went wrong|undefined|null|\[object object\]/i.test(mainText),
      internalLogicVisible: /Rule used:|confidenceCompletenessScore|plannedExecutionScore|uncertaintyPenalty|possibleCustomerGroups__|offerPortfolio__|revenueMotionPortfolio__|activePlanWeeklyWorkspace/i.test(mainText),
      accent: getComputedStyle(document.documentElement).getPropertyValue("--accent").trim(),
      font: getComputedStyle(document.body).fontFamily,
      activeSection: document.querySelector("#sections > section")?.id || "",
      overlaps: [...new Set(overlaps)].slice(0, 10)
    };
  }, { expectedSelector, expectedCompany, expectedRecordId });
}

try {
  for (const profile of selectedProfiles) {
    for (const section of intakeSections[profile.mode]) {
      const context = await browser.newContext(contextOptions);
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error" && /TypeError|ReferenceError|SyntaxError|failed to render/i.test(message.text())) errors.push(message.text());
      });
      const response = await page.goto(`${baseUrl}/index.html?section=${section}&recordId=${profile.id}#${section}`, { waitUntil: "load" });
      let sectionWaitError = "";
      try {
        await page.waitForSelector(`#${section}`, { timeout: 15000 });
      } catch (error) {
        sectionWaitError = error.message;
      }
      const state = await inspectPage(page, `#${section}`, profile.name, profile.id);
      if (sectionWaitError) errors.push(sectionWaitError);
      const url = new URL(page.url());
      const passed = response?.status() === 200 && state.expectedVisible && state.recordCorrect && state.mainTextLength > 300 && !state.blankOrFailed && !state.internalLogicVisible && state.overlaps.length === 0 && errors.length === 0 && (url.searchParams.get("section") === section || url.hash === `#${section}`);
      checks.push({ profile: profile.key, type: "intake", section, passed, status: response?.status(), ...state, errors });
      await context.close();
    }

    for (const [asset, selector] of assetsFor(profile)) {
      const context = await browser.newContext(contextOptions);
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error" && /TypeError|ReferenceError|SyntaxError|failed to render/i.test(message.text())) errors.push(message.text());
      });
      const response = await page.goto(`${baseUrl}/results.html?v=20260722-product-review&asset=${asset}&recordId=${profile.id}`, { waitUntil: "load" });
      await page.waitForSelector(selector, { timeout: 15000 });
      await page.waitForFunction(
        (expectedCompany) => (document.querySelector("main")?.innerText || document.body.innerText || "").includes(expectedCompany),
        profile.name,
        { timeout: 15000 }
      );
      const state = await inspectPage(page, selector, profile.name, profile.id);
      const passed = response?.status() === 200 && state.expectedVisible && state.companyVisible && state.mainTextLength > 300 && !state.blankOrFailed && !state.internalLogicVisible && state.overlaps.length === 0 && errors.length === 0 && state.accent === "#ff7a59" && /Source Sans|Segoe UI|Inter/i.test(state.font);
      checks.push({ profile: profile.key, type: "asset", asset, passed, status: response?.status(), ...state, errors });
      await context.close();
    }
  }
} finally {
  await browser.close();
}

const failures = checks.filter((check) => !check.passed);
const result = {
  generatedAt: new Date().toISOString(),
  baseUrl,
  checks: checks.length,
  passed: checks.length - failures.length,
  failed: failures.length,
  failures
};

console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;
