import { createRequire } from "node:module";
import fs from "node:fs";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");

const companies = [
  {
    id: "qa-pre-dtc-pawpath-20260712-full-20260714",
    name: "PawPath",
    pre: true,
    required: [/urban dog owners/i, /low light|before sunrise|after dark/i, /direct to consumer|end user|DTC/i],
    forbidden: [/retail sell-in as the first/i, /specialty manufacturers/i, /professional.services firms/i]
  },
  {
    id: "qa-pre-retail-brightnest-20260712-full-20260714",
    name: "BrightNest",
    pre: true,
    required: [/independent natural.home|zero.waste retailer/i, /one to five locations/i, /retail|wholesale|channel/i],
    forbidden: [/urban dog owners/i, /specialty manufacturers/i, /professional.services firms/i]
  },
  {
    id: "qa-post-b2b-forgeline-20260712-full-20260714",
    name: "ForgeLine",
    pre: false,
    required: [/specialty manufacturer/i, /75.400 employees/i, /throughput/i],
    forbidden: [/urban dog owners/i, /zero.waste retailer/i, /professional.services firms/i]
  },
  {
    id: "qa-post-saas-relaymetrics-20260712-full-20260714",
    name: "RelayMetrics",
    pre: false,
    required: [/professional.services firms/i, /20.75 employees/i, /forecast|pipeline/i],
    forbidden: [/urban dog owners/i, /zero.waste retailer/i, /specialty manufacturers/i]
  }
];

const commonAssets = ["health", "active", "icp", "personas", "messaging", "targets", "proof-assets", "outreach", "pipeline-workspace", "weekly-review", "reconciliation"];
const placeholderPatterns = [
  /AI please/i,
  /AI recommendation/i,
  /Not captured yet/i,
  /completed answer for/i,
  /\bundefined\b/i,
  /\bnull\b/i,
  /\[object Object\]/i
];

const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const checks = [];
const snapshots = [];

function check(company, asset, rule, passed, detail = "") {
  checks.push({ company: company.name, asset, rule, passed, detail });
}

try {
  for (const company of companies) {
    const assets = [...commonAssets, ...(company.pre ? ["gtm", "validation", "validation-workspace"] : [])];
    const assetTexts = {};
    const assetMeta = {};
    for (const asset of assets) {
      const page = await browser.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      const response = await page.goto(`http://127.0.0.1:8787/results.html?v=20260714-content-audit&asset=${asset}&recordId=${company.id}`, { waitUntil: "networkidle" });
      const pageData = await page.evaluate(() => ({
        title: document.querySelector("#companyName")?.textContent?.trim() || "",
        text: document.querySelector("main")?.innerText?.replace(/\r/g, "").trim() || "",
        sections: Array.from(document.querySelectorAll("main > section")).map((section) => ({
          heading: section.querySelector("h1,h2")?.textContent?.trim() || "Untitled",
          text: section.innerText.replace(/\r/g, "").trim()
        })),
        traceCount: document.querySelectorAll(".recommendation-trace").length,
        traceSourceLinks: document.querySelectorAll(".recommendation-trace a").length,
        traceText: Array.from(document.querySelectorAll(".recommendation-trace")).map((item) => item.textContent).join(" ")
      }));
      assetTexts[asset] = pageData.text;
      assetMeta[asset] = pageData;
      snapshots.push({ company: company.name, asset, ...pageData });
      check(company, asset, "HTTP and runtime", response?.status() === 200 && errors.length === 0, errors.join(" | "));
      check(company, asset, "Substantive content", pageData.text.length >= 300, `${pageData.text.length} characters`);
      for (const pattern of placeholderPatterns) {
        check(company, asset, `No placeholder: ${pattern}`, !pattern.test(pageData.text), pageData.text.match(pattern)?.[0] || "");
      }
      for (const pattern of company.forbidden) {
        check(company, asset, `No cross-company leakage: ${pattern}`, !pattern.test(pageData.text), pageData.text.match(pattern)?.[0] || "");
      }
      await page.close();
    }

    const allText = Object.values(assetTexts).join("\n");
    for (const pattern of company.required) {
      check(company, "portfolio", `Scenario truth present: ${pattern}`, pattern.test(allText), pattern.toString());
    }
    check(company, "portfolio", "ICP flows into personas", company.required[0].test(assetTexts.icp) && company.required[0].test(assetTexts.personas), company.required[0].toString());
    check(company, "portfolio", "ICP flows into messaging", company.required[0].test(assetTexts.icp) && company.required[0].test(assetTexts.messaging), company.required[0].toString());
    check(company, "portfolio", "ICP flows into target list", company.required[0].test(assetTexts.icp) && company.required[0].test(assetTexts.targets), company.required[0].toString());
    check(company, "portfolio", "Messaging flows into outreach", /message|subject|conversation|outreach/i.test(assetTexts.messaging) && /message|sequence|outreach/i.test(assetTexts.outreach));
    check(company, "portfolio", "Targets flow into pipeline", /target/i.test(assetTexts.targets) && /target|account|opportunit/i.test(assetTexts["pipeline-workspace"]));
    check(company, "portfolio", "Evidence leads to a decision", /continue|revise|stop|pause|decision/i.test(assetTexts["weekly-review"]));
    check(company, "health", "Dashboard gives exactly three ordered next steps", /NEXT 1/i.test(assetTexts.health) && /NEXT 2/i.test(assetTexts.health) && /NEXT 3/i.test(assetTexts.health) && !/NEXT 4/i.test(assetTexts.health));
    check(company, "health", "Supported evidence does not create a waiting strategy decision", !/Evidence: Supported[\s\S]{0,160}\b[1-9]\d* decisions waiting/i.test(assetTexts.health));
    check(company, "health", "Dashboard recommendations explain their sources", assetMeta.health.traceCount >= 5 && assetMeta.health.traceSourceLinks >= 5 && /Rule used:/i.test(assetMeta.health.traceText));
    check(company, "active", "Active Plan priorities explain their sources", assetMeta.active.traceCount >= 3 && assetMeta.active.traceSourceLinks >= 3 && /Rule used:/i.test(assetMeta.active.traceText));
    check(company, "weekly-review", "Weekly review recommends one learning change", /Change One Variable in the Next Cycle/i.test(assetTexts["weekly-review"]) && /Our recommendation:\s*No strategic change/i.test(assetTexts["weekly-review"]) && /Keep These Constant/i.test(assetTexts["weekly-review"]));
    if (company.name === "PawPath") {
      check(company, "messaging", "Suggested subject uses the actual customer context", !/suggested subject line[^\n]*specific use case/i.test(assetTexts.messaging));
      check(company, "messaging", "Suggested subject is a complete phrase", !/suggested subject line[^\n]*\b(?:a|an|and|at|by|for|from|in|of|on|or|the|to|with|without)\s*$/im.test(assetTexts.messaging));
      check(company, "icp", "ICP headline uses the defined segment", !/Draft ICP:\s*End users with a specific use case/i.test(assetTexts.icp));
    }
  }
} finally {
  await browser.close();
}

const failures = checks.filter((item) => !item.passed);
const summary = {
  generatedAt: new Date().toISOString(),
  checks: checks.length,
  passed: checks.length - failures.length,
  failed: failures.length,
  failures
};

fs.writeFileSync(new URL("./content-quality-snapshots.json", import.meta.url), JSON.stringify(snapshots, null, 2));
fs.writeFileSync(new URL("./content-quality-output.json", import.meta.url), JSON.stringify(summary, null, 2));
console.log(JSON.stringify(summary, null, 2));
if (failures.length) process.exitCode = 1;
