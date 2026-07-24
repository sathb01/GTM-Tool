import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const sourceRecordId = process.env.GTM_QA_RECORD_ID || "qa3-post-saas-clientrenew-20260724";
const testRecordId = "qa-phase1-crm-priority-roundtrip";
const cookie = process.env.GTM_QA_COOKIE || "";

const sourceResponse = await fetch(`${baseUrl}/api/records/${encodeURIComponent(sourceRecordId)}`, {
  headers: cookie ? { Cookie: cookie } : {}
});
if (!sourceResponse.ok) throw new Error(`Could not load ${sourceRecordId}: HTTP ${sourceResponse.status}`);
const sourceRecord = (await sourceResponse.json()).record;
if (!sourceRecord?.data) throw new Error(`Record ${sourceRecordId} did not return saved data.`);

const data = structuredClone(sourceRecord.data);
data.revenueTrackingSystem = "HubSpot";
data.revenueDataQuality = "Low";
data.revenueReportingCadence = "Weekly";
data.primaryRevenueOwner = "Founder / Sales Lead";
data.pipelineReviewOwner = "Revenue Operations Manager";
data.revenueInfrastructureNotes = "Source attribution and loss reasons are incomplete and inconsistent.";

let currentRecord = {
  ...sourceRecord,
  id: testRecordId,
  name: `${sourceRecord.name} CRM Priority Round Trip`,
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
  await page.goto(`${baseUrl}/results.html?v=20260723-crm-priority-roundtrip&asset=gtm&recordId=${testRecordId}`, {
    waitUntil: "load"
  });
  const claimSelector = '[data-claim-id="ranked-crm-data-quality"]';
  await page.waitForSelector(claimSelector, { timeout: 15000 });
  await page.locator(`${claimSelector} a[href*="focus=pipeline"]`).first().evaluate((link) => link.click());
  await page.waitForSelector(".improvement-focus", { timeout: 15000 });

  const intakeState = await page.evaluate(() => ({
    sectionId: document.querySelector("#sections > section")?.id || "",
    heading: document.querySelector(".improvement-focus h3")?.textContent || "",
    guidance: document.querySelector(".improvement-focus")?.innerText || "",
    mountedFields: Array.from(document.querySelectorAll(".improvement-answer-fields [data-field-id]"))
      .map((field) => field.dataset.fieldId)
  }));

  await page.selectOption('[name="revenueDataQuality"]', "High");
  await page.fill('[name="revenueInfrastructureNotes"]', "Source attribution and loss reasons are required and reviewed during the weekly pipeline review.");
  await page.getByRole("button", { name: "Save Changes and Return" }).first().click();
  await page.waitForSelector("#improvementReturnNotice", { timeout: 15000 });

  const after = await page.evaluate(() => ({
    notice: document.getElementById("improvementReturnNotice")?.innerText || "",
    crmPriorityStillPresent: Boolean(document.querySelector('[data-claim-id="ranked-crm-data-quality"]'))
  }));
  const expectedFields = [
    "revenueTrackingSystem",
    "revenueDataQuality",
    "revenueReportingCadence",
    "revenueInfrastructureNotes",
    "primaryRevenueOwner",
    "pipelineReviewOwner"
  ];
  const checks = {
    crmPriorityRoutesToPipeline: intakeState.sectionId === "pipeline",
    crmPriorityNamed: /Improving: CRM data quality/i.test(intakeState.heading),
    directEditingInstructionShown: /Update the CRM source answers/i.test(intakeState.guidance)
      && /there is no separate place/i.test(intakeState.guidance),
    automaticRerankingExplained: /automatically remove, retain, or rerank/i.test(intakeState.guidance),
    allSourceFieldsMounted: expectedFields.every((fieldId) => intakeState.mountedFields.includes(fieldId)),
    revisedFieldsSaved: currentRecord.data.revenueDataQuality === "High"
      && /required and reviewed/i.test(currentRecord.data.revenueInfrastructureNotes)
      && putCount > 0,
    priorityRecalculated: !after.crmPriorityStillPresent,
    resolvedPriorityExplained: /resolved or reranked/i.test(after.notice),
    noPageErrors: pageErrors.length === 0
  };
  const failures = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
  console.log(JSON.stringify({
    checks: Object.keys(checks).length,
    passed: Object.keys(checks).length - failures.length,
    failed: failures.length,
    failures,
    intakeState,
    after,
    putCount,
    pageErrors
  }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await context.close();
  await browser.close();
}
