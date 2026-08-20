import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.GTM_PLAYWRIGHT_PATH || "playwright");
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
  preCurrentWorkaroundChannel: "Customer requests only; Manual buying process",
  "preRevenueComparables__comparable-1__name": "Example Sock Brand",
  "preRevenueComparables__comparable-1__url": "https://example.com/socks",
  "preRevenueComparables__comparable-1__whyComparable": "Similar product and wholesale route",
  prePrimaryHypothesis: "Problem-aware buyers",
  "preCustomerHypotheses__first-win-segment-1__segmentName": "Small businesses or teams",
  "preCustomerHypotheses__first-win-segment-1__problem": "Current products do not solve the use case well",
  "preCustomerHypotheses__first-win-segment-1__whyNow": "Seasonal need or buying window",
  "preCustomerHypotheses__first-win-segment-1__evidenceAvailableChannel": "Channel buyer, partner, or account conversation; Distributor, partner, reseller, or marketplace feedback; Founder experience with this channel",
  "preCustomerHypotheses__first-win-segment-1__credibility": "Founder experience with this channel",
  "preCustomerHypotheses__first-win-segment-1__risks": "Brand, product, service, or founder story is not strong enough",
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
  "preCustomerHypotheses__first-win-segment-2__firstConversationAccess": "Founder network",
  "preCustomerHypotheses__first-win-segment-2__evidenceAvailableChannel": "Channel buyer, partner, or account conversation; Distributor, partner, reseller, or marketplace feedback; Founder experience with this channel",
  "preCustomerHypotheses__first-win-segment-2__credibility": "Founder experience with this channel",
  "preCustomerHypotheses__first-win-segment-2__risks": "Brand, product, service, or founder story is not strong enough",
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

await page.evaluate(() => switchActiveSection("preRevenueProblem"));
await page.waitForSelector("#preRevenueProblem");
const problemHypothesis = await page.evaluate(() => {
  const control = document.querySelector('[data-multi-select-dropdown][data-field-name="preCurrentWorkaroundChannel"]');
  const wrapper = control?.closest('[data-field-label]');
  return {
    label: wrapper?.dataset.fieldLabel || "",
    hint: wrapper?.querySelector(".hint")?.textContent.trim() || "",
    options: [...(control?.querySelectorAll('input[type="checkbox"]') || [])].map((input) => input.value),
    selected: [...(control?.querySelectorAll(".multi-select-selected-text") || [])].map((item) => item.textContent.trim()).filter(Boolean)
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
  const checklistPreview = document.querySelector('[data-validation-checklist-preview="true"]');
  const checklistMissing = document.querySelector('[name$="__validationChecklistMissing"]');
  const checklistMissingWrapper = checklistMissing?.closest('[data-field-label]');
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
    checklist: {
      approvalRemoved: !document.querySelector('select[name$="__validationChecklistReview"]'),
      count: document.querySelectorAll('[data-validation-checklist-preview="true"]').length,
      text: checklistPreview?.textContent.trim() || "",
      appearsBeforeMissingField: Boolean(checklistPreview && checklistMissing && (checklistPreview.compareDocumentPosition(checklistMissing) & Node.DOCUMENT_POSITION_FOLLOWING)),
      missingFieldVisible: Boolean(checklistMissing && !checklistMissing.closest("[hidden]")),
      missingLabel: checklistMissingWrapper?.dataset.fieldLabel || "",
      missingHint: checklistMissingWrapper?.querySelector(".hint")?.textContent.trim() || "",
      missingPlaceholder: checklistMissing?.getAttribute("placeholder") || ""
    }
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

await page.evaluate(() => switchActiveSection("preRevenueValidationMotion"));
await page.waitForSelector("#preRevenueValidationMotion");
await page.waitForTimeout(150);
const validationRecommendations = await page.evaluate(() => {
  const inspect = (fieldName) => {
    const control = document.querySelector(`[data-multi-select-dropdown][data-field-name="${fieldName}"]`);
    const helper = [...(control?.querySelectorAll('input[type="checkbox"]') || [])].find((input) => input.value === "Use our recommendations");
    const recommendation = control?.querySelector(".multi-select-recommendation");
    const trigger = control?.querySelector(".multi-select-trigger");
    const recommended = [...(control?.querySelectorAll(".checkbox-option.recommended-option") || [])].map((label) => ({
      value: label.querySelector('input[type="checkbox"]')?.value || "",
      badge: label.querySelector(".recommended-option-badge")?.textContent.trim() || ""
    }));
    const helperEnabled = Boolean(helper && !helper.disabled);
    if (helperEnabled && !helper.checked) helper.click();
    return {
      helperEnabled,
      helperChecked: Boolean(helper?.checked),
      recommended,
      selected: [...(control?.querySelectorAll(".multi-select-selected-text") || [])].map((item) => item.textContent.trim()).filter(Boolean),
      explanationBeforeDropdown: Boolean(recommendation && trigger && (recommendation.compareDocumentPosition(trigger) & Node.DOCUMENT_POSITION_FOLLOWING)),
      hasGuidedHelp: Boolean(control?.closest("[data-field-id]")?.querySelector(".ai-field-help"))
    };
  };
  return {
    audience: inspect("preTargetListWho"),
    proof: inspect("preMessageProofPoint")
  };
});

const reportPage = await context.newPage();
reportPage.on("pageerror", (error) => pageErrors.push(error.message));
await reportPage.route("**/api/records**", async (route) => {
  const pathname = new URL(route.request().url()).pathname;
  await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(pathname === "/api/records" ? { records: [record] } : { record }) });
});
await reportPage.goto(`${baseUrl}/results.html?recordId=${recordId}&asset=validation`, { waitUntil: "networkidle" });
await reportPage.waitForSelector("#plan-decision");
const report = await reportPage.evaluate(() => {
  const decision = document.getElementById("plan-decision")?.textContent || "";
  const fullText = document.body.textContent || "";
  const recommendationText = document.getElementById("recommendation")?.textContent || "";
  const handoff = document.getElementById("validation-plan-handoff");
  const bottomAction = document.getElementById("validation-workspace-action");
  const handoffPrimary = handoff?.querySelector(".report-bottom-actions a");
  const bottomPrimary = bottomAction?.querySelector(".report-bottom-actions a");
  const assetForLink = (container, label) => {
    const link = [...(container?.querySelectorAll("a") || [])].find((item) => item.textContent.trim() === label);
    return link ? new URL(link.href).searchParams.get("asset") : "";
  };
  return {
    overrideLeads: /First segment to test[\s\S]*Problem-aware buyers/i.test(decision),
    conflictFlagged: /User override/i.test(decision) && /Score conflict/i.test(decision) && /Small businesses or teams/i.test(decision),
    generatedTestPresent: /Recommended 30-day test/i.test(fullText),
    headerFlagsOverride: /User override active/i.test(recommendationText),
    completionHandoff: {
      text: handoff?.textContent || "",
      navigationLabels: [...document.querySelectorAll("#reportToc .asset-nav-label")].map((item) => item.textContent.trim()),
      primaryLabel: handoffPrimary?.textContent.trim() || "",
      primaryAsset: handoffPrimary ? new URL(handoffPrimary.href).searchParams.get("asset") : "",
      workspaceAsset: assetForLink(handoff, "Open Validation Workspace"),
      bottomText: bottomAction?.textContent || "",
      bottomPrimaryLabel: bottomPrimary?.textContent.trim() || "",
      bottomPrimaryAsset: bottomPrimary ? new URL(bottomPrimary.href).searchParams.get("asset") : "",
      bottomWorkspaceAsset: assetForLink(bottomAction, "Open Validation Workspace")
    },
    recommendationText
  };
});

await reportPage.goto(`${baseUrl}/results.html?recordId=${recordId}&asset=active`, { waitUntil: "networkidle" });
await reportPage.waitForSelector("#active-plan-objective");
const toolSetupFlow = await reportPage.evaluate(() => ({
  title: document.getElementById("companyName")?.textContent || "",
  meta: document.getElementById("generatedMeta")?.textContent || "",
  navigationLabels: [...document.querySelectorAll("#reportToc .asset-nav-label")].map((item) => item.textContent.trim()),
  taskCount: document.querySelectorAll("#active-plan-objective .active-plan-tool-card").length,
  taskText: document.querySelector("#active-plan-objective .active-plan-tool-card")?.textContent || "",
  setupText: document.getElementById("active-plan-objective")?.textContent || ""
}));

await reportPage.goto(`${baseUrl}/results.html?recordId=${recordId}&asset=icp`, { waitUntil: "networkidle" });
await reportPage.waitForSelector("#draft-icp");
const icpApprovalControlsAbsent = await reportPage.evaluate(() => !document.getElementById("guidedReferenceCompletion") && !document.getElementById("guidedToolSecondaryControls"));

await reportPage.goto(`${baseUrl}/results.html?recordId=${recordId}&asset=personas`, { waitUntil: "networkidle" });
await reportPage.waitForSelector("#persona-overview");
const personaApprovalControlsAbsent = await reportPage.evaluate(() => !document.getElementById("guidedReferenceCompletion") && !document.getElementById("guidedToolSecondaryControls"));

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
  channelAlternativesAreBuyerChoices: /does not choose your offer/i.test(problemHypothesis.label)
    && /specific competitor, supplier, product, service, tool, or workaround/i.test(problemHypothesis.hint)
    && [
      "Keep the current assortment, workflow, or solution unchanged",
      "Reorder or expand an existing supplier, vendor, product, or service",
      "Buy a competing brand, product, service, or tool",
      "Choose a lower-cost or generic substitute",
      "Use a private-label, white-label, or custom option",
      "Handle it internally with the current team, process, or tools",
      "Combine multiple products, vendors, or manual workarounds",
      "Source something only after receiving a confirmed customer request",
      "Delay the decision until a future budget, buying, or assortment window",
      "Do nothing and continue living with the problem",
      "I don't know yet",
      "Other"
    ].every((option) => problemHypothesis.options.includes(option))
    && !["Customer requests only", "Manual buying process"].some((option) => problemHypothesis.options.includes(option))
    && problemHypothesis.selected.includes("Source something only after receiving a confirmed customer request")
    && problemHypothesis.selected.includes("Handle it internally with the current team, process, or tools"),
  buyingPathPrefilled: hypotheses.buyingPaths.length >= 2 && hypotheses.buyingPaths.every((value) => value === "Retail, wholesale, distributor, or marketplace"),
  selectedAnswersVisible: [hypotheses.buyerRoles, hypotheses.firstAccess, hypotheses.repeatableReach].every((item) => item.exists && item.selected.length),
  selectedAnswersPersist: persistedSelected,
  validationRecommendationsApplyExactChoices: validationRecommendations.audience.helperEnabled
    && validationRecommendations.audience.helperChecked
    && validationRecommendations.audience.explanationBeforeDropdown
    && validationRecommendations.audience.recommended.every((item) => item.badge === "Recommended")
    && [
      "People who match the selected first-win segment",
      "People who have the problem or buying job we are testing",
      "Retail, wholesale, distributor, marketplace, partner, or business buyers",
      "People in the founder's network"
    ].every((value) => validationRecommendations.audience.recommended.some((item) => item.value === value) && validationRecommendations.audience.selected.includes(value))
    && validationRecommendations.proof.helperEnabled
    && validationRecommendations.proof.helperChecked
    && validationRecommendations.proof.explanationBeforeDropdown
    && validationRecommendations.proof.recommended.every((item) => item.badge === "Recommended")
    && [
      "Founder has relevant experience",
      "User, buyer, or channel feedback exists"
    ].every((value) => validationRecommendations.proof.recommended.some((item) => item.value === value) && validationRecommendations.proof.selected.includes(value))
    && !validationRecommendations.proof.hasGuidedHelp,
  firstWinSimplified: hypotheses.oldFieldsAbsent && hypotheses.recommendationReviewPresent && hypotheses.checklist.approvalRemoved,
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
  generatedChecklistVisibleBeforeOptionalAddition: hypotheses.checklist.count >= 2
    && hypotheses.checklist.appearsBeforeMissingField
    && hypotheses.checklist.missingFieldVisible
    && /Generated validation checklist/i.test(hypotheses.checklist.text)
    && /Route to Market and Decision Path/i.test(hypotheses.checklist.text)
    && /Operational Requirements/i.test(hypotheses.checklist.text)
    && /Buyer Risks and Objections/i.test(hypotheses.checklist.text)
    && /Timing and Buying Window/i.test(hypotheses.checklist.text)
    && /Success Signals/i.test(hypotheses.checklist.text)
    && /optional/i.test(hypotheses.checklist.missingLabel)
    && /What to Validate Before Scaling/i.test(hypotheses.checklist.missingHint)
    && /Leave this blank/i.test(hypotheses.checklist.missingHint)
    && /retailers require specific packaging/i.test(hypotheses.checklist.missingPlaceholder),
  overrideLeadsAndFlagsConflict: report.overrideLeads && report.conflictFlagged,
  generatedTestPresent: report.generatedTestPresent,
  validationPlanExplainsWhatHappensNext: /Congratulations/i.test(report.completionHandoff.text)
    && /required Company Information is complete/i.test(report.completionHandoff.text)
    && /Now the work begins/i.test(report.completionHandoff.text)
    && /Each time you return/i.test(report.completionHandoff.text)
    && /ICP Brief and Persona Brief were generated/i.test(report.completionHandoff.text)
    && /Start the next workstream/i.test(report.completionHandoff.text)
    && /Plan, Assets, and Tools > Tool Setup/i.test(report.completionHandoff.text)
    && /It then becomes This Week/i.test(report.completionHandoff.text)
    && report.completionHandoff.navigationLabels.includes("Tool Setup")
    && report.completionHandoff.primaryLabel === "Continue Tool Setup"
    && report.completionHandoff.primaryAsset === "targets"
    && report.completionHandoff.workspaceAsset === "validation-workspace"
    && /Next: Work the Plan/i.test(report.completionHandoff.bottomText)
    && /working tools needed for Week 1/i.test(report.completionHandoff.bottomText)
    && /becomes This Week/i.test(report.completionHandoff.bottomText)
    && report.completionHandoff.bottomPrimaryLabel === "Continue Tool Setup"
    && report.completionHandoff.bottomPrimaryAsset === report.completionHandoff.primaryAsset
    && report.completionHandoff.bottomWorkspaceAsset === "validation-workspace",
  generatedBriefsBypassApprovalAndToolSetupStartsNext: /Tool Setup/i.test(toolSetupFlow.title)
    && /ICP Brief and Persona Brief are ready/i.test(toolSetupFlow.meta)
    && toolSetupFlow.navigationLabels.includes("Tool Setup")
    && toolSetupFlow.taskCount === 1
    && /Target List Setup/i.test(toolSetupFlow.taskText)
    && /Prepare the Tools for Week 1/i.test(toolSetupFlow.setupText)
    && /4 complete/i.test(toolSetupFlow.setupText)
    && icpApprovalControlsAbsent
    && personaApprovalControlsAbsent,
  noPageErrors: pageErrors.length === 0
};
const failures = Object.entries(checks).filter(([, passed]) => !passed).map(([check]) => check);
console.log(JSON.stringify({ checks: Object.keys(checks).length, passed: Object.keys(checks).length - failures.length, failed: failures.length, failures, company, problemHypothesis, hypotheses, validationRecommendations, report, toolSetupFlow, icpApprovalControlsAbsent, personaApprovalControlsAbsent, pageErrors }, null, 2));
if (failures.length) process.exitCode = 1;
