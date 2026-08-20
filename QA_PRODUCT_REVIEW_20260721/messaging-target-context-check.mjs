import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require(process.env.GTM_PLAYWRIGHT_PATH || "playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const recordId = "qa-messaging-target-studio-context";
const seed = await fetch(`${baseUrl}/api/records/qa3-pre-dtc-roamready-20260724`).then((response) => response.json());
let record = structuredClone(seed.record);
record.id = recordId;
record.name = "QA Studio Product Co";
Object.assign(record.data, {
  companyName: "QA Studio Product Co",
  industryId: "fashion_apparel",
  industryLabel: "Fashion and Apparel",
  industryGroup: "Fashion and Apparel",
  routeToMarket: "Retail / wholesale",
  preRevenueRouteToMarket: "Retail, wholesale, distributor, or marketplace",
  primaryOfferName: "Limited Launch",
  customerContextStarter: "Pilates studio owners and managers who want to improve retail studio sales with new and better products.",
  bestFitCustomerGroup: "Owners, operators, or founders",
  quickBestFitCustomer: "Owners, operators, or founders",
  prePrimaryHypothesis: "Owners, operators, or founders",
  preWedgeOfferName: "Limited Launch",
  preWedgeOutcome: "Improve their retail studio sales with new and better products",
  preProblemHypothesisB2b: "Current options lack an important feature, service, or experience",
  "preCustomerHypotheses__first-win-segment-1__segmentName": "Owners, operators, or founders",
  "preCustomerHypotheses__first-win-segment-1__specificUseCaseDefinition": "Pilates studio owners and managers want to improve retail studio sales with new and better products.",
  "preCustomerHypotheses__first-win-segment-1__problem": "Current options lack an important feature, service, or experience",
  "preCustomerHypotheses__first-win-segment-1__likelyBuyerPath": "Retail, wholesale, distributor, or marketplace",
  "preCustomerHypotheses__first-win-segment-1__likelyBuyerChannel": "Retail buyer / merchant",
  "preCustomerHypotheses__first-win-segment-1__deliveryFit": "Yes, with a small batch or manual process",
  "preCustomerHypotheses__first-win-segment-1__credibility": "Founder is part of the target community; Prototype, demo, sample, mockup, or beta exists; Channel buyer, partner, or account conversation; Distributor, partner, reseller, or marketplace feedback; Founder experience with this channel",
  "preCustomerHypotheses__first-win-segment-1__risks": "Brand, product, service, or founder story is not strong enough; Hard to reach buyers; Crowded category",
  "preCustomerHypotheses__first-win-segment-1__problemIntensity": "5",
  "preCustomerHypotheses__first-win-segment-1__urgencyTrigger": "5",
  "preCustomerHypotheses__first-win-segment-1__reachabilityScore": "5",
  "preCustomerHypotheses__first-win-segment-1__credibilityRightToWin": "5",
  "preCustomerHypotheses__first-win-segment-1__validationSpeed": "5",
  "preCustomerHypotheses__first-win-segment-1__deliveryFitScore": "5"
});
delete record.data.messagingKitWorkspace;
record.data.targetListWorkspace = {
  targets: [],
  discovery: {
    version: 1,
    variables: {
      categories: ["Fashion and Apparel"],
      geography: "United States",
      employeeMin: "",
      employeeMax: "",
      technologySignals: [],
      serviceSignals: [],
      teamSignals: [],
      referralPaths: [],
      exclusions: [],
      batchSize: 5,
      initialTarget: 25
    },
    candidates: [],
    approaches: []
  }
};

const checks = [];
const check = (name, passed, detail = "") => checks.push({ name, passed: Boolean(passed), ...(detail ? { detail } : {}) });
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const context = await browser.newContext({ viewport: { width: 1440, height: 1100 } });
const page = await context.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
await page.route("**/api/records/**", async (route) => {
  if (route.request().method() === "GET") return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ record }) });
  if (route.request().method() === "PUT") {
    const body = route.request().postDataJSON();
    record = { ...record, ...body, id: recordId, data: body.data || record.data };
    return route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ record }) });
  }
  return route.continue();
});

try {
  await page.goto(`${baseUrl}/results.html?v=messaging-target-context&asset=messaging&recordId=${recordId}`, { waitUntil: "load" });
  await page.waitForSelector("#messagingPersonaSelect", { timeout: 20000 });
  const messaging = await page.evaluate(() => ({
    persona: document.querySelector("#messagingPersonaSelect option:checked")?.textContent || "",
    subject: document.querySelector("[data-message-field='subject']")?.value || "",
    body: document.querySelector("[data-message-field='body']")?.value || "",
    bodyLabel: document.querySelector("#messagingBodyLabel span")?.textContent || "",
    assemblyNote: document.querySelector("#messagingAssemblyNote")?.textContent || ""
  }));
  check("Studio context recommends the operating buyer", /Studio owner or manager/i.test(messaging.persona), messaging.persona);
  check("Studio product subject asks a useful buyer question", messaging.subject === "How do you choose new products for your studio?", messaging.subject);
  check("Pre-revenue email is grammatical and learning-led", /I'm researching how studio owners and managers choose new options when current options lack/i.test(messaging.body) && /We're exploring Limited Launch/i.test(messaging.body) && !/I am speaking with|who because/i.test(messaging.body), messaging.body);
  check("Editor identifies the complete email parts", messaging.bodyLabel === "Email message" && /complete email/i.test(messaging.assemblyNote), JSON.stringify(messaging));

  await page.goto(`${baseUrl}/results.html?v=messaging-target-context&asset=targets&recordId=${recordId}`, { waitUntil: "load" });
  await page.waitForSelector("#targetSearchCriteriaEditor", { timeout: 20000 });
  await page.locator("#targetSearchCriteriaEditor").evaluate((details) => { details.open = true; });
  const targets = await page.evaluate(() => ({
    summary: document.querySelector(".target-search-brief")?.innerText || "",
    types: document.querySelector("#targetDiscoveryCategories")?.value || "",
    employeeRange: document.querySelector("#targetDiscoveryEmployeeRange")?.value || "",
    optionalCollapsed: !document.querySelector("#targetSearchOptionalSignals")?.open,
    optionalText: document.querySelector("#targetSearchOptionalSignals")?.innerText || ""
  }));
  check("Saved product-industry fallback migrates to buyer context", /Pilates studios/i.test(targets.types) && !/Fashion|Apparel/i.test(targets.types), targets.types);
  check("Local studio employee range is suggested", targets.employeeRange === "1|25" && /1.+25 employees/i.test(targets.summary), JSON.stringify(targets));
  check("Technical search clues are optional tool suggestions", targets.optionalCollapsed && /optional search suggestions/i.test(targets.optionalText), JSON.stringify(targets));
  check("No browser errors", errors.length === 0, errors.join(" | "));
} finally {
  await context.close();
  await browser.close();
}

const failures = checks.filter((item) => !item.passed);
console.log(JSON.stringify({ checks: checks.length, passed: checks.length - failures.length, failed: failures.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
