import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const cookie = process.env.GTM_QA_COOKIE || "";
const qaTimeout = /^https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?$/i.test(baseUrl) ? 20000 : 60000;
const profiles = [
  "qa3-pre-dtc-roamready-20260724",
  "qa3-pre-saas-referralpath-20260724",
  "qa3-post-mixed-trailpour-20260724",
  "qa3-post-saas-clientrenew-20260724"
];
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
const results = [];
page.on("pageerror", (error) => pageErrors.push(error.message));

try {
  for (const recordId of profiles) {
    await page.goto(`${baseUrl}/results.html?asset=active&recordId=${encodeURIComponent(recordId)}`, { waitUntil: "load" });
    await page.waitForSelector("#active-plan-objective", { timeout: qaTimeout });
    const startWeek = page.locator("#startWeekOneButton");
    if (await startWeek.count()) {
      await page.evaluate(() => {
        document.querySelectorAll("[data-tool-setup-status]").forEach((control) => {
          control.value = "Ready";
          control.dispatchEvent(new Event("change", { bubbles: true }));
        });
      });
      await startWeek.click();
    }
    await page.waitForSelector("#active-plan-this-week", { timeout: qaTimeout });
    const activeState = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll("#reportToc a[data-asset]"));
      const priorities = Array.from(document.querySelectorAll("[data-weekly-priority]"));
      const workLinks = Array.from(document.querySelectorAll(".active-plan-task-resources a:not([data-keep-new-window='true'])"));
      const referenceLinks = Array.from(document.querySelectorAll(".active-plan-task-resources a[data-keep-new-window='true']"));
      const firstViewportBottom = window.innerHeight;
      return {
        groups: Array.from(document.querySelectorAll("#reportToc .toc-group-label")).map((item) => item.textContent.trim()),
        navLabels: links.map((link) => link.querySelector(".asset-nav-label")?.textContent.trim() || ""),
        planStatusInPrimaryNav: Boolean(document.querySelector('#reportToc a[data-asset="health"]')),
        thisWeekIsActive: document.querySelector('#reportToc a[data-asset="active"]')?.classList.contains("active") || false,
        companySetupLabel: document.getElementById("navIntakeBackLink")?.textContent.trim() || "",
        currentSectionNavHidden: document.getElementById("currentSectionNav")?.hidden
          || getComputedStyle(document.getElementById("currentSectionNav")).display === "none",
        setupComplete: /Tool Setup is complete/i.test(document.getElementById("active-plan-objective")?.innerText || ""),
        currentWorkVisible: Boolean(document.getElementById("active-plan-this-week")?.offsetParent),
        currentWorkInFirstViewport: (document.getElementById("active-plan-this-week")?.getBoundingClientRect().top || Infinity) < firstViewportBottom,
        priorityCount: priorities.length,
        prioritiesSelfContained: priorities.every((priority) => (
          /Use for this task/i.test(priority.innerText)
          && /What happened/i.test(priority.innerText)
          && /What did you learn/i.test(priority.innerText)
          && Boolean(priority.querySelector('[data-weekly-priority-field="status"]'))
          && Boolean(priority.querySelector('[data-weekly-priority-field="owner"]'))
          && Boolean(priority.querySelector('[data-weekly-priority-field="result"]'))
        )),
        outlookCollapsed: !document.querySelector("#active-plan-weeks > details.section-details")?.open,
        closeWeekCollapsed: !document.querySelector("#active-plan-review > details.section-details")?.open,
        referenceLinksUseSeparateWindow: referenceLinks.every((link) => link.target === "_blank"),
        workToolLinks: workLinks.map((link) => link.href)
      };
    });

    let toolReturnState = { applicable: false, returnBarVisible: true, returnHrefPointsToActive: true };
    if (activeState.workToolLinks.length) {
      toolReturnState.applicable = true;
      await page.goto(activeState.workToolLinks[0], { waitUntil: "load" });
      await page.waitForSelector("#planWorkReturnBar", { timeout: qaTimeout });
      toolReturnState = await page.evaluate(() => ({
        applicable: true,
        returnBarVisible: Boolean(document.getElementById("planWorkReturnBar")?.offsetParent),
        returnHrefPointsToActive: new URL(
          document.querySelector("#planWorkReturnBar a")?.href || "",
          window.location.href
        ).searchParams.get("asset") === "active"
      }));
    }

    await page.goto(`${baseUrl}/index.html?recordId=${encodeURIComponent(recordId)}`, { waitUntil: "load" });
    await page.waitForSelector(".nav-assets-box", { timeout: qaTimeout });
    const intakeState = await page.evaluate(() => ({
      summary: document.querySelector(".nav-assets-box > summary")?.textContent.trim() || "",
      groups: Array.from(document.querySelectorAll(".nav-assets-box .nav-asset-group-label")).map((item) => item.textContent.trim()),
      labels: Array.from(document.querySelectorAll(".nav-assets-box .nav-asset-link")).map((item) => item.textContent.trim()),
      staleNotices: document.querySelectorAll("[data-plan-update-notice]").length,
      returnLabel: document.getElementById("topResultsLink")?.textContent.trim() || "",
      returnAsset: new URL(document.getElementById("topResultsLink")?.href || "", window.location.href).searchParams.get("asset")
    }));

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${baseUrl}/results.html?asset=active&recordId=${encodeURIComponent(recordId)}`, { waitUntil: "load" });
    await page.waitForSelector("#active-plan-this-week", { timeout: qaTimeout });
    const mobileState = await page.evaluate(() => ({
      horizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
      clippedPriorityText: Array.from(document.querySelectorAll("[data-weekly-priority]")).some((card) => card.scrollWidth > card.clientWidth + 2),
      currentWorkVisible: Boolean(document.getElementById("active-plan-this-week")?.offsetParent),
      workspaceMenuVisible: Boolean(document.getElementById("workspaceNavToggle")?.offsetParent),
      workspaceMenuCollapsed: document.getElementById("workspaceNavBody")?.hidden === true
    }));
    await page.setViewportSize({ width: 1440, height: 1000 });

    const checks = {
      navigationUsesJobBasedGroups: ["Plan", "Reference Assets", "Work Tools"].every((group) => activeState.groups.includes(group)),
      planStatusIsNotACompetingDestination: !activeState.planStatusInPrimaryNav,
      thisWeekIsThePrimaryPlanWorkspace: activeState.thisWeekIsActive && activeState.navLabels[0] === "This Week",
      companySetupIsSecondaryAndClear: /Company Setup/i.test(activeState.companySetupLabel),
      redundantSamePageNavigationIsHidden: activeState.currentSectionNavHidden,
      toolSetupAndWorkAreImmediatelyClear: activeState.setupComplete
        && activeState.currentWorkVisible
        && activeState.currentWorkInFirstViewport,
      weeklyWorkIsLimitedAndSelfContained: activeState.priorityCount > 0
        && activeState.priorityCount <= 3
        && activeState.prioritiesSelfContained,
      futureAndCloseWorkStartQuiet: activeState.outlookCollapsed && activeState.closeWeekCollapsed,
      referencesCanStayBesideThePlan: activeState.referenceLinksUseSeparateWindow,
      workToolsProvideReturnToThisWeek: toolReturnState.returnBarVisible && toolReturnState.returnHrefPointsToActive,
      intakeNavigationUsesSameMentalModel: /Plan, Assets, and Tools/i.test(intakeState.summary)
        && ["Plan", "Reference Assets", "Work Tools"].every((group) => intakeState.groups.includes(group))
        && intakeState.labels[0] === "This Week"
        && !intakeState.labels.includes("Plan Status"),
      onlyOnePlanFreshnessNoticeExists: intakeState.staleNotices <= 1,
      startedPlanReturnsToCurrentWeek: intakeState.returnLabel === "Return to This Week"
        && intakeState.returnAsset === "active",
      mobileLayoutRemainsFocused: !mobileState.horizontalOverflow
        && !mobileState.clippedPriorityText
        && mobileState.currentWorkVisible
        && mobileState.workspaceMenuVisible
        && mobileState.workspaceMenuCollapsed
    };
    results.push({
      recordId,
      checks,
      failures: Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name),
      activeState,
      toolReturnState,
      intakeState,
      mobileState
    });
  }

  const failures = results.flatMap((result) => result.failures.map((failure) => `${result.recordId}: ${failure}`));
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
