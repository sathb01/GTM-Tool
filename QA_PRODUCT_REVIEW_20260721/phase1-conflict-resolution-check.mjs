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
  viewport: { width: 1280, height: 900 },
  ...(cookie ? { extraHTTPHeaders: { Cookie: cookie } } : {})
});
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

try {
  await page.goto(`${baseUrl}/index.html?v=20260723-phase1-conflicts`, { waitUntil: "load" });
  await page.waitForFunction(() => typeof window.sourceTruthConflictIssues === "function", null, { timeout: 15000 });
  const result = await page.evaluate(() => {
    const goalData = {
      quick90DayGoal: "Revenue",
      goal90: "Lead flow"
    };
    const goalIssues = window.sourceTruthConflictIssues(goalData);
    window.showDataQualityReview(goalIssues, "detailed", "");
    const review = document.getElementById("dataQualityReview");
    const goalUi = {
      issueCount: goalIssues.length,
      severity: goalIssues[0]?.severity,
      choiceCount: review.querySelectorAll(".data-quality-conflict-choices button").length,
      hasGenerateAnyway: Array.from(review.querySelectorAll("button")).some((button) => /generate anyway/i.test(button.textContent)),
      explanationPresent: Boolean(review.querySelector(".data-quality-resolution textarea")),
      intentionalInitiallyDisabled: review.querySelector(".data-quality-resolution > button.secondary")?.disabled === true
    };

    const acceptedGoalData = {
      ...goalData,
      dataHygieneAcceptedConflicts: JSON.stringify([goalIssues[0].acceptanceId])
    };
    const acceptedIssueCount = window.sourceTruthConflictIssues(acceptedGoalData).length;
    const changedIssueCount = window.sourceTruthConflictIssues({
      ...acceptedGoalData,
      goal90: "Retention"
    }).length;

    const targetData = {
      quick90DayGoal: "Revenue",
      goal90: "Revenue",
      quick90DayRevenueTarget: "$100,000",
      goal90RevenueTarget: "$250,000"
    };
    const targetIssues = window.sourceTruthConflictIssues(targetData);
    return {
      goalUi,
      goalTitle: goalIssues[0]?.title,
      goalAcceptanceScoped: goalIssues[0]?.acceptanceId?.includes("revenue::lead flow"),
      acceptedIssueCount,
      changedIssueCount,
      targetIssueCount: targetIssues.length,
      targetSeverity: targetIssues[0]?.severity,
      targetTitle: targetIssues[0]?.title
    };
  });
  const checks = {
    oneGoalConflict: result.goalUi.issueCount === 1,
    goalConflictIsBlocking: result.goalUi.severity === "error",
    bothSourcesOffered: result.goalUi.choiceCount === 2,
    noGenerateAnywayForConflict: !result.goalUi.hasGenerateAnyway,
    intentionalDifferenceNeedsExplanation: result.goalUi.explanationPresent && result.goalUi.intentionalInitiallyDisabled,
    acceptanceBoundToValues: result.goalAcceptanceScoped,
    acceptedExactDifferenceClears: result.acceptedIssueCount === 0,
    changedDifferenceReappears: result.changedIssueCount === 1,
    oneRevenueTargetConflict: result.targetIssueCount === 1,
    revenueTargetConflictIsBlocking: result.targetSeverity === "error",
    userFacingTitles: result.goalTitle === "Confirm the 90-day goal" && result.targetTitle === "Confirm the 90-day revenue target",
    noPageErrors: errors.length === 0
  };
  const failures = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
  console.log(JSON.stringify({
    checks: Object.keys(checks).length,
    passed: Object.keys(checks).length - failures.length,
    failed: failures.length,
    failures,
    result,
    errors
  }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await context.close();
  await browser.close();
}
