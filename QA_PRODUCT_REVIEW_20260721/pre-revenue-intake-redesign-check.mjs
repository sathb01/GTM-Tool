import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const recordId = "qa-pre-revenue-redesign-contract";
const now = new Date().toISOString();
const data = {
  companyName: "QA Sock Co",
  toolMode: "Pre-Revenue Validation",
  reviewMode: "preRevenue",
  businessTypeId: "dtc_ecommerce_brand",
  hasRecurringRevenue: "Yes",
  routeToMarket: "Retail / wholesale",
  "preRevenueComparables__comparable-1__name": "Example Sock Brand",
  "preRevenueComparables__comparable-1__url": "https://example.com/socks",
  "preRevenueComparables__comparable-1__whyComparable": "Similar product and wholesale route",
  prePrimaryHypothesis: "Problem-aware buyers",
  "preCustomerHypotheses__first-win-segment-1__segmentName": "Small businesses or teams",
  "preCustomerHypotheses__first-win-segment-1__problem": "Current products do not solve the use case well",
  "preCustomerHypotheses__first-win-segment-1__whyNow": "Seasonal need or buying window",
  "preCustomerHypotheses__first-win-segment-1__problemIntensity": "5",
  "preCustomerHypotheses__first-win-segment-1__urgencyTrigger": "5",
  "preCustomerHypotheses__first-win-segment-1__reachabilityScore": "5",
  "preCustomerHypotheses__first-win-segment-1__credibilityRightToWin": "5",
  "preCustomerHypotheses__first-win-segment-1__validationSpeed": "5",
  "preCustomerHypotheses__first-win-segment-1__deliveryFitScore": "5",
  "preCustomerHypotheses__first-win-segment-1__validationRecommendationReview": "Use the recommended test",
  "preCustomerHypotheses__first-win-segment-2__segmentName": "Problem-aware buyers",
  "preCustomerHypotheses__first-win-segment-2__problem": "Current products do not solve the use case well",
  "preCustomerHypotheses__first-win-segment-2__whyNow": "Seasonal need or buying window",
  "preCustomerHypotheses__first-win-segment-2__problemIntensity": "2",
  "preCustomerHypotheses__first-win-segment-2__urgencyTrigger": "2",
  "preCustomerHypotheses__first-win-segment-2__reachabilityScore": "2",
  "preCustomerHypotheses__first-win-segment-2__credibilityRightToWin": "2",
  "preCustomerHypotheses__first-win-segment-2__validationSpeed": "2",
  "preCustomerHypotheses__first-win-segment-2__deliveryFitScore": "2"
};
let record = { id: recordId, name: "QA Sock Co", data, createdAt: now, updatedAt: now };
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));
await page.route("**/api/records**", async (route) => {
  const request = route.request();
  if (request.method() !== "GET") {
    const incoming = request.postDataJSON?.();
    if (incoming?.data) record = incoming;
    await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ record }) });
    return;
  }
  const pathname = new URL(request.url()).pathname;
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify(pathname === "/api/records" ? { records: [record] } : { record })
  });
});

await page.goto(`${baseUrl}/index.html?recordId=${recordId}&section=company#company`, { waitUntil: "networkidle" });
await page.waitForSelector("#company");
const company = await page.evaluate(() => {
  const options = (name) => [...(document.querySelector(`[name="${name}"]`)?.options || [])].map((option) => option.textContent.trim()).filter(Boolean);
  const visibleText = document.getElementById("company")?.innerText || "";
  const current = getFormData();
  return {
    toolModes: options("toolMode"),
    businessTypes: options("businessTypeId"),
    revenueModels: options("hasRecurringRevenue"),
    revenueModelHasBlankChoice: [...(document.querySelector('[name="hasRecurringRevenue"]')?.options || [])]
      .slice(1)
      .some((option) => !option.textContent.trim()),
    businessTypeValue: document.querySelector('[name="businessTypeId"]')?.value || "",
    revenueModelValue: document.querySelector('[name="hasRecurringRevenue"]')?.value || "",
    derivedStage: current.companyStage,
    derivedRevenue: current.revenueRange,
    derivedControlsLocked: ["companyStage", "revenueRange"].every((name) => {
      const field = document.querySelector(`[name="${name}"]`);
      return field?.value === "Pre-revenue" && field.disabled;
    }),
    expectedRevenueLabel: document.querySelector('[data-field-id="hasRecurringRevenue"] label')?.textContent.trim() || "",
    routeVisible: Boolean(document.querySelector('[data-field-id="routeToMarket"]')),
    comparablesVisible: Boolean(document.querySelector('[data-repeatable-card-list-for="preRevenueComparables"]')),
    hiddenFieldsAbsent: ["reviewPeriod", "customerCount", "averageDealSize", "primarySalesMotion", "mainGrowthConstraint", "monthlyRecurringRevenue", "annualRecurringRevenue"].every((name) => !document.querySelector(`[name="${name}"]`)),
    postRevenueTablesAbsent: !visibleText.includes("GTM systems and data sources") && !visibleText.includes("Website URLs, social media, and public presence"),
    guidancePresent: /do not guess/i.test(visibleText) && /pre-revenue defaults applied\. Company Stage and Revenue have been set automatically\./i.test(visibleText),
    researchPromptUsesComparables: /https:\/\/example\.com\/socks/.test(buildResearchPrompt(current.companyName, current.website))
      && /hypotheses for the respondent to review/i.test(buildResearchPrompt(current.companyName, current.website))
  };
});

await page.evaluate(() => switchActiveSection("preRevenueHypotheses"));
await page.waitForSelector("#preRevenueHypotheses");
const hypotheses = await page.evaluate(() => {
  const controls = [...document.querySelectorAll('#preRevenueHypotheses [data-multi-select-dropdown="true"]')];
  const clickFirst = (suffix) => {
    const control = controls.find((item) => item.dataset.fieldName?.endsWith(suffix));
    const checkbox = control?.querySelector('input[type="checkbox"]:not(:disabled)');
    if (checkbox && !checkbox.checked) checkbox.click();
    return {
      exists: Boolean(control),
      selected: [...(control?.querySelectorAll(".multi-select-selected-text") || [])].map((item) => item.textContent.trim()).filter(Boolean)
    };
  };
  const buyingPaths = [...document.querySelectorAll('select[name$="__likelyBuyerPath"]')].map((select) => select.value);
  const recommendationSelect = document.querySelector('select[name$="__validationRecommendationReview"]');
  const recommendationPreview = document.querySelector('[data-validation-test-preview="true"]');
  const evidenceNotes = document.querySelector('[name$="__evidenceNotes"]');
  const evidenceNotesWrapper = evidenceNotes?.closest('[data-field-label]');
  return {
    buyingPaths,
    buyerRoles: clickFirst("__likelyBuyerChannel"),
    firstAccess: clickFirst("__firstConversationAccess"),
    repeatableReach: clickFirst("__repeatableReach"),
    oldFieldsAbsent: ["__reachability", "__validationPathDtc", "__validationPathChannel", "__buyingRequirements", "__implementationRequirements", "__successRequirements"].every((suffix) => !document.querySelector(`[name$="${suffix}"]`)),
    recommendationReviewPresent: Boolean(document.querySelector('select[name$="__validationRecommendationReview"]')),
    recommendationPreview: {
      count: document.querySelectorAll('[data-validation-test-preview="true"]').length,
      text: recommendationPreview?.textContent.trim() || "",
      appearsBeforeChoice: Boolean(recommendationPreview && recommendationSelect && (recommendationPreview.compareDocumentPosition(recommendationSelect) & Node.DOCUMENT_POSITION_FOLLOWING)),
      label: recommendationSelect?.closest("div")?.querySelector("label")?.textContent.trim() || "",
      optionLabels: [...(recommendationSelect?.options || [])].map((option) => option.textContent.trim()),
      savedValue: recommendationSelect?.value || ""
    },
    evidenceNotesGuidance: {
      label: evidenceNotesWrapper?.dataset.fieldLabel || "",
      hint: evidenceNotesWrapper?.querySelector(".hint")?.textContent.trim() || "",
      placeholder: evidenceNotes?.getAttribute("placeholder") || ""
    },
    checklistReviewPresent: Boolean(document.querySelector('select[name$="__validationChecklistReview"]'))
  };
});
await page.evaluate(() => saveDraft(false));
await page.reload({ waitUntil: "networkidle" });
await page.evaluate(() => switchActiveSection("preRevenueHypotheses"));
const persistedSelected = await page.evaluate(() => [
  "__likelyBuyerChannel",
  "__firstConversationAccess",
  "__repeatableReach"
].every((suffix) => {
  const control = [...document.querySelectorAll('[data-multi-select-dropdown="true"]')].find((item) => item.dataset.fieldName?.endsWith(suffix));
  return Boolean(control?.querySelector(".multi-select-selected-text"));
}));

const reportPage = await context.newPage();
reportPage.on("pageerror", (error) => pageErrors.push(error.message));
await reportPage.route("**/api/records**", async (route) => {
  const pathname = new URL(route.request().url()).pathname;
  await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(pathname === "/api/records" ? { records: [record] } : { record }) });
});
await reportPage.goto(`${baseUrl}/results.html?recordId=${recordId}&asset=validation`, { waitUntil: "networkidle" });
await reportPage.waitForSelector("#plan-decision");
const report = await reportPage.evaluate(() => {
  const decision = document.getElementById("plan-decision")?.innerText || "";
  const fullText = document.body.textContent || "";
  const recommendationText = document.getElementById("recommendation")?.textContent || "";
  return {
    overrideLeads: /First segment to test[\s\S]*Problem-aware buyers/i.test(decision),
    conflictFlagged: /User override/i.test(decision) && /Score conflict/i.test(decision) && /Small businesses or teams/i.test(decision),
    generatedTestPresent: /Recommended 30-day test/i.test(fullText),
    headerFlagsOverride: /User override active/i.test(recommendationText),
    recommendationText
  };
});

await browser.close();
const checks = {
  exactlyTwoModes: company.toolModes.filter((item) => item !== "Select one").length === 2 && !company.toolModes.some((item) => /founder/i.test(item)),
  simplifiedBusinessTypes: company.businessTypes.some((item) => /Physical Product/i.test(item)) && !company.businessTypes.some((item) => /DTC Ecommerce Brand/i.test(item)),
  legacyBusinessTypeMigrated: company.businessTypeValue === "physical_product_business",
  twoRevenueModels: company.revenueModels.filter((item) => item !== "Select one").length === 2 && company.revenueModels.includes("Recurring Revenue Model") && company.revenueModels.includes("Standard Revenue Model"),
  noBlankRevenueModelChoice: !company.revenueModelHasBlankChoice,
  legacyRevenueModelMigrated: company.revenueModelValue === "Recurring Revenue Model",
  preRevenueDerived: company.derivedStage === "Pre-revenue" && company.derivedRevenue === "Pre-revenue" && company.derivedControlsLocked,
  expectedRevenueModelQuestion: company.expectedRevenueLabel === "Expected revenue model",
  companyBranchSimplified: company.hiddenFieldsAbsent && company.postRevenueTablesAbsent && company.routeVisible && company.comparablesVisible && company.guidancePresent,
  comparableResearchPromptPreservesReview: company.researchPromptUsesComparables,
  buyingPathPrefilled: hypotheses.buyingPaths.length >= 2 && hypotheses.buyingPaths.every((value) => value === "Retail, wholesale, distributor, or marketplace"),
  selectedAnswersVisible: [hypotheses.buyerRoles, hypotheses.firstAccess, hypotheses.repeatableReach].every((item) => item.exists && item.selected.length),
  selectedAnswersPersist: persistedSelected,
  firstWinSimplified: hypotheses.oldFieldsAbsent && hypotheses.recommendationReviewPresent && hypotheses.checklistReviewPresent,
  recommendedTestVisibleBeforeChoice: hypotheses.recommendationPreview.count >= 2
    && hypotheses.recommendationPreview.appearsBeforeChoice
    && /Recommended 30-day test/i.test(hypotheses.recommendationPreview.text)
    && /Build a 25-account sourcing pool/i.test(hypotheses.recommendationPreview.text)
    && /Use this recommended 30-day test\?/i.test(hypotheses.recommendationPreview.label)
    && ["Use this test", "Revise this test", "Not sure yet"].every((label) => hypotheses.recommendationPreview.optionLabels.includes(label))
    && hypotheses.recommendationPreview.savedValue === "Use the recommended test",
  evidenceNotesExplainsReportUse: /optional/i.test(hypotheses.evidenceNotesGuidance.label)
    && /Evidence Available section/i.test(hypotheses.evidenceNotesGuidance.hint)
    && /Persona Brief/i.test(hypotheses.evidenceNotesGuidance.hint)
    && /evidence-strength assessment/i.test(hypotheses.evidenceNotesGuidance.hint)
    && /leave this blank/i.test(hypotheses.evidenceNotesGuidance.hint)
    && /4 retail buyers/i.test(hypotheses.evidenceNotesGuidance.placeholder),
  overrideLeadsAndFlagsConflict: report.overrideLeads && report.conflictFlagged,
  generatedTestPresent: report.generatedTestPresent,
  noPageErrors: pageErrors.length === 0
};
const failures = Object.entries(checks).filter(([, passed]) => !passed).map(([check]) => check);
console.log(JSON.stringify({ checks: Object.keys(checks).length, passed: Object.keys(checks).length - failures.length, failed: failures.length, failures, company, hypotheses, report, pageErrors }, null, 2));
if (failures.length) process.exitCode = 1;
