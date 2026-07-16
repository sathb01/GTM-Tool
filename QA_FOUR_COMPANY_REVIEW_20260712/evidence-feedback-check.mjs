import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");

const baseUrl = "http://127.0.0.1:8787";
const supportedRecords = [
  "qa-pre-dtc-pawpath-20260712-full-20260714",
  "qa-pre-retail-brightnest-20260712-full-20260714",
  "qa-post-b2b-forgeline-20260712-full-20260714",
  "qa-post-saas-relaymetrics-20260712-full-20260714"
];

const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const results = [];

for (const recordId of supportedRecords) {
  const page = await browser.newPage();
  await page.goto(`${baseUrl}/results.html?asset=active&recordId=${recordId}`, { waitUntil: "networkidle" });
  const text = await page.locator("#active-plan-evidence-feedback").innerText();
  results.push({ recordId, case: "supported saved evidence", passed: /Current Evidence State\s+Supported/i.test(text) && /Recommended Decision\s+Continue and improve one variable/i.test(text) });
  await page.close();
}

const sourceId = "qa-post-saas-relaymetrics-20260712-full-20260714";
const source = await fetch(`${baseUrl}/api/records/${sourceId}`).then((response) => response.json());
const challengedRecord = structuredClone(source.record);
challengedRecord.id = "qa-feedback-challenged";
challengedRecord.data.messagingKitWorkspace.drafts[0].interactions = Array.from({ length: 20 }, (_, index) => ({
  id: `failed-interaction-${index + 1}`,
  contact: `Target ${index + 1}`,
  date: "2026-07-14",
  channel: "Email",
  outcome: "No response",
  response: "",
  nextStep: "",
  learning: "No response from this target."
}));
challengedRecord.data.messagingKitWorkspace.drafts[0].attempts = 20;
challengedRecord.data.messagingKitWorkspace.drafts[0].replies = 0;
challengedRecord.data.messagingKitWorkspace.drafts[0].conversations = 0;
challengedRecord.data.messagingKitWorkspace.drafts[0].nextSteps = 0;
challengedRecord.data.pipelineOpportunityWorkspace.opportunities = [];
challengedRecord.data.outreachSequenceWorkspace.sequences[0].assignments = [];
challengedRecord.data.targetListWorkspace.targets = [];
challengedRecord.data.weeklyReviewWorkspace.reviews = [{
  id: "challenged-review",
  date: "2026-07-14",
  decision: "Revise",
  rationale: "Twenty qualified attempts produced no replies.",
  actions: [],
  metrics: { targets: 20, attempts: 20, replies: 0, conversations: 0, nextSteps: 0, proofUses: 0, openOpportunities: 0, pipelineValue: 0 }
}];

const challengedPage = await browser.newPage();
await challengedPage.route(`${baseUrl}/api/records/qa-feedback-challenged`, (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ record: challengedRecord }) }));
await challengedPage.goto(`${baseUrl}/results.html?asset=active&recordId=qa-feedback-challenged`, { waitUntil: "networkidle" });
const challengedText = await challengedPage.locator("main").innerText();
results.push({
  recordId: "qa-feedback-challenged",
  case: "sufficient negative evidence",
  passed: /Current Evidence State\s+Challenged/i.test(challengedText)
    && /Recommended Decision\s+Revise one core variable/i.test(challengedText)
    && /Priority 1\s+Revise one core variable/i.test(challengedText)
});
await challengedPage.close();

const challengedHealthPage = await browser.newPage();
await challengedHealthPage.route(`${baseUrl}/api/records/qa-feedback-challenged`, (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ record: challengedRecord }) }));
await challengedHealthPage.goto(`${baseUrl}/results.html?asset=health&recordId=qa-feedback-challenged`, { waitUntil: "networkidle" });
const challengedHealthText = await challengedHealthPage.locator("main").innerText();
results.push({
  recordId: "qa-feedback-challenged",
  case: "plan health elevates an unreviewed challenged decision",
  passed: /STATUS\s+Attention required/i.test(challengedHealthText)
    && /NEXT 1\s+Review the evidence-driven strategy change/i.test(challengedHealthText)
    && /Decisions waiting[\s\S]*Review the evidence-driven strategy change/i.test(challengedHealthText),
  actual: challengedHealthText
});
await challengedHealthPage.close();

let savedWeeklyLearning = null;
const weeklyLearningPage = await browser.newPage();
await weeklyLearningPage.route(`${baseUrl}/api/records/qa-feedback-challenged`, async (route) => {
  if (route.request().method() === "PUT") {
    savedWeeklyLearning = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ record: { ...challengedRecord, ...savedWeeklyLearning } }) });
    return;
  }
  await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ record: challengedRecord }) });
});
await weeklyLearningPage.goto(`${baseUrl}/results.html?asset=weekly-review&recordId=qa-feedback-challenged`, { waitUntil: "networkidle" });
const weeklyLearningText = await weeklyLearningPage.locator("#weeklyLearningChange").innerText();
results.push({
  recordId: "qa-feedback-challenged",
  case: "weekly review recommends exactly one variable",
  passed: /Our recommendation:\s*Message/i.test(weeklyLearningText) && /Keep These Constant/i.test(weeklyLearningText) && /Customer segment/i.test(weeklyLearningText) && /Offer/i.test(weeklyLearningText) && /Channel/i.test(weeklyLearningText),
  actual: weeklyLearningText
});
await weeklyLearningPage.evaluate(() => document.querySelector("#saveWeeklyReview")?.click());
for (let attempt = 0; attempt < 20 && !savedWeeklyLearning; attempt += 1) {
  await weeklyLearningPage.waitForTimeout(100);
}
const savedLearningChange = savedWeeklyLearning?.data?.weeklyReviewWorkspace?.reviews?.at(-1)?.learningChange;
results.push({
  recordId: "qa-feedback-challenged",
  case: "weekly learning change persists with constants",
  passed: savedLearningChange?.variable === "Message" && /Revise only the subject line or opening/i.test(savedLearningChange?.change || "") && savedLearningChange?.constants?.length === 5 && !savedLearningChange.constants.includes("Message"),
  actual: savedLearningChange
});
await weeklyLearningPage.close();

let savedReconciliation = null;
const reconciliationPage = await browser.newPage();
await reconciliationPage.route(`${baseUrl}/api/records/qa-feedback-challenged`, async (route) => {
  if (route.request().method() === "PUT") {
    savedReconciliation = route.request().postDataJSON();
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ record: { ...challengedRecord, ...savedReconciliation } }) });
    return;
  }
  await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ record: challengedRecord }) });
});
await reconciliationPage.goto(`${baseUrl}/results.html?asset=reconciliation&recordId=qa-feedback-challenged`, { waitUntil: "networkidle" });
const reconciliationTraceText = await reconciliationPage.locator("#reconciliation-proposal").textContent();
results.push({
  recordId: "qa-feedback-challenged",
  case: "reconciliation proposal shows source traceability",
  passed: /Why this\?/i.test(reconciliationTraceText) && /Rule used:/i.test(reconciliationTraceText) && /Saved execution evidence:/i.test(reconciliationTraceText) && /Review source/i.test(reconciliationTraceText)
});
await reconciliationPage.selectOption("#reconciliationArea", "Problem");
await reconciliationPage.fill("#reconciliationProposedValue", "Professional-services leaders cannot trust weekly forecasts because opportunity stages and updates are inconsistent.");
await reconciliationPage.fill("#reconciliationRationale", "Twenty qualified attempts produced no replies, so the problem statement needs a narrower operational context.");
await reconciliationPage.evaluate(() => document.querySelector("#applyReconciliation")?.click());
await reconciliationPage.waitForFunction(() => /No Change Is Waiting for Approval/i.test(document.querySelector("#reconciliation-proposal")?.innerText || ""));
results.push({
  recordId: "qa-feedback-challenged",
  case: "approved proposal writes to source and history",
  passed: savedReconciliation?.data?.bestFitPrimaryPain === "Professional-services leaders cannot trust weekly forecasts because opportunity stages and updates are inconsistent."
    && savedReconciliation?.data?.evidenceReconciliationWorkspace?.history?.at(-1)?.status === "Applied"
    && savedReconciliation?.data?.evidenceReconciliationWorkspace?.pending?.length === 0
});
await reconciliationPage.close();

const reconciledHealthPage = await browser.newPage();
await reconciledHealthPage.route(`${baseUrl}/api/records/qa-feedback-challenged`, (route) => route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ record: { ...challengedRecord, ...savedReconciliation } }) }));
await reconciledHealthPage.goto(`${baseUrl}/results.html?asset=health&recordId=qa-feedback-challenged`, { waitUntil: "networkidle" });
const reconciledHealthText = await reconciledHealthPage.locator("main").innerText();
results.push({
  recordId: "qa-feedback-challenged",
  case: "reviewed evidence no longer remains in the decision queue",
  passed: /0 decisions waiting/i.test(reconciledHealthText) && !/NEXT 1\s+Review the evidence-driven strategy change/i.test(reconciledHealthText)
});
await reconciledHealthPage.close();
await browser.close();

const failures = results.filter((item) => !item.passed);
console.log(JSON.stringify({ checks: results.length, passed: results.length - failures.length, failed: failures.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
