import { createRequire } from "node:module";
import fs from "node:fs";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const cookie = process.env.GTM_QA_COOKIE || "";
const captureDirectory = String(process.env.GTM_QA_CAPTURE_DIR || "").trim();
const recordId = "qa3-post-saas-clientrenew-20260724";
const headers = cookie ? { Cookie: cookie } : {};
const sourceResponse = await fetch(`${baseUrl}/api/records/${encodeURIComponent(recordId)}`, { headers });
if (!sourceResponse.ok) throw new Error(`Could not load ${recordId}: ${sourceResponse.status}`);
const testRecord = structuredClone((await sourceResponse.json()).record);
const existingClaimField = Object.keys(testRecord.data).find((key) => /^offerAssessments__offer-1__valueClaims__.+__outcomeType$/.test(key));
const prefix = existingClaimField
  ? existingClaimField.replace(/__outcomeType$/, "")
  : "offerAssessments__offer-1__valueClaims__value-claim-1";
Object.assign(testRecord.data, {
  [`${prefix}__outcomeType`]: "Other / Not sure yet",
  [`${prefix}__outcomeType__other`]: "Increase margin",
  [`${prefix}__buyerFacingClaim`]: "",
  [`${prefix}__buyerRoles`]: "CFO",
  [`${prefix}__successMetric`]: "Other: Contribution margin",
  [`${prefix}__successMetric__other`]: "Contribution margin",
  [`${prefix}__baselineStatus`]: "Unknown",
  [`${prefix}__baselineValue`]: "Current weekly throughput and contribution margin",
  [`${prefix}__baselineUnit`]: "",
  [`${prefix}__baselineSource`]: "",
  [`${prefix}__targetImprovementType`]: "",
  [`${prefix}__targetImprovementValue`]: "",
  [`${prefix}__targetImprovementUnit`]: "",
  [`${prefix}__proofStrength`]: "Case study",
  [`${prefix}__salesReadiness`]: "Yes - ready to use",
  [`${prefix}__evidenceAvailable`]: "Customer testimonial; Reference customer",
  [`${prefix}__evidenceNotes`]: "Seven comparable client programs."
});

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
page.on("pageerror", (error) => errors.push(error.message));
await page.route("**/api/records", async (route) => {
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ records: [testRecord] })
  });
});
await page.route("**/api/records/**", async (route) => {
  if (route.request().method() === "GET") {
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ record: testRecord })
    });
    return;
  }
  await route.continue();
});

const checks = [];
const check = (name, passed, detail = "") => checks.push({ name, passed: Boolean(passed), detail });

try {
  await page.goto(`${baseUrl}/results.html?v=20260724-revision-guidance&asset=gtm&recordId=${encodeURIComponent(recordId)}#offerStrategy`, { waitUntil: "networkidle" });
  const planText = await page.locator("body").innerText();
  check("generic Use this plan in maps are removed", !/Use this plan in/i.test(planText));

  const revisionLinks = page.locator(".optional-intake-revision");
  check("intake revision links have guidance", await revisionLinks.count() > 0);
  check("all revision links expose hover and accessible guidance", await revisionLinks.evaluateAll((links) => links.every((link) => (
    /only when new information/i.test(link.dataset.revisionGuidance || "")
    && /only when new information/i.test(link.getAttribute("aria-label") || "")
  ))));
  await revisionLinks.first().evaluate((link) => {
    const details = link.closest("details");
    if (details) details.open = true;
  });
  await revisionLinks.first().hover();
  check("hover guidance appears without leaving the plan", await page.locator(".revision-guidance-tooltip").filter({ hasText: /only when new information/i }).count() === 1);
  await page.mouse.move(2, 2);

  const claimCard = page.locator(".value-claim-proof-action").filter({ hasText: 'Validate the "Increase margin" claim' }).first();
  check("Other outcome uses its defined value", await claimCard.count() === 1);
  const claimText = await claimCard.textContent();
  check("Other metric uses its defined value", /measures success using Contribution margin/i.test(claimText));
  check("exact unknown baseline is called out", /baseline is marked Unknown/i.test(claimText));
  check("descriptive baseline is not mistaken for a measurement", /describes what to measure but is not a measurable baseline/i.test(claimText));
  check("missing target improvement is called out", /target improvement and its measurement period are not defined/i.test(claimText));
  check("saved proof is not falsely listed as missing", !/proof is not strong enough/i.test(claimText));

  const actionLink = claimCard.locator("a").filter({ hasText: "Add Only the Missing Inputs" });
  const actionCount = await actionLink.count();
  check("claim action names the missing-input task", actionCount === 1, await claimCard.textContent().catch(() => "Claim card not found"));
  if (actionCount === 1) {
    if (captureDirectory) {
      fs.mkdirSync(captureDirectory, { recursive: true });
      await claimCard.evaluate((element) => {
        const details = element.closest("details");
        if (details) details.open = true;
      });
      await actionLink.hover();
      await claimCard.screenshot({ path: path.join(captureDirectory, "value-claim-revision-guidance.png") });
    }
    const actionHref = await actionLink.getAttribute("href");
    await actionLink.evaluate((link) => {
      link.addEventListener("click", (event) => event.preventDefault(), { once: true });
      link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    });
    const storedBeforeNavigation = await page.evaluate(() => {
      const key = Object.keys(localStorage).find((item) => item.endsWith(":improvementFocus") && !item.endsWith(":returnSnapshot"));
      return key ? JSON.parse(localStorage.getItem(key) || "null") : null;
    });
    check("click stores the exact revision guidance", storedBeforeNavigation?.area === "Value claim: Increase margin" && storedBeforeNavigation?.revisionGuidance);
    await page.goto(new URL(actionHref, baseUrl).href, { waitUntil: "networkidle" });
    await page.waitForLoadState("networkidle");
    const focusCard = page.locator(".improvement-focus");
    const focusCount = await focusCard.count();
    const focusText = focusCount ? await focusCard.innerText() : "";
    if (captureDirectory && focusCount) {
      await focusCard.screenshot({ path: path.join(captureDirectory, "intake-revision-guidance.png") });
    }
    check("intake opens with a revision-purpose message", focusCount === 1 && /Change prior answers only when something has changed/i.test(focusText), page.url());
    check("intake explains when to return without changing answers", /If the saved answers are still accurate, continue working the plan/i.test(focusText), page.url());
    check("intake identifies only the value-claim gap", /Value claim: Increase margin/i.test(focusText), page.url());
    const mountedNames = await page.locator(".improvement-answer-fields [name]").evaluateAll((fields) => fields.map((field) => field.name));
    const relatedNames = await page.locator('[name*="value-claim-guidance"]').evaluateAll((fields) => fields.map((field) => field.name));
    check("exact missing fields are mounted", mountedNames.includes(`${prefix}__baselineStatus`) && mountedNames.includes(`${prefix}__targetImprovementType`), [...mountedNames, ...relatedNames].join(" | "));
    const baselineFields = page.locator(`[name="${prefix}__baselineStatus"]`);
    check("highlighted field is not duplicated", await baselineFields.count() === 1);
    const baselineState = await baselineFields.first().evaluate((field) => ({
      value: field.value,
      options: Array.from(field.options || []).map((option) => option.value)
    }));
    check("current saved answer remains visible", baselineState.value === "Unknown", JSON.stringify(baselineState));
  }
  check("no page errors", errors.length === 0, errors.join(" | "));
} finally {
  await browser.close();
}

const failures = checks.filter((item) => !item.passed);
console.log(JSON.stringify({
  checks: checks.length,
  passed: checks.length - failures.length,
  failed: failures.length,
  failures: failures.map((item) => `${item.name}${item.detail ? `: ${item.detail}` : ""}`)
}, null, 2));
if (failures.length) process.exitCode = 1;
