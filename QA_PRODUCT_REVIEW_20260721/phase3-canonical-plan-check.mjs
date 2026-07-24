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
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

const profiles = [
  { id: "qa3-pre-dtc-roamready-20260724", expectedMode: ["validation"], preRevenue: true },
  { id: "qa3-pre-saas-referralpath-20260724", expectedMode: ["validation"], preRevenue: true },
  { id: "qa3-post-mixed-trailpour-20260724", expectedMode: ["foundation", "optimization"] },
  { id: "qa3-post-saas-clientrenew-20260724", expectedMode: ["foundation", "optimization"] }
];
const results = [];

try {
  for (const profile of profiles) {
    if (profile.preRevenue) {
      await page.goto(`${baseUrl}/results.html?asset=active&recordId=${encodeURIComponent(profile.id)}`, { waitUntil: "load" });
      await page.waitForFunction(() => Boolean(window.GTM_CANONICAL_PLAN?.topActions?.length && window.GTM_ACTIVE_PLAN_DEFINITION?.actions?.length), null, { timeout: 20000 });
      const preRevenue = await page.evaluate(() => ({
        canonical: window.GTM_CANONICAL_PLAN,
        active: window.GTM_ACTIVE_PLAN_DEFINITION,
        overview: document.querySelector("#active-plan-objective")?.textContent || ""
      }));
      const expectedTitles = preRevenue.canonical.topActions.map((item) => item.title);
      const expectedActions = preRevenue.canonical.topActions.map((item) => item.action);
      const checks = {
        exactlyThreeCanonicalActions: preRevenue.canonical.topActions.length === 3,
        uniqueSemanticRoles: new Set(preRevenue.canonical.topActions.map((item) => item.role)).size === 3,
        completeActionContracts: preRevenue.canonical.topActions.every((item) =>
          item.owner && item.timing && item.completionRule && item.evidenceRequired && item.reviewDecision && item.destination?.value
        ),
        activePlanMatchesCanonical: JSON.stringify(preRevenue.active.actions.map((item) => item.title)) === JSON.stringify(expectedTitles)
          && JSON.stringify(preRevenue.active.actions.map((item) => item.output)) === JSON.stringify(expectedActions),
        validationModeIsExplicit: preRevenue.canonical.mode.id === "validation"
          && preRevenue.active.mode?.id === "validation"
          && preRevenue.overview.includes("Why this plan")
          && preRevenue.overview.includes("buyer evidence")
          && !preRevenue.overview.includes("Plan Mode"),
        decisionSequenceEndsWithEvidenceReview: preRevenue.canonical.topActions[2].role === "execution-evidence"
      };
      results.push({
        profile: profile.id,
        mode: preRevenue.canonical.mode.id,
        checks,
        failures: Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name)
      });
      continue;
    }
    await page.goto(`${baseUrl}/results.html?recordId=${encodeURIComponent(profile.id)}`, { waitUntil: "load" });
    await page.waitForFunction(() => Boolean(window.GTM_CANONICAL_PLAN?.topActions?.length), null, { timeout: 20000 });
    const report = await page.evaluate(() => {
      const canonical = window.GTM_CANONICAL_PLAN;
      const rankedTitles = Array.from(document.querySelectorAll("#revenueImpactPriorities .revenue-impact-item > h3"))
        .map((item) => item.textContent.trim().replace(/^\d+\.\s*/, ""));
      const rankedActions = Array.from(document.querySelectorAll("#revenueImpactPriorities .revenue-impact-action"))
        .map((item) => item.textContent.replace(/^Recommended action:\s*/i, "").replace(/^Complete only the missing operating elements:\s*/i, "").trim());
      const phaseText = Array.from(document.querySelectorAll("#plan > div")).map((item) => item.textContent.trim());
      return {
        canonical,
        rankedTitles,
        rankedActions,
        phaseText,
        modeText: document.querySelector(".decision-summary-guide")?.textContent || "",
        actionTableText: document.querySelector("#executiveActionPlan")?.textContent || ""
      };
    });

    await page.goto(`${baseUrl}/results.html?asset=active&recordId=${encodeURIComponent(profile.id)}`, { waitUntil: "load" });
    await page.waitForFunction(() => Boolean(window.GTM_ACTIVE_PLAN_DEFINITION?.actions?.length), null, { timeout: 20000 });
    const active = await page.evaluate(() => ({
      mode: window.GTM_ACTIVE_PLAN_DEFINITION.mode,
      actions: window.GTM_ACTIVE_PLAN_DEFINITION.actions,
      overview: document.querySelector("#active-plan-objective")?.textContent || ""
    }));

    const expectedTitles = report.canonical.topActions.map((item) => item.title);
    const expectedActions = report.canonical.topActions.map((item) => item.action);
    const checks = {
      exactlyThreeCanonicalActions: report.canonical.topActions.length === 3,
      uniqueSemanticRoles: new Set(report.canonical.topActions.map((item) => item.role)).size === report.canonical.topActions.length,
      completeActionContracts: report.canonical.topActions.every((item) =>
        item.owner && item.timing && item.completionRule && item.evidenceRequired && item.reviewDecision && item.destination?.value
      ),
      rankedOrderMatchesCanonical: JSON.stringify(report.rankedTitles) === JSON.stringify(expectedTitles),
      phaseOrderMatchesCanonical: expectedActions.every((action, index) => report.phaseText[index]?.includes(action)),
      actionSummaryMatchesCanonical: expectedTitles.every((title) => report.actionTableText.includes(title))
        && expectedActions.every((action) => report.actionTableText.includes(action)),
      activePlanMatchesCanonical: JSON.stringify(active.actions.map((item) => item.title)) === JSON.stringify(expectedTitles)
        && JSON.stringify(active.actions.map((item) => item.output)) === JSON.stringify(expectedActions),
      modeIsExplicitAndConsistent: profile.expectedMode.includes(report.canonical.mode.id)
        && report.modeText.includes(`${report.canonical.mode.label} plan`)
        && active.mode?.id === report.canonical.mode.id
        && active.overview.includes("Why this plan")
        && !active.overview.includes("Plan Mode"),
      alternativesDoNotReplacePrimary: !report.canonical.alternativeCustomers.includes(report.canonical.primaryCustomer)
    };
    results.push({
      profile: profile.id,
      mode: report.canonical.mode.id,
      checks,
      failures: Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name)
    });
  }

  const failures = results.flatMap((result) => result.failures.map((failure) => `${result.profile}: ${failure}`));
  const total = results.reduce((count, result) => count + Object.keys(result.checks).length, 0);
  console.log(JSON.stringify({
    checks: total,
    passed: total - failures.length,
    failed: failures.length,
    failures,
    results,
    errors
  }, null, 2));
  if (failures.length || errors.length) process.exitCode = 1;
} finally {
  await context.close();
  await browser.close();
}
