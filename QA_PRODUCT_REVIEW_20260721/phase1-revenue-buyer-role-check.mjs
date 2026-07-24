import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const cookie = process.env.GTM_QA_COOKIE || "";
const recordId = "qa3-post-saas-clientrenew-20260724";
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  ...(cookie ? { extraHTTPHeaders: { Cookie: cookie } } : {})
});
const page = await context.newPage();
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));

try {
  await page.goto(`${baseUrl}/index.html?v=20260723-revenue-buyer-roles&focus=pipeline&recordId=${recordId}#pipeline`, {
    waitUntil: "load"
  });
  await page.waitForSelector("#pipeline", { timeout: 15000 });
  await page.waitForFunction(() => {
    const selected = document.querySelector('[data-field-id="primaryRevenueMotion"] select')?.value || "";
    return Boolean(selected && document.querySelector(`[data-field-id="revenueMotionPortfolio__${CSS.escape(selected)}__primaryBuyer"] select`));
  }, null, { timeout: 30000 });

  const state = await page.evaluate(() => {
    const motionId = document.querySelector('[data-field-id="primaryRevenueMotion"] select')?.value || "";
    const primaryWrapper = document.querySelector(`[data-field-id="revenueMotionPortfolio__${CSS.escape(motionId)}__primaryBuyer"]`);
    const committeeWrapper = document.querySelector(`[data-field-id="revenueMotionPortfolio__${CSS.escape(motionId)}__buyingCommitteeRoles"]`);
    const primaryOptions = Array.from(primaryWrapper?.querySelectorAll("select option") || []).map((option) => option.textContent.trim());
    const committeeControl = committeeWrapper?.querySelector("[data-multi-select-dropdown]");
    const committeeOptions = Array.from(committeeControl?.querySelectorAll('.multi-select-dropdown-panel input[type="checkbox"]') || [])
      .map((input) => input.value);
    ["COO", "CFO"].forEach((value) => {
      const checkbox = Array.from(committeeControl?.querySelectorAll('input[type="checkbox"]') || [])
        .find((input) => input.value === value);
      if (checkbox) checkbox.checked = true;
    });
    committeeControl?.updateSummary?.();
    const selectedText = Array.from(committeeControl?.querySelectorAll(".multi-select-selected-text") || [])
      .map((item) => item.textContent.trim());
    const other = Array.from(committeeControl?.querySelectorAll('input[type="checkbox"]') || [])
      .find((input) => input.value === "Other");
    if (other) other.checked = true;
    committeeControl?.updateSummary?.();
    const otherInput = committeeControl?.querySelector('input[name$="__other"]');
    if (otherInput) otherInput.value = "Plant General Manager";
    committeeControl?.updateSummary?.();
    const selectedWithOther = Array.from(committeeControl?.querySelectorAll(".multi-select-selected-text") || [])
      .map((item) => item.textContent.trim());

    return {
      motionId,
      primaryOptions,
      committeeOptions,
      selectedText,
      selectedWithOther,
      otherVisible: Boolean(otherInput && !otherInput.closest(".other-field")?.hidden),
      otherRequired: Boolean(otherInput?.required)
    };
  });

  const checks = {
    activeMotionFound: Boolean(state.motionId),
    primaryIncludesCEO: state.primaryOptions.includes("CEO / Founder / Owner"),
    primaryIncludesCOO: state.primaryOptions.includes("COO"),
    primaryIncludesCFO: state.primaryOptions.includes("CFO"),
    primaryIncludesFunctionalLeaders: state.primaryOptions.includes("VP Operations / Head of Operations")
      && state.primaryOptions.includes("VP Sales / Head of Sales"),
    committeeUsesSameSpecificRoles: state.committeeOptions.includes("CEO / Founder / Owner")
      && state.committeeOptions.includes("COO")
      && state.committeeOptions.includes("CFO"),
    selectedRolesRemainVisible: state.selectedText.includes("COO") && state.selectedText.includes("CFO"),
    otherRequiresDefinition: state.otherVisible && state.otherRequired,
    otherDefinitionRemainsVisible: state.selectedWithOther.includes("Other: Plant General Manager"),
    noDuplicateOptions: new Set(state.primaryOptions.map((value) => value.toLowerCase())).size === state.primaryOptions.length,
    noPageErrors: pageErrors.length === 0
  };
  const failures = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
  console.log(JSON.stringify({
    checks: Object.keys(checks).length,
    passed: Object.keys(checks).length - failures.length,
    failed: failures.length,
    failures,
    state: {
      motionId: state.motionId,
      selectedText: state.selectedText,
      selectedWithOther: state.selectedWithOther
    },
    pageErrors
  }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await context.close();
  await browser.close();
}
