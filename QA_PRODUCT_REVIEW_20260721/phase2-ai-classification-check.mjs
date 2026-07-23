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
page.on("pageerror", (error) => errors.push(error.message));
await page.route("**/api/assistant", async (route) => {
  const body = route.request().postDataJSON();
  assistantRequests.push(body);
  const answer = body.field?.answerMode === "ask_directly"
    ? "Describe only relevant experience, relationships, credibility, or market access that you or the team actually have."
    : body.field?.id === "quickPrimaryRevenueSource"
      ? "Network referrals"
      : "A focused recommendation based on the saved company context.";
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ answer, model: "qa-intercept" })
  });
});

async function inspect(url, selector) {
  await page.goto(`${baseUrl}${url}`, { waitUntil: "load" });
  await page.waitForSelector(selector, { timeout: 15000 });
  await page.waitForTimeout(150);
  return page.evaluate(() => {
    const config = window.GTM_INTAKE_SCHEMA.aiAssistance;
    return {
      config,
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
  const post = await inspect("/index.html?section=executiveQuickReview&recordId=qa2-post-mixed-fieldsip-20260721#executiveQuickReview", "#executiveQuickReview");
  const preContext = await inspect("/index.html?section=preRevenueContext&recordId=qa2-pre-dtc-nesttrail-20260721#preRevenueContext", "#preRevenueContext");
  const preHypothesis = await inspect("/index.html?section=preRevenueHypotheses&recordId=qa2-pre-dtc-nesttrail-20260721#preRevenueHypotheses", "#preRevenueHypotheses");
  await page.goto(`${baseUrl}/index.html?section=executiveQuickReview&recordId=qa2-post-mixed-fieldsip-20260721#executiveQuickReview`, { waitUntil: "load" });
  const revenueSource = page.locator('[data-field-id="quickPrimaryRevenueSource"]');
  const originalRevenueSource = await revenueSource.locator('[name="quickPrimaryRevenueSource"]').inputValue();
  await revenueSource.locator(".ai-field-help-button").click();
  await revenueSource.locator(".ai-field-suggestion").waitFor({ state: "visible" });
  const recommendationState = {
    text: await revenueSource.locator(".ai-field-suggestion p").innerText(),
    valueBeforeUse: await revenueSource.locator('[name="quickPrimaryRevenueSource"]').inputValue(),
    useVisible: await revenueSource.locator("[data-use-ai-field]").isVisible()
  };
  await page.goto(`${baseUrl}/index.html?section=preRevenueContext&recordId=qa2-pre-dtc-nesttrail-20260721#preRevenueContext`, { waitUntil: "load" });
  const founderBackground = page.locator('[data-field-id="preFounderBackground"]');
  const originalBackground = await founderBackground.locator('[name="preFounderBackground"]').inputValue();
  await founderBackground.locator(".ai-field-help-button").click();
  await founderBackground.locator(".ai-field-suggestion").waitFor({ state: "visible" });
  const explanationState = {
    valueAfterHelp: await founderBackground.locator('[name="preFounderBackground"]').inputValue(),
    useHidden: await founderBackground.locator("[data-use-ai-field]").isHidden()
  };
  const recommendationRequest = assistantRequests.find((request) => request.field?.id === "quickPrimaryRevenueSource");
  const explanationRequest = assistantRequests.find((request) => request.field?.id === "preFounderBackground");
  const recommendationContext = JSON.parse(recommendationRequest?.pageContext || "{}");
  const config = post.config;
  const requiredModes = ["ask_directly", "recommend_from_existing_answers", "adaptive_coaching"];
  const allItems = Object.values(config);
  const postIds = new Set(post.help.map((item) => item.fieldId));
  const checks = {
    metadataExists: Object.keys(config).length >= 11,
    requiredModesCovered: requiredModes.every((mode) => allItems.some((item) => item.mode === mode)),
    dependenciesDeclared: allItems.every((item) => Array.isArray(item.contextDependencies)),
    evidenceRestrictionsDeclared: allItems.every((item) => String(item.evidenceRestriction || "").length > 20),
    followUpRulesDeclared: allItems.every((item) => Array.isArray(item.followUpRules) && item.followUpRules.length > 0),
    promptsDeclared: allItems.every((item) => String(item.prompt || "").length > 20),
    postRevenueDecisionHelpPresent: ["quickBestFitCustomer", "quickBuyerProblem", "quickUrgencyNow", "quickOfferPromise", "quickSuccessMeasure", "quickStopAvoid", "quickPrimaryRevenueSource", "quickCurrentSalesMotion"].every((id) => postIds.has(id)),
    selectHelpSupported: post.help.some((item) => item.fieldId === "quickPrimaryRevenueSource") && post.help.some((item) => item.fieldId === "quickCurrentSalesMotion"),
    recommendationShownBeforeWriteback: recommendationState.text === "Network referrals" && recommendationState.valueBeforeUse === originalRevenueSource && recommendationState.useVisible,
    recommendationContextIsScoped: Object.keys(recommendationContext).every((key) => ["companyName", "toolMode", ...config.quickPrimaryRevenueSource.contextDependencies].includes(key)),
    requestCarriesEvidenceRules: recommendationRequest?.field?.evidenceRestriction === config.quickPrimaryRevenueSource.evidenceRestriction,
    recommendationLabelsClear: post.help.filter((item) => item.mode !== "ask_directly").every((item) => item.label === "Get our recommendation"),
    customerRecommendationAtQuestion: [...preContext.help, ...preHypothesis.help].some((item) => item.fieldId === "customerContextStarter" && item.label === "Get our customer recommendation"),
    preRevenueHypothesisHelpPresent: preHypothesis.help.some((item) => item.fieldId === "preHypothesisNotes"),
    privateFactUsesExplanation: preContext.help.some((item) => item.fieldId === "preFounderBackground" && item.mode === "ask_directly" && item.label === "Explain this question" && item.useHidden),
    privateFactRemainsUnchanged: explanationState.valueAfterHelp === originalBackground && explanationState.useHidden,
    privateFactRequestIsExplanationOnly: explanationRequest?.field?.answerMode === "ask_directly",
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
    errors
  }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await context.close();
  await browser.close();
}
