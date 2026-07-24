import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const cookie = process.env.GTM_QA_COOKIE || "";
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  ...(cookie ? { extraHTTPHeaders: { Cookie: cookie } } : {})
});
const page = await context.newPage();
const errors = [];
const assistantRequests = [];
const savedWrites = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.route("**/api/records/**", async (route) => {
  if (!["PUT", "POST"].includes(route.request().method())) {
    await route.continue();
    return;
  }
  const body = route.request().postDataJSON();
  savedWrites.push(body);
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ record: body })
  });
});
await page.route("**/api/assistant", async (route) => {
  const body = route.request().postDataJSON();
  assistantRequests.push(body);
  const reviewing = body.field?.requestType === "review";
  const answer = reviewing && body.field?.id === "quickBuyerProblem"
    ? "Specialty retailers struggle to identify differentiated products their customers will buy without taking on slow-moving inventory."
    : reviewing && body.field?.id === "provenCustomerOutcomes"
      ? "Increase margin"
    : body.field?.answerMode === "ask_directly"
    ? "Describe only relevant experience, relationships, credibility, or market access that you or the team actually have."
    : body.field?.id === "quickPrimaryRevenueSource"
      ? "Network referrals"
      : body.field?.id === "quick90DayGoal"
        ? "Customer validation"
      : "A focused recommendation based on the saved company context.";
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({
      answer,
      assessment: reviewing ? "The current answer is broad and does not explain the consequence for the selected customer." : "",
      model: "qa-intercept"
    })
  });
});

async function inspect(url, selector) {
  await page.goto(`${baseUrl}${url}`, { waitUntil: "load" });
  await page.waitForSelector(selector, { state: "attached", timeout: 15000 });
  await page.waitForTimeout(150);
  return page.evaluate(() => {
    const config = window.GTM_INTAKE_SCHEMA.aiAssistance;
    return {
      config,
      researchAvailable: typeof window.GTM_INTAKE_AI?.openResearch === "function",
      derivedRecommendationCount: document.querySelectorAll("[data-field-recommendation-key], [data-dropdown-recommendation-key]").length,
      help: Array.from(document.querySelectorAll(".ai-field-help")).map((item) => ({
        fieldId: item.closest("[data-field-id]")?.dataset.fieldId,
        mode: item.dataset.aiMode,
        label: item.querySelector(".ai-field-help-button")?.textContent.trim(),
        useHidden: item.querySelector("[data-use-ai-field]")?.hidden
      }))
    };
  });
}

try {
  const post = await inspect("/index.html?section=executiveQuickReview&recordId=qa3-post-mixed-trailpour-20260724#executiveQuickReview", "#executiveQuickReview");
  const preContext = await inspect("/index.html?section=preRevenueContext&recordId=qa3-pre-dtc-roamready-20260724#preRevenueContext", "#preRevenueContext");
  const preHypothesis = await inspect("/index.html?section=preRevenueHypotheses&recordId=qa3-pre-dtc-roamready-20260724#preRevenueHypotheses", "#preRevenueHypotheses");
  const preMotion = await inspect("/index.html?section=preRevenueValidationMotion&recordId=qa3-pre-dtc-roamready-20260724#preRevenueValidationMotion", '[data-field-id="preMessageProofPoint"]');
  await page.goto(`${baseUrl}/index.html?section=executiveQuickReview&recordId=qa3-post-mixed-trailpour-20260724#executiveQuickReview`, { waitUntil: "load" });
  await page.waitForFunction(() => Boolean(document.querySelector('[name="quickPrimaryRevenueSource"]')?.value), null, { timeout: 15000 });
  const buyerProblem = page.locator('[data-field-id="quickBuyerProblem"]');
  const originalBuyerProblem = await buyerProblem.locator('[name="quickBuyerProblem"]').inputValue();
  const writesBeforeReview = savedWrites.length;
  await buyerProblem.locator("[data-review-ai-field]").click();
  await buyerProblem.locator(".ai-field-suggestion").waitFor({ state: "visible" });
  const buyerProblemReview = {
    assessment: await buyerProblem.locator("[data-ai-review-note]").innerText(),
    proposal: await buyerProblem.locator(".ai-field-suggestion p").innerText(),
    valueBeforeUse: await buyerProblem.locator('[name="quickBuyerProblem"]').inputValue(),
    writesBeforeUse: savedWrites.length
  };
  const reviewRequest = assistantRequests.find((request) => request.field?.id === "quickBuyerProblem" && request.field?.requestType === "review");
  await buyerProblem.locator("[data-use-ai-field]").click();
  await page.waitForFunction(() => document.querySelector('[name="quickBuyerProblem"]')?.value.includes("Specialty retailers struggle"), null, { timeout: 15000 });
  const reviewedBuyerProblemValue = await buyerProblem.locator('[name="quickBuyerProblem"]').inputValue();
  await page.goto(`${baseUrl}/index.html?section=traction&recordId=qa3-post-mixed-trailpour-20260724#traction`, { waitUntil: "load" });
  await page.waitForFunction(() => typeof showDetailedSections === "function" && typeof switchActiveSection === "function", null, { timeout: 15000 });
  await page.evaluate(() => {
    showDetailedSections();
    switchActiveSection("traction");
  });
  await page.waitForFunction(() => Boolean(document.querySelector('[data-field-id="provenCustomerOutcomes"] [data-multi-select-dropdown="true"]')?.value), null, { timeout: 15000 });
  const proofOutcomes = page.locator('[data-field-id="provenCustomerOutcomes"]');
  const postProofHelpPresent = await proofOutcomes.locator(".ai-field-help").count() === 1;
  const originalProofOutcomes = await proofOutcomes.locator('[data-multi-select-dropdown="true"]').evaluate((control) => control.value);
  await proofOutcomes.locator("[data-review-ai-field]").click();
  await proofOutcomes.locator(".ai-field-suggestion").waitFor({ state: "visible" });
  const proofValueBeforeUse = await proofOutcomes.locator('[data-multi-select-dropdown="true"]').evaluate((control) => control.value);
  await proofOutcomes.locator("[data-use-ai-field]").click();
  await page.waitForFunction(() => document.querySelector('[data-field-id="provenCustomerOutcomes"] [data-multi-select-dropdown="true"]')?.value === "Increase margin", null, { timeout: 15000 });
  const reviewedProofValue = await proofOutcomes.locator('[data-multi-select-dropdown="true"]').evaluate((control) => control.value);
  const proofReviewRequest = assistantRequests.find((request) => request.field?.id === "provenCustomerOutcomes" && request.field?.requestType === "review");
  await page.goto(`${baseUrl}/index.html?section=executiveQuickReview&recordId=qa3-post-mixed-trailpour-20260724#executiveQuickReview`, { waitUntil: "load" });
  await page.waitForFunction(() => Boolean(document.querySelector('[name="quickPrimaryRevenueSource"]')?.value), null, { timeout: 15000 });
  const revenueSource = page.locator('[data-field-id="quickPrimaryRevenueSource"]');
  const originalRevenueSource = await revenueSource.locator('[name="quickPrimaryRevenueSource"]').inputValue();
  await revenueSource.locator(".ai-field-help-button:not([data-review-ai-field])").click();
  await revenueSource.locator(".ai-field-suggestion").waitFor({ state: "visible" });
  const recommendationState = {
    text: await revenueSource.locator(".ai-field-suggestion p").innerText(),
    valueBeforeUse: await revenueSource.locator('[name="quickPrimaryRevenueSource"]').inputValue(),
    useVisible: await revenueSource.locator("[data-use-ai-field]").isVisible()
  };
  await page.goto(`${baseUrl}/index.html?section=preRevenueContext&recordId=qa3-pre-dtc-roamready-20260724#preRevenueContext`, { waitUntil: "load" });
  await page.waitForFunction(() => Boolean(document.querySelector('[name="preFounderBackground"]')?.value), null, { timeout: 15000 });
  const founderBackground = page.locator('[data-field-id="preFounderBackground"]');
  const originalBackground = await founderBackground.locator('[name="preFounderBackground"]').inputValue();
  await founderBackground.locator(".ai-field-help-button:not([data-review-ai-field])").click();
  await founderBackground.locator(".ai-field-suggestion").waitFor({ state: "visible" });
  const explanationState = {
    valueAfterHelp: await founderBackground.locator('[name="preFounderBackground"]').inputValue(),
    useHidden: await founderBackground.locator("[data-use-ai-field]").isHidden()
  };
  const recommendationRequest = assistantRequests.find((request) => request.field?.id === "quickPrimaryRevenueSource");
  const explanationRequest = assistantRequests.find((request) => request.field?.id === "preFounderBackground");
  const recommendationContext = JSON.parse(recommendationRequest?.pageContext || "{}");
  await page.goto(`${baseUrl}/index.html?section=preRevenueHypotheses&recordId=qa3-pre-dtc-roamready-20260724#preRevenueHypotheses`, { waitUntil: "load" });
  const customerContext = page.locator('[data-field-id="customerContextStarter"]');
  const requestsBeforeCustomerCoaching = assistantRequests.length;
  await customerContext.locator(".ai-field-help-button:not([data-review-ai-field])").click();
  const customerCoaching = customerContext.locator(".ai-field-coaching");
  await customerCoaching.waitFor({ state: "visible" });
  const noRequestBeforeCustomerAnswers = assistantRequests.length === requestsBeforeCustomerCoaching;
  const customerQuestionCount = await customerCoaching.locator("textarea").count();
  await customerCoaching.locator("textarea").first().fill("Parents of children ages 4-8 preparing for air travel.");
  await customerCoaching.locator("[data-build-ai-field]").click();
  await customerContext.locator(".ai-field-suggestion").waitFor({ state: "visible" });
  const customerRequest = assistantRequests.find((request) => request.field?.id === "customerContextStarter");
  const customerContextPayload = JSON.parse(customerRequest?.pageContext || "{}");
  await page.goto(`${baseUrl}/index.html?section=executiveQuickReview&recordId=qa3-post-mixed-trailpour-20260724#executiveQuickReview`, { waitUntil: "load" });
  await page.waitForFunction(() => Boolean(document.querySelector('[name="quick90DayGoal"]')?.value), null, { timeout: 15000 });
  const goal = page.locator('[data-field-id="quick90DayGoal"]');
  await goal.locator('[name="quick90DayGoal"]').selectOption({ label: "Not sure yet" });
  const uncertaintyLabel = await goal.locator(".ai-field-help-button:not([data-review-ai-field])").innerText();
  const requestsBeforeUncertainty = assistantRequests.length;
  await goal.locator(".ai-field-help-button:not([data-review-ai-field])").click();
  const goalCoaching = goal.locator(".ai-field-coaching");
  await goalCoaching.waitFor({ state: "visible" });
  const uncertaintyQuestionCount = await goalCoaching.locator("textarea").count();
  const noRequestBeforeUncertaintyAnswers = assistantRequests.length === requestsBeforeUncertainty;
  await goalCoaching.locator("textarea").first().fill("Decide whether retail buyers will place an initial order.");
  await goalCoaching.locator("[data-build-ai-field]").click();
  await goal.locator(".ai-field-suggestion").waitFor({ state: "visible" });
  const goalRequest = assistantRequests.find((request) => request.field?.id === "quick90DayGoal");
  const goalPayload = JSON.parse(goalRequest?.pageContext || "{}");
  await goal.locator("[data-use-ai-field]").click();
  await page.waitForFunction(() => document.querySelector('[name="quick90DayGoal"]')?.value === "Customer validation", null, { timeout: 15000 });
  const savedGoalValue = await goal.locator('[name="quick90DayGoal"]').inputValue();
  const config = post.config;
  const requiredModes = ["ask_directly", "recommend_from_existing_answers", "adaptive_coaching"];
  const allItems = Object.values(config);
  const postIds = new Set(post.help.map((item) => item.fieldId));
  const checks = {
    metadataExists: Object.keys(config).length >= 13,
    requiredModesCovered: requiredModes.every((mode) => allItems.some((item) => item.mode === mode)),
    fiveOpportunityModesAvailable: requiredModes.every((mode) => allItems.some((item) => item.mode === mode))
      && post.researchAvailable
      && preMotion.derivedRecommendationCount > 0,
    dependenciesDeclared: allItems.every((item) => Array.isArray(item.contextDependencies)),
    evidenceRestrictionsDeclared: allItems.every((item) => String(item.evidenceRestriction || "").length > 20),
    followUpRulesDeclared: allItems.every((item) => Array.isArray(item.followUpRules) && item.followUpRules.length > 0),
    promptsDeclared: allItems.every((item) => String(item.prompt || "").length > 20),
    reviewCriteriaCoverDecisionFields: ["customerContextStarter", "quickBestFitCustomer", "quickBuyerProblem", "quickUrgencyNow", "quickOfferPromise", "quickSuccessMeasure", "provenCustomerOutcomes", "preMessageProofPoint", "quickPrimaryRevenueSource", "quickCurrentSalesMotion", "quick90DayGoal", "quickBiggestConstraint"].every((id) => Array.isArray(config[id]?.reviewCriteria) && config[id].reviewCriteria.length >= 3),
    broadProblemUsesAdaptiveCoaching: config.quickBuyerProblem.mode === "adaptive_coaching" && config.quickBuyerProblem.coachingQuestions.length === 3,
    broadOfferUsesAdaptiveCoaching: config.quickOfferPromise.mode === "adaptive_coaching" && config.quickOfferPromise.coachingQuestions.length === 3,
    vagueMeasureUsesAdaptiveCoaching: config.quickSuccessMeasure.mode === "adaptive_coaching" && config.quickSuccessMeasure.coachingQuestions.length === 3,
    proofUsesAdaptiveCoaching: config.provenCustomerOutcomes.mode === "adaptive_coaching" && config.preMessageProofPoint.mode === "adaptive_coaching",
    postRevenueDecisionHelpPresent: ["quickBestFitCustomer", "quickBuyerProblem", "quickUrgencyNow", "quickOfferPromise", "quickSuccessMeasure", "quickStopAvoid", "quickPrimaryRevenueSource", "quickCurrentSalesMotion", "quick90DayGoal", "quickBiggestConstraint"].every((id) => postIds.has(id)),
    selectHelpSupported: post.help.some((item) => item.fieldId === "quickPrimaryRevenueSource") && post.help.some((item) => item.fieldId === "quickCurrentSalesMotion"),
    recommendationShownBeforeWriteback: recommendationState.text === "Network referrals" && recommendationState.valueBeforeUse === originalRevenueSource && recommendationState.useVisible,
    reviewActionVisibleForAnsweredField: await buyerProblem.locator("[data-review-ai-field]").isVisible(),
    reviewExplainsImprovement: buyerProblemReview.assessment.includes("broad") && buyerProblemReview.assessment.includes("consequence"),
    reviewShowsRevisionBeforeWriteback: buyerProblemReview.proposal.includes("Specialty retailers struggle") && buyerProblemReview.valueBeforeUse === originalBuyerProblem && buyerProblemReview.writesBeforeUse === writesBeforeReview,
    reviewRequestIsScopedAndConservative: reviewRequest?.field?.requestType === "review" && reviewRequest?.field?.reviewCriteria?.length >= 3 && Object.keys(JSON.parse(reviewRequest?.pageContext || "{}")).every((key) => ["companyName", "toolMode", ...config.quickBuyerProblem.contextDependencies].includes(key)),
    reviewedAnswerRequiresExplicitUse: reviewedBuyerProblemValue.includes("Specialty retailers struggle") && savedWrites.some((write) => write.data?.quickBuyerProblem === reviewedBuyerProblemValue),
    recommendationContextIsScoped: Object.keys(recommendationContext).every((key) => ["companyName", "toolMode", ...config.quickPrimaryRevenueSource.contextDependencies].includes(key)),
    requestCarriesEvidenceRules: recommendationRequest?.field?.evidenceRestriction === config.quickPrimaryRevenueSource.evidenceRestriction,
    recommendationLabelsClear: post.help.filter((item) => item.mode === "recommend_from_existing_answers").every((item) => item.label === "Get our recommendation"),
    adaptiveLabelsClear: post.help.filter((item) => item.mode === "adaptive_coaching" && config[item.fieldId]?.coachingQuestions?.length).every((item) => item.label === "Improve with guided questions"),
    customerRecommendationAtQuestion: [...preContext.help, ...preHypothesis.help].some((item) => item.fieldId === "customerContextStarter" && item.label === "Improve with guided questions"),
    preRevenueHypothesisHelpPresent: preHypothesis.help.some((item) => item.fieldId === "preHypothesisNotes"),
    postRevenueProofHelpPresent: postProofHelpPresent,
    preRevenueProofHelpPresent: preMotion.help.some((item) => item.fieldId === "preMessageProofPoint"),
    multiSelectReviewPreservesBeforeUse: proofValueBeforeUse === originalProofOutcomes,
    multiSelectReviewWritesOnlyApprovedOption: reviewedProofValue === "Increase margin" && proofReviewRequest?.field?.options?.includes("Increase margin") && savedWrites.some((write) => write.data?.provenCustomerOutcomes === "Increase margin"),
    privateFactUsesExplanation: preContext.help.some((item) => item.fieldId === "preFounderBackground" && item.mode === "ask_directly" && item.label === "Explain this question" && item.useHidden),
    privateFactRemainsUnchanged: explanationState.valueAfterHelp === originalBackground && explanationState.useHidden,
    privateFactRequestIsExplanationOnly: explanationRequest?.field?.answerMode === "ask_directly",
    adaptiveQuestionsShownBeforeAiCall: noRequestBeforeCustomerAnswers && customerQuestionCount === 3,
    adaptiveAnswersScopedIntoRequest: Array.isArray(customerContextPayload.guidedFollowUpAnswers) && customerContextPayload.guidedFollowUpAnswers[0]?.answer.includes("ages 4-8"),
    uncertaintyOptionAvailable: await goal.locator('[name="quick90DayGoal"] option').filter({ hasText: "Not sure yet" }).count() === 1,
    uncertaintyPathNamedClearly: uncertaintyLabel === "Help me narrow this down",
    uncertaintyQuestionsBeforeAiCall: uncertaintyQuestionCount === 3 && noRequestBeforeUncertaintyAnswers,
    uncertaintyAnswerScopedIntoRequest: Array.isArray(goalPayload.guidedFollowUpAnswers) && goalPayload.guidedFollowUpAnswers[0]?.answer.includes("retail buyers"),
    uncertaintyRecommendationUsesValidOption: await goal.locator(".ai-field-suggestion p").innerText() === "Customer validation",
    explicitUseWritesSelectedAnswer: savedGoalValue === "Customer validation" && savedWrites.some((write) => write.data?.quick90DayGoal === "Customer validation"),
    noHardCodedCompanyExample: !JSON.stringify(config).includes("Fishing Shorts") && !JSON.stringify(config).includes("ForgeLine"),
    noPageErrors: errors.length === 0
  };
  const failures = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
  console.log(JSON.stringify({
    checks: Object.keys(checks).length,
    passed: Object.keys(checks).length - failures.length,
    failed: failures.length,
    failures,
    configuredFields: Object.keys(config),
    recommendationState,
    buyerProblemReview,
    proofReview: {
      originalProofOutcomes,
      proofValueBeforeUse,
      reviewedProofValue,
      suppliedOptions: proofReviewRequest?.field?.options,
      savedValues: savedWrites.map((write) => write.data?.provenCustomerOutcomes).filter(Boolean)
    },
    originalRevenueSource,
    assistantRequestFields: assistantRequests.map((request) => request.field?.id),
    adaptiveDiagnostics: {
      requestsBeforeCustomerCoaching,
      requestsAfterCustomerCoaching: assistantRequests.indexOf(customerRequest),
      customerQuestionCount
    },
    errors
  }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await context.close();
  await browser.close();
}
