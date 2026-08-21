import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.GTM_PLAYWRIGHT_PATH || "playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const cookie = String(process.env.GTM_QA_COOKIE || "").trim();
const headers = cookie ? { Cookie: cookie } : {};
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
const results = [];

function failedChecks(checks) {
  return Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
}

try {
  for (const recordId of profiles) {
    const isPreRevenue = recordId.includes("-pre-");
    const response = await fetch(`${baseUrl}/api/records/${encodeURIComponent(recordId)}`, { headers });
    if (!response.ok) throw new Error(`Could not load ${recordId}: ${response.status}`);
    let testRecord = structuredClone((await response.json()).record);
    delete testRecord.data.activePlanWeeklyWorkspace;
    testRecord.data.activePlanToolSetupWorkspace = {
      statuses: { icp: "Ready", personas: "Ready", targets: "Ready", messaging: "Ready", outreach: "Ready", "weekly-review-setup": "Ready" },
      reasons: {},
      ready: true,
      started: true
    };
    Object.keys(testRecord.data).forEach((key) => {
      if (/^activePlan__(?:action-|weeklyReview__|updatedAt)/.test(key)) delete testRecord.data[key];
    });

    const context = await browser.newContext({
      viewport: { width: 1440, height: 1000 },
      ...(cookie ? { extraHTTPHeaders: { Cookie: cookie } } : {})
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.route("**/api/records/**", async (route) => {
      if (route.request().method() === "GET") {
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ record: testRecord }) });
        return;
      }
      if (route.request().method() === "PUT") {
        const body = route.request().postDataJSON();
        testRecord = { ...testRecord, ...body, id: recordId, data: body.data || testRecord.data };
        await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ record: testRecord }) });
        return;
      }
      await route.continue();
    });

    const checks = {};
    const observations = {};
    try {
      if (!isPreRevenue) {
        await page.goto(`${baseUrl}/results.html?v=action-first-qa&asset=gtm&recordId=${recordId}`, { waitUntil: "load" });
        await page.waitForSelector("#workspaceSummaryCards", { timeout: 20000 });
        const summary = await page.evaluate(() => {
          const text = document.body.innerText;
          return {
            labels: Array.from(document.querySelectorAll("#workspaceSummaryCards .metric-card h3")).map((item) => item.textContent.trim()),
            banned: /Top Opportunity|Recommended Opportunity|Recommended Direction|Next Best Action|Biggest Risk|Focused Target List/i.test(text),
            priorityHeading: document.querySelector("#summary-opportunity-details summary")?.childNodes?.[0]?.textContent.trim() || "",
            explainsWhy: document.querySelector("#summary-opportunity-details")?.textContent.includes("Why this matters") || false,
            definesExperiment: document.querySelector("#summary-opportunity-details")?.textContent.includes("Test the current ICP, offer, and revenue motion") || false,
            workButton: document.querySelector("#summary-opportunity-details a")?.textContent.trim() || ""
          };
        });
        checks.summaryUsesFourPlainLabels = ["GTM Readiness Score", "Priority Opportunity", "This Week", "Readiness Blockers / What Needs Attention"].every((label) => summary.labels.includes(label));
        checks.summaryRemovesOldHierarchy = !summary.banned;
        checks.opportunityShowsBasisAndFocus = summary.priorityHeading === "90-Day GTM Experiment" && summary.explainsWhy && summary.definesExperiment;
        checks.summaryPointsDirectlyToWork = summary.workButton === "Build the first list";
        observations.summary = summary;
      }

      await page.goto(`${baseUrl}/results.html?v=action-first-qa&asset=active&recordId=${recordId}`, { waitUntil: "load" });
      await page.waitForSelector("#active-plan-this-week [data-weekly-priority]", { timeout: 20000 });
      const setup = await page.evaluate(() => ({
        thisWeekPresent: Boolean(document.getElementById("active-plan-this-week")),
        toolSetupComplete: /Tool Setup is complete/i.test(document.getElementById("active-plan-objective")?.innerText || ""),
        referencesOpenSeparately: Array.from(document.querySelectorAll("#active-plan-this-week .active-plan-task-resources a[data-keep-new-window='true']"))
          .every((link) => link.target === "_blank")
      }));
      checks.toolSetupComesBeforeWeekOne = setup.toolSetupComplete && setup.thisWeekPresent;
      checks.referenceAssetsOpenBesidePlan = setup.referencesOpenSeparately;
      try {
        await page.waitForSelector("#active-plan-this-week [data-weekly-priority]", { timeout: 20000 });
      } catch (error) {
        const state = await page.evaluate(() => ({
          setupStatus: document.getElementById("toolSetupStatus")?.textContent || "",
          bodyText: document.body.innerText.slice(0, 1600)
        }));
        throw new Error(`${error.message}\nTool Setup state: ${JSON.stringify(state)}\nPage errors: ${errors.join(" | ")}`);
      }
      const weekly = await page.evaluate(() => {
        const cards = Array.from(document.querySelectorAll("[data-weekly-priority]"));
        const text = document.getElementById("active-plan-this-week")?.innerText || "";
        return {
          heading: document.querySelector("#active-plan-this-week h2")?.textContent.trim() || "",
          count: cards.length,
          titles: cards.map((card) => card.querySelector("h3")?.textContent.trim() || ""),
          instructions: cards.filter((card) => card.querySelector(".active-plan-task-instruction")).length,
          resultFields: cards.filter((card) => card.querySelector('[data-weekly-priority-field="result"]')).length,
          learningFields: cards.filter((card) => card.querySelector('[data-weekly-priority-field="learning"]')).length,
          blockerFields: cards.filter((card) => card.querySelector('[data-weekly-priority-field="blocker"]')).length,
          repeatedLabels: /Why it matters:|This week's output:|Complete when:|Evidence to save:|How to complete this priority/i.test(text),
          decisionRule: text.match(/12 qualified conversations[^.]*fewer than two[^.]*no pilot commitments/i)?.[0] || ""
        };
      });
      observations.weeklyTitles = weekly.titles;
      observations.reviewInstruction = await page.locator("[data-weekly-priority]").last().locator(".active-plan-task-instruction").textContent();
      checks.thisWeekIsTheWorkingArea = weekly.heading === "Do This Week" && weekly.count > 0 && weekly.count <= 3;
      checks.weeklyCardsAreSelfContained = weekly.instructions === weekly.count
        && weekly.resultFields === weekly.count
        && weekly.learningFields === weekly.count
        && weekly.blockerFields === weekly.count;
      checks.repeatedTaskProseRemoved = !weekly.repeatedLabels;
      if (recordId.includes("clientrenew")) checks.numericStopRuleIsOperational = Boolean(weekly.decisionRule);

      await page.goto(`${baseUrl}/results.html?v=action-first-qa&asset=personas&recordId=${recordId}`, { waitUntil: "load" });
      await page.waitForSelector("#persona-conversation-guide", { timeout: 20000 });
      const persona = await page.evaluate(() => {
        const text = document.body.innerText;
        const guideBlocks = Array.from(document.querySelectorAll(".persona-guide-block"));
        const discovery = guideBlocks.find((block) => /Discovery questions/i.test(block.querySelector("h3")?.textContent || ""));
        const opening = guideBlocks.find((block) => /Suggested opening/i.test(block.querySelector("h3")?.textContent || ""));
        return {
          hasInternalEvidenceSection: /Evidence and Confidence/.test(text),
          hasPlainReachLabel: /Where and how to reach this buyer|Where to reach them/.test(text),
          hasOldReachLabel: /Preferred communication path/.test(text),
          discoveryCount: discovery?.querySelectorAll("li").length || 0,
          opening: opening?.querySelector("li")?.textContent.trim() || "",
          committeeInstruction: document.getElementById("persona-buying-network")?.textContent.includes("identify which of these roles applies to each target") || false
        };
      });
      checks.personaHidesInternalConfidence = !persona.hasInternalEvidenceSection;
      checks.personaUsesPlainReachLanguage = persona.hasPlainReachLabel && !persona.hasOldReachLabel;
      checks.personaProvidesEnoughDiscoveryQuestions = persona.discoveryCount >= 5 && persona.discoveryCount <= 10;
      checks.personaOpeningIsConversational = persona.opening.includes("?") && /speaking|talking|curious|value your perspective/i.test(persona.opening);
      checks.buyingRolesHaveAUse = persona.committeeInstruction;

      if (!isPreRevenue) {
        await page.goto(`${baseUrl}/results.html?v=action-first-qa&asset=icp&recordId=${recordId}`, { waitUntil: "load" });
        await page.waitForSelector("#icp-brief", { timeout: 20000 });
        const icp = await page.evaluate(() => {
          const text = document.getElementById("icp-brief")?.innerText || "";
          const labels = Array.from(document.querySelectorAll("#icp-brief .field h3")).map((item) => item.textContent.trim());
          return {
            labels,
            status: Array.from(document.querySelectorAll("#icp-brief .field")).find((field) => field.querySelector("h3")?.textContent.trim() === "ICP status")?.innerText || "",
            brokenCurrency: /\$24\s*\n\s*000|\$60\s*\n\s*000/.test(text),
            hasSearchInstructions: /Use this as the filter for Target List Setup|Start with 25 qualified accounts/.test(text)
          };
        });
        checks.icpDoesNotClaimValidationWithoutResults = !/Validated ICP/i.test(icp.status);
        checks.icpUsesPlainSectionNames = ["Target account", "Firmographic and geographic fit", "Operating context and need", "Commercial and delivery fit", "Buying patterns and timing", "Observable account signals", "Disqualifiers", "What still needs to be proven", "Use this brief"].every((label) => icp.labels.includes(label));
        checks.icpBulletsKeepNumbersIntact = !icp.brokenCurrency;
        checks.icpMakesAccountFindingActionable = icp.hasSearchInstructions;
      }

      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(`${baseUrl}/results.html?v=action-first-qa&asset=active&recordId=${recordId}`, { waitUntil: "load" });
      await page.waitForSelector("#active-plan-this-week", { timeout: 20000 });
      checks.mobileActivePlanDoesNotOverflow = await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 2);

      await page.goto(`${baseUrl}/results.html?v=action-first-qa&asset=messaging&taskOrigin=this-week&recordId=${recordId}`, { waitUntil: "load" });
      await page.waitForSelector("#planWorkReturnBar", { timeout: 20000 });
      checks.workToolsProvideAVisibleReturn = await page.evaluate(() => /Return to This Week/.test(document.getElementById("planWorkReturnBar")?.innerText || ""));
      checks.noPageErrors = errors.length === 0;
    } finally {
      await context.close();
    }
    const failures = failedChecks(checks);
    results.push({
      recordId,
      checks: Object.keys(checks).length,
      passed: Object.keys(checks).length - failures.length,
      failed: failures.length,
      failures,
      observations,
      errors
    });
  }
} finally {
  await browser.close();
}

const checks = results.reduce((sum, result) => sum + result.checks, 0);
const failed = results.reduce((sum, result) => sum + result.failed, 0);
console.log(JSON.stringify({
  checks,
  passed: checks - failed,
  failed,
  failures: results.flatMap((result) => result.failures.map((failure) => `${result.recordId}: ${failure}`)),
  results
}, null, 2));
if (failed) process.exitCode = 1;
