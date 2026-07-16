import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");

const ids = [
  "qa-pre-dtc-pawpath-20260712",
  "qa-pre-retail-brightnest-20260712",
  "qa-post-b2b-forgeline-20260712",
  "qa-post-saas-relaymetrics-20260712",
  "qa-pre-dtc-pawpath-20260712-full-20260714",
  "qa-pre-retail-brightnest-20260712-full-20260714",
  "qa-post-b2b-forgeline-20260712-full-20260714",
  "qa-post-saas-relaymetrics-20260712-full-20260714"
];

const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const results = [];
try {
  for (const id of ids) {
    const page = await browser.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.stack || error.message));
    const response = await page.goto(`http://127.0.0.1:8787/results.html?v=20260714-full-regression&asset=icp&recordId=${id}`, { waitUntil: "networkidle" });
    const state = await page.evaluate(() => ({
      title: document.title,
      heading: document.querySelector("#companyName")?.textContent || "",
      icpHeading: document.querySelector("#icp-brief h2, #draft-icp h2")?.textContent || "",
      sectionCount: document.querySelectorAll("main > section").length,
      bodyTextLength: document.body.innerText.length
    }));
    results.push({ id, status: response?.status(), ...state, errors });
    await page.close();
  }
} finally {
  await browser.close();
}

console.log(JSON.stringify(results, null, 2));
if (results.some((result) => result.status !== 200 || result.errors.length || !result.icpHeading)) process.exitCode = 1;
