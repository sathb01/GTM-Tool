import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");

const records = [
  "qa-post-b2b-forgeline-20260712-full-20260714",
  "qa-post-saas-relaymetrics-20260712-full-20260714"
];
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const results = [];

for (const recordId of records) {
  const page = await browser.newPage();
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.stack || error.message));
  page.on("console", (message) => { if (message.type() === "error" && !/Failed to load resource.*404/i.test(message.text())) errors.push(message.text()); });
  await page.goto(`http://127.0.0.1:8787/results.html?recordId=${recordId}`, { waitUntil: "networkidle" });
  const state = await page.evaluate(() => ({
    priorities: document.querySelectorAll("#revenueImpactPriorities .revenue-impact-item").length,
    traces: document.querySelectorAll("#revenueImpactPriorities .recommendation-trace").length,
    rules: Array.from(document.querySelectorAll("#revenueImpactPriorities .recommendation-trace")).filter((item) => /Rule used:/i.test(item.textContent)).length,
    sourceLinks: document.querySelectorAll("#revenueImpactPriorities .recommendation-trace a").length,
    headings: Array.from(document.querySelectorAll("main h2")).map((item) => item.textContent.trim()).slice(0, 20),
    visibleNavigation: Array.from(document.querySelectorAll("#currentSectionToc a")).map((item) => item.textContent.trim()),
    summaryGuide: document.querySelector(".decision-summary-guide")?.textContent?.trim() || "",
    summaryDetails: document.querySelector("#workspaceRecommendation")?.textContent?.trim() || "",
    summaryCardLabels: Array.from(document.querySelectorAll("#workspaceSummaryCards .metric-label, #workspaceSummaryCards .workspace-summary-label")).map((item) => item.textContent.trim()),
    containerText: document.querySelector("#revenueImpactPriorities")?.textContent?.trim() || ""
  }));
  const removedDuplicateSections = ["Insights", "Strategic Decisions", "Strategic Insights", "90-Day Focus", "Risks"];
  const consolidated = /How to use this plan/i.test(state.summaryGuide)
    && /Readiness evidence and score details/i.test(state.summaryDetails)
    && /Strategic evidence and conflicts/i.test(state.summaryDetails)
    && removedDuplicateSections.every((label) => !state.visibleNavigation.includes(label));
  results.push({ recordId, passed: state.priorities > 0 && state.traces === state.priorities && state.rules === state.priorities && state.sourceLinks >= state.priorities && consolidated && errors.length === 0, ...state, errors });
  await page.close();
}

await browser.close();
const failures = results.filter((item) => !item.passed);
console.log(JSON.stringify({ checks: results.length, passed: results.length - failures.length, failed: failures.length, failures }, null, 2));
if (failures.length) process.exitCode = 1;
