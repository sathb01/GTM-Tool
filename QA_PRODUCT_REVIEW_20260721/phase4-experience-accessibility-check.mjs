import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const cookie = process.env.GTM_QA_COOKIE || "";
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
await page.route("**/api/records/**", async (route) => {
  if (route.request().method() === "PUT") {
    await route.abort();
    return;
  }
  await route.continue();
});

const profiles = [
  { id: "qa2-pre-dtc-nesttrail-20260721", section: "preRevenueContext" },
  { id: "qa2-pre-saas-queuepilot-20260721", section: "preRevenueContext" },
  { id: "qa2-post-mixed-fieldsip-20260721", section: "offer" },
  { id: "qa2-post-saas-renewalgrid-20260721", section: "offer" }
];
const results = [];

function failuresFor(checks) {
  return Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
}

try {
  for (const profile of profiles) {
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto(`${baseUrl}/index.html?section=${profile.section}&recordId=${encodeURIComponent(profile.id)}#${profile.section}`, { waitUntil: "load" });
    await page.waitForSelector(`#sections > section#${profile.section} .multi-select-dropdown`, { state: "visible", timeout: 20000 });
    const trigger = page.locator(`#sections > section#${profile.section} .multi-select-trigger`).first();
    const controlsId = await trigger.getAttribute("aria-controls");
    const semantics = await page.evaluate((panelId) => {
      const panel = document.getElementById(panelId);
      const triggerElement = document.querySelector(`[aria-controls="${CSS.escape(panelId)}"]`);
      return {
        panelExists: Boolean(panel),
        panelRole: panel?.getAttribute("role") || "",
        panelLabel: panel?.getAttribute("aria-label") || "",
        hasPopup: triggerElement?.getAttribute("aria-haspopup") || ""
      };
    }, controlsId);

    await trigger.focus();
    const focusStyle = await trigger.evaluate((element) => {
      const style = getComputedStyle(element);
      return { width: style.outlineWidth, style: style.outlineStyle, color: style.outlineColor };
    });
    await trigger.press("ArrowDown");
    const opened = await page.evaluate((panelId) => {
      const panel = document.getElementById(panelId);
      return {
        expanded: document.querySelector(`[aria-controls="${CSS.escape(panelId)}"]`)?.getAttribute("aria-expanded"),
        hidden: panel?.hidden,
        focusedCheckbox: document.activeElement?.matches?.(`#${CSS.escape(panelId)} input[type="checkbox"]`) || false,
        focusedValue: document.activeElement?.value || ""
      };
    }, controlsId);
    await page.keyboard.press("ArrowDown");
    const movedValue = await page.evaluate(() => document.activeElement?.value || "");
    await page.keyboard.press("Escape");
    const closed = await page.evaluate((panelId) => {
      const triggerElement = document.querySelector(`[aria-controls="${CSS.escape(panelId)}"]`);
      return {
        expanded: triggerElement?.getAttribute("aria-expanded"),
        hidden: document.getElementById(panelId)?.hidden,
        focusReturned: document.activeElement === triggerElement
      };
    }, controlsId);

    const statusState = await page.evaluate(() => {
      const status = document.getElementById("saveStatus");
      window.GTM_UI_FEEDBACK.setStatus(status, "Company saved.");
      const success = {
        role: status.getAttribute("role"),
        live: status.getAttribute("aria-live"),
        state: status.dataset.uiState
      };
      window.GTM_UI_FEEDBACK.setStatus(status, "The company could not be saved.");
      return { success, errorState: status.dataset.uiState };
    });
    const intakeAccessibility = await page.evaluate(() => {
      const visible = (element) => {
        const style = getComputedStyle(element);
        const rect = element.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
      };
      const hasName = (element) => {
        const aria = element.getAttribute("aria-label") || element.getAttribute("aria-labelledby");
        const label = element.id ? document.querySelector(`label[for="${CSS.escape(element.id)}"]`) : null;
        const wrappingLabel = element.closest("label");
        return Boolean(aria || label?.textContent.trim() || wrappingLabel?.textContent.trim() || element.title || element.textContent.trim());
      };
      const ids = Array.from(document.querySelectorAll("[id]")).map((element) => element.id);
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
      const controlsWithoutNames = Array.from(document.querySelectorAll("button, a[href], input, select, textarea"))
        .filter(visible)
        .filter((element) => !hasName(element));
      const groupList = document.querySelector(".nav-group-list");
      let navigationCanScroll = Boolean(groupList && ["auto", "scroll"].includes(getComputedStyle(groupList).overflowY));
      if (navigationCanScroll && groupList.scrollHeight > groupList.clientHeight) {
        groupList.scrollTop = 20;
        navigationCanScroll = groupList.scrollTop > 0;
        groupList.scrollTop = 0;
      }
      return {
        duplicateIds: new Set(duplicateIds).size,
        controlsWithoutNames: controlsWithoutNames.length,
        hasPageHeading: Boolean(document.querySelector("h1")),
        progressText: document.querySelector(".section-progress-text")?.textContent.trim() || "",
        nextActionText: document.querySelector(".section-navigation-actions button:last-child")?.textContent.trim() || "",
        navigationCanScroll
      };
    });

    await page.goto(`${baseUrl}/index.html?recordId=${encodeURIComponent(profile.id)}`, { waitUntil: "load" });
    await page.waitForFunction((sectionId) => document.querySelector("#sections > section")?.id === sectionId, profile.section, { timeout: 20000 });
    const restoredSection = await page.locator("#sections > section").first().getAttribute("id");
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseUrl}/index.html?section=${profile.section}&recordId=${encodeURIComponent(profile.id)}#${profile.section}`, { waitUntil: "load" });
    await page.waitForSelector(".nav-intake-summary", { state: "visible", timeout: 20000 });
    const compactNavigation = await page.evaluate((sectionId) => {
      const intake = document.querySelector(".nav-intake-box");
      const assets = document.querySelector(".nav-assets-box");
      const summary = document.querySelector(".nav-intake-summary");
      const heading = document.querySelector(`#sections > section#${CSS.escape(sectionId)} h2`);
      return {
        intakeOpen: intake?.open,
        assetsOpen: assets?.open,
        summaryText: summary?.textContent.trim() || "",
        headingExists: Boolean(heading)
      };
    }, profile.section);

    const checks = {
      multiSelectHasProgrammaticRelationship: Boolean(controlsId && semantics.panelExists && semantics.panelRole === "group" && semantics.panelLabel && semantics.hasPopup === "true"),
      arrowDownOpensAndFocusesOption: opened.expanded === "true" && opened.hidden === false && opened.focusedCheckbox,
      arrowKeysMoveBetweenOptions: Boolean(opened.focusedValue && movedValue && opened.focusedValue !== movedValue),
      escapeClosesAndReturnsFocus: closed.expanded === "false" && closed.hidden === true && closed.focusReturned,
      focusIndicatorIsVisible: parseFloat(focusStyle.width) >= 3 && focusStyle.style !== "none",
      statusRegionIsAccessible: statusState.success.role === "status" && statusState.success.live === "polite",
      feedbackStatesAreConsistent: statusState.success.state === "success" && statusState.errorState === "error",
      sectionStateSurvivesRefresh: restoredSection === profile.section,
      noDuplicateIds: intakeAccessibility.duplicateIds === 0,
      visibleControlsHaveNames: intakeAccessibility.controlsWithoutNames === 0,
      sectionContextIsImmediate: intakeAccessibility.hasPageHeading && /^Step \d+ of \d+$/.test(intakeAccessibility.progressText) && Boolean(intakeAccessibility.nextActionText),
      desktopNavigationScrollsIndependently: intakeAccessibility.navigationCanScroll,
      mobileNavigationIsCompact: compactNavigation.intakeOpen === false && compactNavigation.assetsOpen === false,
      mobileSummaryNamesCurrentLocation: compactNavigation.headingExists && compactNavigation.summaryText.includes("Step") && compactNavigation.summaryText.length > 12
    };
    results.push({ profile: profile.id, area: "intake", checks, failures: failuresFor(checks) });
  }

  for (const profile of profiles) {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseUrl}/results.html?asset=gtm&recordId=${encodeURIComponent(profile.id)}`, { waitUntil: "load" });
    await page.waitForFunction(() => window.GTM_CURRENT_ASSET_CONTRACT?.asset === "gtm", null, { timeout: 20000 });
    const responsive = await page.evaluate(() => {
      const viewportWidth = document.documentElement.clientWidth;
      const textElements = Array.from(document.querySelectorAll("main h1, main h2, main h3, main p, main a, main button"))
        .filter((element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
        });
      const clippedText = textElements.filter((element) => element.scrollWidth > element.clientWidth + 2 && getComputedStyle(element).overflowX === "hidden");
      const visibleControls = Array.from(document.querySelectorAll(".app-top-nav a, .app-top-nav button, .report-file-actions a, .report-file-actions button"))
        .filter((element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
        })
        .map((element) => element.getBoundingClientRect());
      const overlap = visibleControls.some((first, index) => visibleControls.slice(index + 1).some((second) => (
        first.left < second.right
        && first.right > second.left
        && first.top < second.bottom
        && first.bottom > second.top
      )));
      const ids = Array.from(document.querySelectorAll("[id]")).map((element) => element.id);
      const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
      const unnamedControls = Array.from(document.querySelectorAll("button, a[href], input, select, textarea"))
        .filter((element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
        })
        .filter((element) => {
          const label = element.id ? document.querySelector(`label[for="${CSS.escape(element.id)}"]`) : null;
          return !(element.getAttribute("aria-label")
            || element.getAttribute("aria-labelledby")
            || label?.textContent.trim()
            || element.closest("label")?.textContent.trim()
            || element.title
            || element.textContent.trim());
        });
      return {
        horizontalPageOverflow: document.documentElement.scrollWidth > viewportWidth + 2,
        clippedText: clippedText.length,
        overlappingControls: overlap,
        currentSectionNavVisible: getComputedStyle(document.getElementById("currentSectionNav")).display !== "none",
        duplicateIds: new Set(duplicateIds).size,
        unnamedControls: unnamedControls.length
      };
    });
    const checks = {
      noHorizontalPageOverflow: !responsive.horizontalPageOverflow,
      noClippedVisibleText: responsive.clippedText === 0,
      actionControlsDoNotOverlap: !responsive.overlappingControls,
      redundantSamePageNavigationRemoved: !responsive.currentSectionNavVisible,
      noDuplicateIds: responsive.duplicateIds === 0,
      visibleControlsHaveNames: responsive.unnamedControls === 0
    };
    results.push({ profile: profile.id, area: "narrow-plan", checks, failures: failuresFor(checks) });
  }

  const failures = results.flatMap((result) => result.failures.map((failure) => `${result.profile} / ${result.area}: ${failure}`));
  const checks = results.reduce((count, result) => count + Object.keys(result.checks).length, 0);
  console.log(JSON.stringify({
    checks,
    passed: checks - failures.length,
    failed: failures.length,
    failures,
    pageErrors,
    results
  }, null, 2));
  if (failures.length || pageErrors.length) process.exitCode = 1;
} finally {
  await context.close();
  await browser.close();
}
