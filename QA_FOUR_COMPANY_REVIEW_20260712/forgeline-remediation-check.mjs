import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = "http://127.0.0.1:8787";
const recordId = "qa-post-b2b-forgeline-20260712-full-20260714";
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });

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
  passed: document.querySelectorAll("#asset-quality-control .asset-quality-check.is-pass").length,
  total: document.querySelectorAll("#asset-quality-control .asset-quality-check").length,
  gaps: [...document.querySelectorAll("#asset-quality-control .asset-quality-check.is-gap")].map((item) => item.innerText.trim())
}));
await active.close();

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
const qualityReady = quality.passed === 4 && quality.total === 4;
const remediationReady = /Complete the Active Plan foundation/i.test(workshop.heading)
  && /customer group, offer, channel, sales motion, owner, and measurable goal/i.test(workshop.text)
  && workshop.returnLabel === "Return to Active Plan"
  && workshop.returnHref === returnTo;

const result = { passed: portfolioReady && qualityReady && remediationReady, portfolioReady, qualityReady, remediationReady, portfolio, quality, workshop };
console.log(JSON.stringify(result, null, 2));
if (!result.passed) process.exitCode = 1;
