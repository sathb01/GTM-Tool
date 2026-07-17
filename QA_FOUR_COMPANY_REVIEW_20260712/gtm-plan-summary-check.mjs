import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const recordId = "qa-post-b2b-forgeline-20260712-full-20260714";
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));

const response = await page.goto(`${baseUrl}/results.html?asset=gtm&recordId=${recordId}`, { waitUntil: "networkidle" });
const result = await page.evaluate(() => {
  const assetLinks = [...document.querySelectorAll("#reportToc a")];
  const cards = [...document.querySelectorAll("#workspaceSummaryCards .metric-card")];
  const detailFields = [...document.querySelectorAll("#workspaceRecommendation .recommendation-detail-grid .field")];
  const detailFor = (heading) => detailFields.find((field) => field.querySelector("h3")?.textContent.trim() === heading);
  return {
    status: document.title,
    heading: document.querySelector("#companyName")?.textContent.trim() || "",
    firstAsset: assetLinks[0]?.textContent.trim() || "",
    firstAssetActive: assetLinks[0]?.classList.contains("active") || false,
    cardLabels: cards.map((card) => card.querySelector("h3")?.textContent.trim() || ""),
    cardCopy: cards.map((card) => card.querySelector(".metric-copy")?.textContent.trim() || ""),
    decisionBullets: detailFor("Decision Required")?.querySelectorAll("li").length || 0,
    completenessBullets: detailFor("Plan Completeness")?.querySelectorAll("li").length || 0
  };
});

await browser.close();
console.log(JSON.stringify({ httpStatus: response?.status(), ...result, errors }, null, 2));

if (
  response?.status() !== 200
  || result.firstAsset !== "GTM Plan Summary"
  || !result.firstAssetActive
  || !result.heading.includes("GTM Plan Summary")
  || result.cardLabels.length !== 4
  || result.cardCopy.some((copy) => !copy)
  || result.decisionBullets !== 2
  || result.completenessBullets !== 2
  || errors.length
) process.exitCode = 1;
