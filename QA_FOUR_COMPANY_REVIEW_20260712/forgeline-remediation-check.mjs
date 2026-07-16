import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const password = String(process.env.GTM_QA_PASSWORD || "");
const recordId = "qa-post-b2b-forgeline-20260712-full-20260714";
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

if (password) {
  const login = await context.newPage();
  await login.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
  await login.fill("#password", password);
  await Promise.all([
    login.waitForURL((url) => url.origin === new URL(baseUrl).origin && url.pathname === "/", { timeout: 30000 }),
    login.click("button[type='submit']")
  ]);
  await login.close();
}

const intake = await context.newPage();
await intake.goto(`${baseUrl}/index.html?recordId=${recordId}&section=pipeline#pipeline`, { waitUntil: "networkidle" });
const portfolio = await intake.evaluate(() => {
  const value = (name) => document.querySelector(`[name="${name}"]`)?.value || "";
  return {
    firstRowId: document.querySelector('[data-repeatable-card-list-for="revenueMotionPortfolio"] .repeatable-card')?.dataset.cardRow || "",
    playName: value("revenueMotionPortfolio__motion-1__playName"),
    customerGroup: value("revenueMotionPortfolio__motion-1__customerGroup"),
    offer: value("revenueMotionPortfolio__motion-1__offer"),
    channel: value("revenueMotionPortfolio__motion-1__channelSource"),
    salesMotion: value("revenueMotionPortfolio__motion-1__salesMotionType"),
    goal: value("revenueMotionPortfolio__motion-1__playGoal")
  };
});
await intake.close();

const active = await context.newPage();
await active.goto(`${baseUrl}/results.html?asset=active&recordId=${recordId}`, { waitUntil: "networkidle" });
const quality = await active.evaluate(() => ({
  visiblePanels: document.querySelectorAll("#asset-quality-control").length,
  evidenceFeedbackVisible: Boolean(document.querySelector("#active-plan-evidence-feedback")),
  planResourcesVisible: [...document.querySelectorAll("h2")].some((item) => item.textContent.trim() === "Plan Resources"),
  overviewBullets: document.querySelectorAll("#active-plan-objective .active-plan-overview-list > li").length
}));
await active.close();

const statusPage = await context.newPage();
await statusPage.goto(`${baseUrl}/results.html?asset=health&recordId=${recordId}`, { waitUntil: "networkidle" });
const planStatus = await statusPage.evaluate(() => ({
  firstSection: document.querySelector("main > section")?.id || "",
  text: document.querySelector("main")?.innerText || "",
  qualityPanels: document.querySelectorAll("#asset-quality-control").length,
  reconciliationNavLinks: [...document.querySelectorAll("#reportToc a")].filter((item) => /Evidence Reconciliation/i.test(item.textContent)).length,
  internalNewTabLinks: [...document.querySelectorAll('a[target="_blank"]')].filter((item) => new URL(item.href, location.href).origin === location.origin).length
}));
await statusPage.close();

const remediation = await context.newPage();
const returnTo = "results.html?asset=active&recordId=qa-post-b2b-forgeline-20260712-full-20260714#active-plan-objective";
await remediation.goto(`${baseUrl}/index.html?focus=pipeline&review=revenue&task=active-plan-action&returnTo=${encodeURIComponent(returnTo)}&recordId=${recordId}#pipeline`, { waitUntil: "networkidle" });
const workshop = await remediation.evaluate(() => ({
  heading: document.querySelector(".improvement-focus h3")?.textContent || "",
  text: document.querySelector(".improvement-focus")?.innerText || "",
  returnLabel: [...document.querySelectorAll(".improvement-focus a")].find((item) => /Return to Active Plan/i.test(item.textContent))?.textContent || "",
  returnHref: [...document.querySelectorAll(".improvement-focus a")].find((item) => /Return to Active Plan/i.test(item.textContent))?.getAttribute("href") || ""
}));
await remediation.close();
await browser.close();

const portfolioReady = portfolio.firstRowId === "motion-1"
  && [portfolio.playName, portfolio.customerGroup, portfolio.offer, portfolio.channel, portfolio.salesMotion, portfolio.goal].every(Boolean);
const qualityReady = quality.visiblePanels === 0 && !quality.evidenceFeedbackVisible && !quality.planResourcesVisible && quality.overviewBullets === 4;
const remediationReady = /Complete the Active Plan foundation/i.test(workshop.heading)
  && /customer group, offer, channel, sales motion, owner, and measurable goal/i.test(workshop.text)
  && workshop.returnLabel === "Return to Active Plan"
  && workshop.returnHref === returnTo;
const planStatusReady = planStatus.firstSection === "plan-health-dashboard"
  && !/Current priority|What the evidence changes|Plan Resources/i.test(planStatus.text)
  && planStatus.qualityPanels === 0
  && planStatus.reconciliationNavLinks === 0
  && planStatus.internalNewTabLinks === 0;

const result = { passed: portfolioReady && qualityReady && remediationReady && planStatusReady, portfolioReady, qualityReady, remediationReady, planStatusReady, portfolio, quality, planStatus, workshop };
console.log(JSON.stringify(result, null, 2));
if (!result.passed) process.exitCode = 1;
