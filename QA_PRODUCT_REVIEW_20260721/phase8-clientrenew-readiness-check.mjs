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

const results = [];
const check = (name, passed, detail = "") => results.push({ check: name, passed: Boolean(passed), ...(detail ? { detail } : {}) });

try {
  await page.goto(`${baseUrl}/results.html?recordId=${recordId}`, { waitUntil: "load" });
  await page.waitForSelector("#workspaceSummaryCards .metric-card");
  const snapshot = await page.evaluate(async () => {
    const data = await readData();
    const categories = categoryDefinitions.map((category) => ({ ...category, score: categoryScore(data, category) }));
    const diagnostic = readinessDiagnostic(data, categories, readinessScoreFromFields(data), quickScoreConfidence(data));
    const readinessDetails = document.querySelector("#summary-readiness-details");
    if (readinessDetails) readinessDetails.open = true;
    const riskDetails = document.querySelector("#summary-risk-details");
    if (riskDetails) riskDetails.open = true;
    return {
      company: document.querySelector("#companyName")?.textContent || "",
      overallScore: diagnostic?.overallScore,
      defaultScore: diagnostic?.defaultScore,
      componentScores: Object.fromEntries((diagnostic?.components || []).map((item) => [item.key, item.score])),
      subScores: {
        customerPriority: diagnostic?.customerPriorityScore,
        buyer: diagnostic?.buyerScore,
        offer: diagnostic?.offerScore,
        signal: diagnostic?.signalScore,
        revenueMotion: diagnostic?.revenueMotionScore
      },
      improvements: (diagnostic?.improvements || []).map((item) => ({ area: item.area, action: item.action, fieldIds: item.fieldIds })),
      bodyText: document.body.innerText,
      riskActionTarget: document.querySelector("#workspaceSummaryCards .tone-risk .metric-card-link")?.getAttribute("href") || ""
    };
  });

  check("Correct ClientRenew record loaded", /ClientRenew/i.test(snapshot.company), snapshot.company);
  check("Saved priority customer is fully counted", snapshot.subScores.customerPriority === 100, JSON.stringify(snapshot.subScores));
  check("Saved offer portfolio and proof are counted", snapshot.subScores.offer >= 50, JSON.stringify(snapshot.subScores));
  check("Saved trigger and signal evidence are counted", snapshot.subScores.signal >= 50, JSON.stringify(snapshot.subScores));
  check("Overall score remains evidence-based", Number.isFinite(snapshot.overallScore) && snapshot.overallScore >= 0 && snapshot.overallScore <= 100, String(snapshot.overallScore));
  check("Filled priority customer is not offered as missing", !/clarify the priority customer group/i.test(snapshot.bodyText));
  check("Filled buying triggers are not offered as missing", !/define the top 3 buying trigger events/i.test(snapshot.bodyText));
  check("Plan Summary does not expose internal readiness forms", !/Applies to:|Why now:|What to enter:|Readiness effect:|Saved plan item:|Using saved context:/i.test(snapshot.bodyText));

  const setupAction = page.locator("#workspaceSummaryCards .tone-action .metric-card-link");
  const setupActionState = await setupAction.evaluate((link) => ({
    label: link.textContent || "",
    href: link.getAttribute("href") || ""
  }));
  check("Finish setup is the one prerequisite launcher", /continue/i.test(setupActionState.label) && /asset=(icp|personas|targets|messaging|outreach|weekly-review-setup)/.test(setupActionState.href) && /taskOrigin=summary/.test(setupActionState.href) && /Finish setup/i.test(snapshot.bodyText), JSON.stringify(setupActionState));
  check("Readiness Blockers does not duplicate the setup launcher", await page.locator("#workspaceSummaryCards .tone-risk .metric-card-link").count() === 0);
  check("Score review does not duplicate the setup launcher", await page.locator("#summary-readiness-details .card-actions a").count() === 0);
  check("Readiness Blockers detail does not duplicate the setup launcher", await page.locator("#summary-risk-details .card-actions a").count() === 0);

  console.log(JSON.stringify({ snapshot, checks: results }, null, 2));
} finally {
  await browser.close();
}

pageErrors.forEach((error) => check(`No page error: ${error}`, false, error));
const failed = results.filter((item) => !item.passed);
console.log(JSON.stringify({
  checks: results.length,
  passed: results.length - failed.length,
  failed: failed.length,
  failures: failed.map((item) => item.detail || item.check),
  pageErrors
}, null, 2));
if (failed.length) process.exitCode = 1;
