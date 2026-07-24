import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const recordId = process.env.GTM_QA_RECORD_ID || "qa3-post-mixed-trailpour-20260724";
const cookie = process.env.GTM_QA_COOKIE || "";
const scoreFields = [
  "marketUrgency",
  "icpClarity",
  "positioningClarity",
  "offerClarity",
  "pricingConfidence",
  "channelFocus",
  "salesMotion",
  "contentAssets",
  "funnelTracking",
  "experimentReadiness",
  "budget",
  "teamCapacity"
];

const response = await fetch(`${baseUrl}/api/records/${encodeURIComponent(recordId)}`, {
  headers: cookie ? { Cookie: cookie } : {}
});
if (!response.ok) {
  throw new Error(`Could not load ${recordId}: HTTP ${response.status}`);
}
const sourceRecord = (await response.json()).record;
if (!sourceRecord?.data) {
  throw new Error(`Record ${recordId} did not return saved intake data.`);
}

function scenarioData(score) {
  const data = structuredClone(sourceRecord.data);
  scoreFields.forEach((field) => {
    data[field] = String(score);
  });
  return data;
}

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});
const contextOptions = {
  viewport: { width: 1440, height: 900 },
  ...(cookie ? { extraHTTPHeaders: { Cookie: cookie } } : {})
};

async function inspectScenario(label, data) {
  const context = await browser.newContext(contextOptions);
  const page = await context.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route(`**/api/records/${recordId}`, async (route) => {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        record: {
          ...sourceRecord,
          data
        }
      })
    });
  });
  await page.goto(`${baseUrl}/results.html?v=20260723-phase1-claims&asset=gtm&recordId=${recordId}`, {
    waitUntil: "load"
  });
  try {
    await page.waitForSelector('[data-claim-id="summary-readiness"]', { timeout: 15000 });
    await page.waitForSelector('[data-claim-trace="summary-risk"]', { state: "attached", timeout: 15000 });
    await page.evaluate(() => {
      document.querySelectorAll("details.summary-support-panel").forEach((details) => {
        details.open = true;
      });
    });
    await page.waitForSelector('[data-claim-trace="summary-risk"]', { timeout: 15000 });
  } catch (error) {
    const diagnostic = await page.evaluate(() => ({
      title: document.title,
      mainText: (document.querySelector("main")?.innerText || "").slice(0, 1200),
      cardHtml: document.getElementById("workspaceSummaryCards")?.innerHTML || ""
    }));
    throw new Error(`${error.message}\n${JSON.stringify({ errors, diagnostic }, null, 2)}`);
  }

  const result = await page.evaluate(() => {
    const summary = document.getElementById("workspaceSummaryCards");
    const recommendation = document.getElementById("workspaceRecommendation");
    const cards = Array.from(summary?.querySelectorAll("[data-claim-id]") || []);
    const readiness = document.querySelector('[data-claim-id="summary-readiness"]');
    const traces = Array.from(recommendation?.querySelectorAll("[data-claim-trace]") || []);
    return {
      score: Number(readiness?.dataset.claimValue || 0),
      cardCount: cards.length,
      traceCount: traces.length,
      claimIds: cards.map((card) => card.dataset.claimId),
      statuses: cards.map((card) => card.dataset.claimStatus),
      confidences: cards.map((card) => card.dataset.claimConfidence),
      readinessSourceFields: String(readiness?.dataset.claimSourceFields || "").split("|").filter(Boolean),
      traceSourceCounts: traces.map((trace) => trace.querySelectorAll("li").length),
      tracesVisible: traces.every((trace) => {
        const style = getComputedStyle(trace);
        const rect = trace.getBoundingClientRect();
        return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
      }),
      rawFieldIdsVisible: traces.some((trace) => /marketUrgency|possibleCustomerGroups__|revenueMotionPortfolio__/i.test(trace.innerText))
    };
  });
  await context.close();
  return { label, errors, ...result };
}

try {
  const low = await inspectScenario("low self-assessment", scenarioData(1));
  const high = await inspectScenario("high self-assessment", scenarioData(5));
  const checks = {
    allFourClaimsRendered: low.cardCount === 4 && high.cardCount === 4,
    allFourTracesRendered: low.traceCount === 4 && high.traceCount === 4,
    readinessRecalculated: high.score > low.score,
    provenanceRetained: low.readinessSourceFields.length >= scoreFields.length && high.readinessSourceFields.length >= scoreFields.length,
    statusesPresent: [...low.statuses, ...high.statuses].every(Boolean),
    confidencesPresent: [...low.confidences, ...high.confidences].every(Boolean),
    tracesUsableWhenExpanded: low.tracesVisible && high.tracesVisible && [...low.traceSourceCounts, ...high.traceSourceCounts].every((count) => count > 0),
    noRawFieldIdsVisible: !low.rawFieldIdsVisible && !high.rawFieldIdsVisible,
    noPageErrors: low.errors.length === 0 && high.errors.length === 0
  };
  const failures = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
  console.log(JSON.stringify({
    checks: Object.keys(checks).length,
    passed: Object.keys(checks).length - failures.length,
    failed: failures.length,
    failures,
    low,
    high
  }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await browser.close();
}
