import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const recordId = process.env.GTM_QA_RECORD_ID || "qa2-post-mixed-fieldsip-20260721";
const cookie = process.env.GTM_QA_COOKIE || "";

const response = await fetch(`${baseUrl}/api/records/${encodeURIComponent(recordId)}`, {
  headers: cookie ? { Cookie: cookie } : {}
});
if (!response.ok) throw new Error(`Could not load ${recordId}: HTTP ${response.status}`);
const sourceRecord = (await response.json()).record;

function executionScenario(withEvidence) {
  const data = structuredClone(sourceRecord.data);
  data.messagingKitWorkspace = withEvidence ? {
    drafts: [{
      interactions: Array.from({ length: 12 }, (_, index) => ({
        outcome: index < 4 ? "Meaningful next step" : index < 8 ? "Conversation held" : "No response"
      }))
    }]
  } : { drafts: [] };
  data.weeklyReviewWorkspace = withEvidence ? {
    reviews: [
      { decision: "Continue", metrics: { attempts: 12, replies: 8, conversations: 6, nextSteps: 4, openOpportunities: 2, noNextAction: 0 } },
      { decision: "Continue", metrics: { attempts: 12, replies: 8, conversations: 6, nextSteps: 4, openOpportunities: 2, noNextAction: 0 } }
    ]
  } : { reviews: [] };
  return data;
}

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});

async function inspect(label, data) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    ...(cookie ? { extraHTTPHeaders: { Cookie: cookie } } : {})
  });
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route(`**/api/records/${recordId}`, (route) => route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ record: { ...sourceRecord, data } })
  }));
  await page.goto(`${baseUrl}/results.html?v=20260723-phase1-score-separation&asset=gtm&recordId=${recordId}`, { waitUntil: "load" });
  await page.waitForSelector("#summary-readiness-details .score-metric-strip", { state: "attached", timeout: 15000 });
  await page.evaluate(() => {
    document.getElementById("summary-readiness-details").open = true;
    document.querySelectorAll("#summary-readiness-details .score-component-detail").forEach((details) => {
      details.open = true;
    });
  });
  const result = await page.evaluate(() => {
    const panel = document.getElementById("summary-readiness-details");
    const metrics = Array.from(panel.querySelectorAll(".score-metric-strip > div")).map((item) => item.innerText);
    const components = Array.from(panel.querySelectorAll(".score-component-detail")).map((item) => item.innerText);
    const improvements = Array.from(panel.querySelectorAll(".score-improvement")).map((item) => ({
      text: item.innerText,
      links: item.querySelectorAll("a, button").length
    }));
    return {
      readiness: Number(document.querySelector('[data-claim-id="summary-readiness"]')?.dataset.claimValue || 0),
      metrics,
      components,
      improvements,
      visibleText: panel.innerText
    };
  });
  await context.close();
  return { label, errors, ...result };
}

try {
  const untested = await inspect("untested", executionScenario(false));
  const executed = await inspect("executed", executionScenario(true));
  const checks = {
    threeSeparateMetrics: executed.metrics.length === 3,
    readinessMetricNamed: executed.metrics[0]?.includes("GTM readiness"),
    confidenceMetricNamed: executed.metrics[1]?.includes("Evidence confidence"),
    executionMetricNamed: executed.metrics[2]?.includes("Execution progress"),
    executionProgressChanges: untested.metrics[2] !== executed.metrics[2] && executed.metrics[2].includes("/100"),
    readinessUnaffectedByActivityVolume: untested.readiness === executed.readiness,
    threeWeightedComponents: executed.components.length === 3,
    componentWeightsExplained: executed.components.every((text) => /% of overall score/.test(text)),
    foundationClearlyNamed: executed.components.some((text) => /^Customer, offer, and signal foundation:/i.test(text)),
    weightedFormulaExplained: /55% customer, offer, and signal foundation; 35% planned operating readiness; and 10% respondent self-assessment/i.test(executed.visibleText),
    confidenceNotWeightedComponent: !executed.components.some((text) => /^Evidence confidence:/i.test(text)),
    countedEvidenceShown: executed.components.every((text) => text.includes("Saved evidence counted")),
    nextInputsShown: executed.components.every((text) => text.includes("Inputs that can change this area")),
    improvementRoutesPresent: executed.improvements.every((item) => item.links === 1),
    estimatedLiftQualified: executed.improvements.every((item) => /not a guaranteed increase/i.test(item.text)),
    noInternalLabels: !/possibleCustomerGroups__|offerPortfolio__|revenueMotionPortfolio__|activePlanWeeklyWorkspace/.test(executed.visibleText),
    noPageErrors: untested.errors.length === 0 && executed.errors.length === 0
  };
  const failures = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
  console.log(JSON.stringify({
    checks: Object.keys(checks).length,
    passed: Object.keys(checks).length - failures.length,
    failed: failures.length,
    failures,
    untested: { readiness: untested.readiness, metrics: untested.metrics },
    executed: { readiness: executed.readiness, metrics: executed.metrics }
  }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await browser.close();
}
