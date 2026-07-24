import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const sourceRecordId = process.env.GTM_QA_RECORD_ID || "qa3-post-mixed-trailpour-20260724";
const testRecordId = "qa-phase1-ranked-roundtrip";
const cookie = process.env.GTM_QA_COOKIE || "";

const sourceResponse = await fetch(`${baseUrl}/api/records/${encodeURIComponent(sourceRecordId)}`, {
  headers: cookie ? { Cookie: cookie } : {}
});
if (!sourceResponse.ok) throw new Error(`Could not load ${sourceRecordId}: HTTP ${sourceResponse.status}`);
const sourceRecord = (await sourceResponse.json()).record;
if (!sourceRecord?.data) throw new Error(`Record ${sourceRecordId} did not return saved data.`);

const data = structuredClone(sourceRecord.data);
[
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
].forEach((field) => {
  data[field] = "5";
});
data.primarySalesMotion = data.primarySalesMotion || "Field sales";
data.quickCurrentSalesMotion = data.quickCurrentSalesMotion || data.primarySalesMotion;
data.quickPrimaryRevenueSource = data.quickPrimaryRevenueSource || "Existing retailer base";
data.revenueReportingCadence = "Weekly";
data.primaryRevenueOwner = data.primaryRevenueOwner || "Founder";
data.revenueTrackingSystem = "";
data.facilitationOutputs = data.facilitationOutputs || {};
data.facilitationOutputs.revenueMotion = data.facilitationOutputs.revenueMotion || {};
data.facilitationOutputs.revenueMotion.answers = Object.fromEntries(
  Array.from({ length: 10 }, (_, index) => [`q${index + 5}`, "Confirmed"])
);
const assessmentPrefix = "revenueMotionAssessments__motion-1";
data[`${assessmentPrefix}__channelPerformance__currentActivity`] = "Ten qualified retailer conversations per week";
data[`${assessmentPrefix}__nextExperiment__successMetric`] = "Five qualified retailer next steps";
data[`${assessmentPrefix}__nextExperiment__reviewCadence`] = "Weekly";
data[`${assessmentPrefix}__conversionStages__stage-1__stageName`] = "Qualified conversation";
data[`${assessmentPrefix}__conversionStages__stage-1__entryCriteria`] = "Retailer matches the priority customer criteria";
data[`${assessmentPrefix}__conversionStages__stage-1__exitCriteria`] = "Buyer agrees to evaluate the starter assortment";

let currentRecord = {
  ...sourceRecord,
  id: testRecordId,
  name: `${sourceRecord.name} Phase 1 Round Trip`,
  data
};
let putCount = 0;

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  ...(cookie ? { extraHTTPHeaders: { Cookie: cookie } } : {})
});
const page = await context.newPage();
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));
await page.route("**/api/records", async (route) => {
  if (route.request().method() !== "GET") {
    await route.continue();
    return;
  }
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ records: [currentRecord] })
  });
});
await page.route(`**/api/records/${testRecordId}`, async (route) => {
  if (route.request().method() === "PUT") {
    const body = route.request().postDataJSON();
    currentRecord = {
      ...currentRecord,
      ...body,
      id: testRecordId,
      data: body.data || currentRecord.data
    };
    putCount += 1;
  }
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ record: currentRecord })
  });
});

try {
  await page.goto(`${baseUrl}/results.html?v=20260723-phase1-ranked&asset=gtm&recordId=${testRecordId}`, {
    waitUntil: "load"
  });
  const claimSelector = '[data-claim-id="ranked-revenue-motion-discipline"]';
  await page.waitForSelector(claimSelector, { timeout: 15000 });
  const before = await page.locator(claimSelector).evaluate((item) => ({
    value: item.dataset.claimValue,
    sourceFields: String(item.dataset.claimSourceFields || "").split("|").filter(Boolean),
    improveLinks: Array.from(item.querySelectorAll("a")).filter((link) => link.textContent.trim() === "Improve This Priority").length,
    nestedGenericLinks: Array.from(item.querySelectorAll("a, button")).filter((control) => control.textContent.trim() === "Improve This Section").length
  }));

  await page.locator(claimSelector).getByRole("link", { name: "Improve This Priority" }).click();
  await page.waitForSelector(".improvement-focus", { timeout: 15000 });
  const intakeState = await page.evaluate(() => ({
    sectionId: document.querySelector("#sections > section")?.id || "",
    mountedFields: Array.from(document.querySelectorAll(".improvement-answer-fields [data-field-id]"))
      .map((field) => field.dataset.fieldId),
    returnTo: new URLSearchParams(window.location.search).get("returnTo") || ""
  }));
  await page.selectOption('[name="revenueTrackingSystem"]', "HubSpot");
  await page.getByRole("button", { name: "Save Changes and Return" }).first().click();
  await page.waitForSelector("#improvementReturnNotice", { timeout: 15000 });
  const after = await page.evaluate(() => ({
    notice: document.getElementById("improvementReturnNotice")?.innerText || "",
    originalClaimStillPresent: Boolean(document.querySelector('[data-claim-id="ranked-revenue-motion-discipline"]')),
    rankedPlanHighlighted: document.getElementById("revenueImpactPriorities")?.classList.contains("improvement-return-highlight") || false,
    openPriorityCount: Array.from(document.querySelectorAll("#revenueImpactPriorities details")).filter((details) => details.open).length
  }));
  const remainingPriority = page.locator("#revenueImpactPriorities [data-claim-id]").first();
  const remainingClaimId = await remainingPriority.getAttribute("data-claim-id");
  await remainingPriority.getByRole("link", { name: "Improve This Priority" }).click();
  await page.waitForSelector(".improvement-focus", { timeout: 15000 });
  await page.getByRole("button", { name: "Save Changes and Return" }).first().click();
  await page.waitForSelector("#improvementReturnNotice", { timeout: 15000 });
  const unchanged = await page.evaluate((claimId) => {
    const claim = document.querySelector(`[data-claim-id="${CSS.escape(claimId)}"]`);
    return {
      notice: document.getElementById("improvementReturnNotice")?.innerText || "",
      claimStillPresent: Boolean(claim),
      claimHighlighted: claim?.classList.contains("improvement-return-highlight") || false,
      detailsOpen: claim?.querySelector("details")?.open || false
    };
  }, remainingClaimId);

  const checks = {
    rankedPriorityHasClaim: Boolean(before.value),
    exactSourceFieldsRetained: before.sourceFields.includes("revenueTrackingSystem"),
    onePriorityImprovementRoute: before.improveLinks === 1,
    oldNestedImprovementButtonsRemoved: before.nestedGenericLinks === 0,
    correctIntakeSectionOpened: intakeState.sectionId === "pipeline",
    exactFieldMounted: intakeState.mountedFields.includes("revenueTrackingSystem"),
    returnTargetsOriginalPriority: /#action-plan-\d+$/.test(intakeState.returnTo),
    updatedFieldSaved: currentRecord.data.revenueTrackingSystem === "HubSpot" && putCount > 0,
    priorityRecalculated: !after.originalClaimStillPresent,
    resolvedPriorityExplained: /resolved or reranked/i.test(after.notice),
    updatedRankedPlanHighlighted: after.rankedPlanHighlighted,
    unchangedPriorityExplained: unchanged.claimStillPresent && /priority is unchanged/i.test(unchanged.notice),
    unchangedPriorityRestored: unchanged.claimHighlighted && unchanged.detailsOpen,
    noPageErrors: pageErrors.length === 0
  };
  const failures = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
  console.log(JSON.stringify({
    checks: Object.keys(checks).length,
    passed: Object.keys(checks).length - failures.length,
    failed: failures.length,
    failures,
    before,
    intakeState,
    after,
    unchanged,
    savedValue: currentRecord.data.revenueTrackingSystem,
    putCount,
    pageErrors
  }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await context.close();
  await browser.close();
}
