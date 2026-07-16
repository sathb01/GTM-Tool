import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const deployedPassword = String(process.env.GTM_QA_PASSWORD || "");
const isRemoteQa = !/127\.0\.0\.1|localhost/i.test(baseUrl);

const records = [
  { id: "qa-pre-dtc-pawpath-20260712", pre: true, full: false },
  { id: "qa-pre-retail-brightnest-20260712", pre: true, full: false },
  { id: "qa-post-b2b-forgeline-20260712", pre: false, full: false },
  { id: "qa-post-saas-relaymetrics-20260712", pre: false, full: false },
  { id: "qa-pre-dtc-pawpath-20260712-full-20260714", pre: true, full: true },
  { id: "qa-pre-retail-brightnest-20260712-full-20260714", pre: true, full: true },
  { id: "qa-post-b2b-forgeline-20260712-full-20260714", pre: false, full: true },
  { id: "qa-post-saas-relaymetrics-20260712-full-20260714", pre: false, full: true }
];

const commonAssets = [
  { asset: "health", selector: "#plan-health-dashboard" },
  { asset: "active", selector: "#active-plan-objective", control: "#saveActivePlanButton" },
  { asset: "personas", selector: "#persona-overview" },
  { asset: "messaging", selector: "#messaging-workspace", control: "#saveMessagingDraft" },
  { asset: "targets", selector: "#target-list-workspace", control: "#saveTargetList" },
  { asset: "proof-assets", selector: "#proof-asset-workspace", control: "#saveProofAsset" },
  { asset: "outreach", selector: "#outreach-sequence-workspace", control: "#saveOutreachSequence" },
  { asset: "pipeline-workspace", selector: "#pipeline-opportunity-workspace", control: "#savePipelineWorkspace" },
  { asset: "weekly-review", selector: "#weekly-review-workspace", control: "#saveWeeklyReview", historyCreating: true },
  { asset: "reconciliation", selector: "#evidence-reconciliation-workspace" }
];

const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const renderResults = [];
const saveResults = [];

if (isRemoteQa) {
  if (!deployedPassword) throw new Error("GTM_QA_PASSWORD is required for deployed QA.");
  const fixtureResponses = await Promise.all(records.map(async (record) => {
    const response = await fetch(`http://127.0.0.1:8787/api/records/${record.id}`);
    if (!response.ok) throw new Error(`Local fixture ${record.id} is unavailable.`);
    return response.json();
  }));
  const fixtureMap = new Map(fixtureResponses.map((payload) => [payload.record.id, payload.record]));
  await context.route(`${baseUrl}/api/records**`, async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const id = decodeURIComponent(url.pathname.split("/").pop() || "");
    if (request.method() === "GET" && url.pathname === "/api/records") {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ records: Array.from(fixtureMap.values()) }) });
      return;
    }
    if (request.method() === "GET" && fixtureMap.has(id)) {
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ record: fixtureMap.get(id) }) });
      return;
    }
    if (request.method() === "PUT" && fixtureMap.has(id)) {
      const body = request.postDataJSON();
      const record = body.record || body;
      fixtureMap.set(id, record);
      await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify({ record }) });
      return;
    }
    await route.fulfill({ status: 404, contentType: "application/json", body: JSON.stringify({ error: "QA fixture not found" }) });
  });
  const loginPage = await context.newPage();
  await loginPage.goto(`${baseUrl}/login`, { waitUntil: "networkidle" });
  await loginPage.fill("#password", deployedPassword);
  await Promise.all([
    loginPage.waitForURL((url) => url.origin === new URL(baseUrl).origin && url.pathname === "/", { timeout: 30000 }),
    loginPage.click("button[type='submit']")
  ]);
  await loginPage.close();
}

function assetsFor(record) {
  return [
    ...commonAssets,
    { asset: "icp", selector: record.pre ? "#draft-icp" : "#icp-brief" },
    ...(record.pre ? [
      { asset: "gtm", selector: "#draft-icp" },
      { asset: "validation", selector: "#plan-decision" },
      { asset: "validation-workspace", selector: "#validation-workspace-overview", control: "#saveValidationWorkspaceTop" }
    ] : [])
  ];
}

try {
  for (const record of records) {
    for (const contract of assetsFor(record)) {
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.stack || error.message));
      page.on("console", (message) => {
        if (message.type() === "error" && /Report failed to render|TypeError|ReferenceError|SyntaxError/i.test(message.text())) errors.push(message.text());
      });
      const url = `${baseUrl}/results.html?v=20260716-deployed-all-assets&asset=${contract.asset}&recordId=${record.id}`;
      const response = await page.goto(url, { waitUntil: "networkidle" });
      const state = await page.evaluate(({ selector, control, asset }) => {
        const visible = (element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          const closedDetails = element.closest("details:not([open])");
          const isSummary = Boolean(element.closest("summary"));
          return (!closedDetails || isSummary) && style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
        };
        const controls = Array.from(document.querySelectorAll("button, a")).filter((element) => visible(element) && !element.closest(".report-nav, .app-top-nav"));
        const textBlocks = Array.from(document.querySelectorAll("p, h1, h2, h3, li")).filter(visible);
        const pageSections = Array.from(document.querySelectorAll("main > section[data-toc]")).filter(visible);
        const reviewSections = Array.from(document.querySelectorAll("main > section")).filter((section) => /^Review or Update/i.test(section.querySelector("h2")?.textContent || ""));
        const visiblePrintButtons = Array.from(document.querySelectorAll("button[data-action-label='Print']")).filter(visible);
        const visibleDownloadButtons = Array.from(document.querySelectorAll("button[data-action-label^='Download']")).filter(visible);
        const visibleBackLinks = Array.from(document.querySelectorAll("a.back-action")).filter(visible);
        const overlap = (first, second) => {
          const a = first.getBoundingClientRect();
          const b = second.getBoundingClientRect();
          return Math.min(a.right, b.right) - Math.max(a.left, b.left) > 3
            && Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top) > 3;
        };
        const controlOverlaps = [];
        controls.forEach((first, index) => controls.slice(index + 1).forEach((second) => {
          if (first.closest("section") !== second.closest("section")) return;
          if (overlap(first, second)) controlOverlaps.push(`${first.textContent.trim()} <> ${second.textContent.trim()}`);
        }));
        const textOverlaps = [];
        controls.forEach((action) => textBlocks.forEach((text) => {
          if (action.contains(text) || text.contains(action)) return;
          if (action.closest("section") !== text.closest("section")) return;
          if (overlap(action, text)) textOverlaps.push(`${action.textContent.trim()} <> ${text.textContent.trim().slice(0, 80)}`);
        }));
        return {
          expectedVisible: Boolean(document.querySelector(selector)),
          expectedControl: control ? Boolean(document.querySelector(control)) : true,
          sectionCount: document.querySelectorAll("main > section").length,
          mainTextLength: document.querySelector("main")?.innerText.length || 0,
          navAssetLinks: document.querySelectorAll("#reportToc a[href*='asset=']").length,
          sidebarSectionLinks: document.querySelectorAll("#reportToc a[href^='#']").length,
          currentSectionLinks: document.querySelectorAll("#currentSectionToc a[href^='#']").length,
          planStatusLinks: Array.from(document.querySelectorAll("#reportToc a")).filter((link) => /Plan Status/i.test(link.textContent)).length,
          viewPrefixedNavLinks: Array.from(document.querySelectorAll("#reportToc a")).filter((link) => /^View\s/i.test(link.textContent.trim())).length,
          singleSectionNavHidden: pageSections.length !== 1 || document.querySelector("#currentSectionNav")?.hidden === true,
          reviewSectionsStatic: reviewSections.every((section) => !section.querySelector(":scope > details.section-details")),
          printIconsReady: visiblePrintButtons.every((button) => button.classList.contains("icon-action")),
          downloadIconsReady: visibleDownloadButtons.every((button) => button.classList.contains("icon-action") || button.classList.contains("workbook-action")),
          backIconsReady: visibleBackLinks.length > 0 && visibleBackLinks.every((link) => /←/.test(link.textContent)),
          sidebarOverflow: getComputedStyle(document.querySelector("#reportToc")).overflowY,
          backControlsReady: visibleBackLinks.length > 0 && visibleBackLinks.every((link) => link.querySelector(".action-icon") && /Intake/i.test(link.textContent)),
          fontFamily: getComputedStyle(document.body).fontFamily,
          bodyBackground: getComputedStyle(document.body).backgroundColor,
          accentColor: getComputedStyle(document.documentElement).getPropertyValue("--accent").trim(),
          qualityPanelCount: document.querySelectorAll("#asset-quality-control").length,
          qualityCheckCount: document.querySelectorAll("#asset-quality-control .asset-quality-check").length,
          heading: document.querySelector("#companyName")?.textContent || "",
          planStatusNamed: asset !== "health" || /Plan Status/i.test(document.querySelector("#companyName")?.textContent || ""),
          controlOverlaps: [...new Set(controlOverlaps)].slice(0, 10),
          textOverlaps: [...new Set(textOverlaps)].slice(0, 10)
        };
      }, contract);
      const passed = response?.status() === 200 && state.expectedVisible && state.expectedControl && state.sectionCount > 0 && state.mainTextLength > 300 && state.navAssetLinks >= 8 && state.sidebarSectionLinks === 0 && state.currentSectionLinks > 0 && state.planStatusLinks === 1 && state.viewPrefixedNavLinks === 0 && state.singleSectionNavHidden && state.reviewSectionsStatic && state.printIconsReady && state.downloadIconsReady && state.backControlsReady && state.sidebarOverflow === "auto" && /Source Sans|Segoe UI|Inter/i.test(state.fontFamily) && state.accentColor === "#ff7a59" && state.qualityPanelCount === 0 && state.qualityCheckCount === 0 && state.planStatusNamed && state.controlOverlaps.length === 0 && state.textOverlaps.length === 0 && errors.length === 0;
      renderResults.push({ recordId: record.id, asset: contract.asset, status: response?.status(), passed, ...state, errors });

      if (record.full && contract.control && !contract.historyCreating && passed) {
        const before = await page.evaluate(() => document.querySelector("#companyName")?.textContent || "");
        try {
          const [saveResponse] = await Promise.all([
            page.waitForResponse((candidate) => candidate.url().includes(`/api/records/${record.id}`) && candidate.request().method() === "PUT", { timeout: 10000 }),
            page.evaluate((selector) => document.querySelector(selector)?.click(), contract.control)
          ]);
          await page.reload({ waitUntil: "networkidle" });
          const after = await page.evaluate(({ selector }) => ({ expectedVisible: Boolean(document.querySelector(selector)), heading: document.querySelector("#companyName")?.textContent || "" }), contract);
          saveResults.push({ recordId: record.id, asset: contract.asset, passed: saveResponse.ok() && after.expectedVisible && before === after.heading, status: saveResponse.status() });
        } catch (error) {
          saveResults.push({ recordId: record.id, asset: contract.asset, passed: false, status: 0, error: error.message });
        }
      }
      await page.close();
    }
  }
} finally {
  await browser.close();
}

const renderFailures = renderResults.filter((result) => !result.passed);
const saveFailures = saveResults.filter((result) => !result.passed);
const summary = {
  generatedAt: new Date().toISOString(),
  renderChecks: renderResults.length,
  renderPassed: renderResults.length - renderFailures.length,
  renderFailed: renderFailures.length,
  saveReloadChecks: saveResults.length,
  saveReloadPassed: saveResults.length - saveFailures.length,
  saveReloadFailed: saveFailures.length,
  renderFailures,
  saveFailures
};

console.log(JSON.stringify(summary, null, 2));
if (renderFailures.length || saveFailures.length) process.exitCode = 1;
