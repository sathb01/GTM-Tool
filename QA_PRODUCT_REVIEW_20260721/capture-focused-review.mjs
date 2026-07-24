import { createRequire } from "node:module";
import path from "node:path";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const outputDir = path.resolve("QA_PRODUCT_REVIEW_20260721", "screenshots");
const routes = [
  {
    name: "trailpour-customer-priority",
    url: "/index.html?section=quickIcp&recordId=qa3-post-mixed-trailpour-20260724#quickIcp"
  },
  {
    name: "trailpour-gtm-summary",
    url: "/results.html?v=20260724-qa3&asset=gtm&recordId=qa3-post-mixed-trailpour-20260724"
  }
];

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});

try {
  for (const route of routes) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${baseUrl}${route.url}`, { waitUntil: "networkidle" });
    const file = path.join(outputDir, `${route.name}.png`);
    await page.screenshot({ path: file, fullPage: true });
    console.log(file);
    await context.close();
  }
} finally {
  await browser.close();
}
