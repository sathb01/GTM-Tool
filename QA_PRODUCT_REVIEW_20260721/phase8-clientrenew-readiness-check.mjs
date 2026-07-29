import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
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
  check("Filled priority customer is not offered as missing", !/clarify the priority customer group/i.test(snapshot.bodyText));
  check("Filled buying triggers are not offered as missing", !/define the top 3 buying trigger events/i.test(snapshot.bodyText));
  check("Genuine measurable-value gap remains", /measurable value claim|baseline.*target improvement.*timeframe/i.test(snapshot.bodyText));

  const riskAction = page.locator("#workspaceSummaryCards .tone-risk .metric-card-link");
  if (await riskAction.count()) {
    await riskAction.click();
    const directAction = await page.evaluate(() => {
      const targetId = document.querySelector("#workspaceSummaryCards .tone-risk .metric-card-link")?.getAttribute("href")?.replace(/^#/, "");
      const target = targetId ? document.getElementById(targetId) : null;
      const enclosingDetails = target?.closest("details");
      return {
        targetId,
        targetExists: Boolean(target),
        targetVisible: Boolean(target && target.getClientRects().length),
        enclosingDetailsOpen: enclosingDetails ? enclosingDetails.open : true,
        hasExecutableInput: Boolean(target?.querySelector("[data-score-field]")),
        firstInputValue: target?.querySelector("[data-score-field]")?.value || ""
      };
    });
    check("Complete blockers opens the executable input in one action", directAction.targetExists && directAction.targetVisible && directAction.enclosingDetailsOpen && directAction.hasExecutableInput, JSON.stringify(directAction));
    check("Direct blocker action never asks to replace a filled value", directAction.firstInputValue === "", JSON.stringify(directAction));
  } else {
    check("Complete blockers action exists", false);
  }

  const secondaryAction = page.locator("#summary-readiness-details a").filter({ hasText: "Improve the highest-impact blockers" });
  if (await secondaryAction.count()) {
    await page.locator("#summary-readiness-details").evaluate((details) => { details.open = true; });
    await secondaryAction.click();
    check("Improve highest-impact blockers opens the same executable form", await page.locator(`${snapshot.riskActionTarget} [data-score-field]`).first().isVisible());
  } else {
    check("Improve highest-impact blockers action exists", false);
  }

  const completeInputsAction = page.locator("#summary-risk-details a").filter({ hasText: "Complete readiness inputs" });
  if (await completeInputsAction.count()) {
    await page.locator("#summary-risk-details").evaluate((details) => { details.open = true; });
    await completeInputsAction.click();
    check("Complete readiness inputs opens the executable form", await page.locator(`${snapshot.riskActionTarget} [data-score-field]`).first().isVisible());
  } else {
    check("Complete readiness inputs action exists", false);
  }

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
