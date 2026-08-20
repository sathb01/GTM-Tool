import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.GTM_PLAYWRIGHT_PATH || "playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const recordId = "qa3-post-saas-clientrenew-20260724";
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});
const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));
const checks = [];
const check = (name, passed, detail = "") => checks.push({ name, passed: Boolean(passed), ...(detail ? { detail } : {}) });

try {
  await page.goto(`${baseUrl}/results.html?recordId=${recordId}`, { waitUntil: "load" });
  await page.waitForSelector("#workspaceSummaryCards .metric-card");
  const summary = await page.evaluate(async () => {
    const data = await readData();
    const categories = categoryDefinitions.map((category) => ({ ...category, score: categoryScore(data, category) }));
    const diagnostic = readinessDiagnostic(data, categories, readinessScoreFromFields(data), quickScoreConfidence(data));
    const readinessDetails = document.querySelector("#summary-readiness-details");
    if (readinessDetails) readinessDetails.open = true;
    const visibleText = readinessDetails?.innerText || "";
    const guidedInputs = Array.from(readinessDetails?.querySelectorAll(".guided-input") || []);
    const duplicateSections = ["icpPlaybook", "offerStrategy", "buyerPersonaBlueprint", "triggerSignalStrategy", "salesMotionBlueprint", "crmBlueprint", "activityModel"]
      .map((id) => document.getElementById(id)?.closest("section"));
    const firstTask = document.getElementById("readiness-improvement-0");
    const firstTaskRect = firstTask?.getBoundingClientRect();
    const simulated = structuredClone(data);
    const valuePrefix = "offerAssessments__offer-1__valueClaims__value-claim-1__";
    simulated[`${valuePrefix}buyerFacingClaim`] = simulated.quickOfferPromise;
    simulated[`${valuePrefix}successMetric`] = "Renewal coverage";
    simulated[`${valuePrefix}baselineValue`] = "60";
    simulated[`${valuePrefix}targetImprovementValue`] = "80";
    simulated[`${valuePrefix}timeToImpact`] = "Within 90 days";
    const simulatedCategories = categoryDefinitions.map((category) => ({ ...category, score: categoryScore(simulated, category) }));
    const simulatedDiagnostic = readinessDiagnostic(simulated, simulatedCategories, readinessScoreFromFields(simulated), quickScoreConfidence(simulated));
    return {
      company: document.querySelector("#companyName")?.textContent || "",
      score: diagnostic.overallScore,
      offerScore: diagnostic.offerScore,
      simulatedScore: simulatedDiagnostic.overallScore,
      simulatedOfferScore: simulatedDiagnostic.offerScore,
      visibleText,
      firstTaskText: firstTask?.innerText || "",
      offerTaskText: document.getElementById("readiness-improvement-1")?.innerText || "",
      signalTaskText: document.getElementById("readiness-improvement-2")?.innerText || "",
      guidedInputCount: guidedInputs.length,
      guidedInputsComplete: guidedInputs.every((node) => {
        const text = node.innerText;
        return /Applies to:/.test(text)
          && /Why now:/.test(text)
          && /What to enter:/.test(text)
          && /Readiness effect:/.test(text)
          && /continue without/i.test(text);
      }),
      improveHref: document.querySelector("#summary-readiness-details [data-readiness-target]")?.getAttribute("href") || "",
      blockerHref: document.querySelector("#workspaceSummaryCards .tone-risk .metric-card-link")?.getAttribute("href") || "",
      resumeHref: document.querySelector("#workspaceSummaryCards .tone-action .metric-card-link")?.getAttribute("href") || "",
      duplicateSectionsHidden: duplicateSections.every((section) => section?.classList.contains("removed-section")),
      rankedReference: document.querySelector('[data-toc="Ranked Action Plan"]')?.textContent || "",
      noHorizontalOverflow: firstTaskRect ? firstTaskRect.right <= document.documentElement.clientWidth : false,
      firstTaskControlWithinCard: firstTaskRect
        ? Array.from(firstTask.querySelectorAll("input, select, textarea")).every((control) => control.getBoundingClientRect().right <= firstTaskRect.right + 1)
        : false
    };
  });

  check("Correct ClientRenew record loaded", /ClientRenew/i.test(summary.company), summary.company);
  check("Readiness remains evidence-based without counting the legacy generic signal", summary.score >= 65 && summary.score <= 74, String(summary.score));
  check("A completed Renewal coverage claim recalculates the offer and overall score", summary.offerScore === 65 && summary.simulatedOfferScore === 68 && summary.simulatedScore >= summary.score, JSON.stringify({ offer: [summary.offerScore, summary.simulatedOfferScore], overall: [summary.score, summary.simulatedScore] }));
  check("Top blocker names the saved motion and channel", /Inside-sales managed-service segment test/i.test(summary.firstTaskText) && /Network and referral-led opportunities/i.test(summary.firstTaskText), summary.firstTaskText);
  check("Offer task names the saved success condition and unit", /Renewal coverage/i.test(summary.offerTaskText) && /0 to 100/i.test(summary.offerTaskText) && /managed-service account portfolio/i.test(summary.offerTaskText), summary.offerTaskText);
  check("Signal task replaces the legacy generic value with a sourceable choice", !/Priority change when “?Customer complaints/i.test(summary.signalTaskText) && /sourceable|observable/i.test(summary.signalTaskText) && /COO or VP Client Services/i.test(summary.signalTaskText), summary.signalTaskText);
  check("Visible completion flow removes generic saved-item language", !/saved success measure|saved highest-priority signal|Top 3 ways to improve/i.test(summary.visibleText), summary.visibleText);
  check("Every readiness prompt uses the shared context contract", summary.guidedInputCount >= 9 && summary.guidedInputsComplete, `${summary.guidedInputCount} guided inputs`);
  check("Summary blocker paths share one direct task", summary.improveHref === "#readiness-improvement-0" && summary.blockerHref === summary.improveHref, `${summary.blockerHref} / ${summary.improveHref}`);
  check("Resume Tool Setup routes only to the active workspace", /[?&]asset=active(?:&|$)/.test(summary.resumeHref) && !/readiness-improvement/.test(summary.resumeHref), summary.resumeHref);
  check("Duplicate plan inventory is hidden", summary.duplicateSectionsHidden);
  check("Retained Ranked Action Plan explains its purpose", /supporting reference/i.test(summary.rankedReference) && /This Week/i.test(summary.rankedReference), summary.rankedReference);
  check("Guided readiness layout fits desktop card", summary.noHorizontalOverflow && summary.firstTaskControlWithinCard);

  const riskAction = page.locator("#workspaceSummaryCards .tone-risk .metric-card-link");
  await riskAction.click();
  check("Complete blockers reveals the executable first task in one action", await page.locator("#readiness-improvement-0 [data-score-field]").first().isVisible());

  let savedOfferPayload = null;
  await page.route(`**/api/records/${recordId}`, async (route) => {
    if (route.request().method() === "PUT") {
      savedOfferPayload = route.request().postDataJSON();
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ record: savedOfferPayload }) });
      return;
    }
    await route.continue();
  });
  const offerTask = page.locator("#readiness-improvement-1");
  await offerTask.locator('[data-score-field$="baselineValue"]').fill("60");
  await offerTask.locator('[data-score-field$="targetImprovementValue"]').fill("80");
  await offerTask.locator('[data-score-field$="timeToImpact"]').fill("Within 90 days");
  await Promise.all([
    page.waitForRequest((request) => request.method() === "PUT" && request.url().endsWith(`/api/records/${recordId}`)),
    page.waitForNavigation({ waitUntil: "load" }),
    offerTask.locator("[data-save-score-component]").click()
  ]);
  const savedData = savedOfferPayload?.data || {};
  const valuePrefix = "offerAssessments__offer-1__valueClaims__value-claim-1__";
  check("Offer task serializes the named value claim without mutating the QA record", savedData[`${valuePrefix}baselineValue`] === "60"
    && savedData[`${valuePrefix}targetImprovementValue`] === "80"
    && savedData[`${valuePrefix}timeToImpact`] === "Within 90 days"
    && savedData[`${valuePrefix}successMetric`] === "Renewal coverage"
    && Boolean(savedData[`${valuePrefix}buyerFacingClaim`]));

  const resumeHref = summary.resumeHref;
  await page.goto(new URL(resumeHref, baseUrl).href, { waitUntil: "load" });
  await page.waitForSelector("#active-plan-objective");
  const active = await page.evaluate(() => ({
    hasCurrentSetupTask: Boolean(document.querySelector(".active-plan-tool-card")),
    hasReadinessTask: Boolean(document.querySelector("[id^='readiness-improvement-']")),
    guidedInputs: Array.from(document.querySelectorAll(".active-plan-tool-card .guided-input")).map((node) => node.innerText)
  }));
  check("Resume opens the current Tool Setup task", active.hasCurrentSetupTask && !active.hasReadinessTask);
  check("Tool Setup status and blocker prompts use contextual guidance", active.guidedInputs.length >= 2 && active.guidedInputs.every((text) => /Applies to:|Why now:|What to enter:|Readiness effect:/.test(text)), JSON.stringify(active.guidedInputs));

  await page.goto(`${baseUrl}/results.html?recordId=${recordId}&asset=weekly-review-setup`, { waitUntil: "load" });
  await page.waitForSelector("#weekly-review-setup-workspace");
  const weeklySetup = await page.evaluate(() => {
    const inputs = Array.from(document.querySelectorAll("#weekly-review-setup-workspace .guided-input"));
    return {
      count: inputs.length,
      complete: inputs.every((node) => /Applies to:/.test(node.innerText) && /Why now:/.test(node.innerText) && /What to enter:/.test(node.innerText) && /Readiness effect:/.test(node.innerText)),
      text: document.querySelector("#weekly-review-setup-workspace")?.innerText || ""
    };
  });
  check("Weekly Review Setup uses contextual guided prompts", weeklySetup.count === 11 && weeklySetup.complete, `${weeklySetup.count} fields`);
  check("Weekly Review Setup names the saved motion", /Inside-sales managed-service segment test/i.test(weeklySetup.text), weeklySetup.text);
} finally {
  await browser.close();
}

pageErrors.forEach((error) => check(`No page error: ${error}`, false, error));
const failed = checks.filter((item) => !item.passed);
console.log(JSON.stringify({ checks: checks.length, passed: checks.length - failed.length, failed: failed.length, failures: failed, pageErrors }, null, 2));
if (failed.length) process.exitCode = 1;
