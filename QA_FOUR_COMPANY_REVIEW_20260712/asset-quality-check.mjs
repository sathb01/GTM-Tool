import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const cases = [
  {
    recordId: "qa-post-saas-relaymetrics-20260712-full-20260714",
    assets: ["gtm", "health", "active", "icp", "personas", "messaging", "targets", "proof-assets", "outreach", "pipeline-workspace", "weekly-review", "reconciliation"]
  },
  {
    recordId: "qa-pre-dtc-pawpath-20260712-full-20260714",
    assets: ["gtm", "icp", "personas", "validation", "validation-workspace"]
  }
];
const results = [];

for (const testCase of cases) {
  for (const asset of testCase.assets) {
    const page = await browser.newPage({ viewport: { width: 1280, height: 560 } });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`http://127.0.0.1:8787/results.html?asset=${asset}&recordId=${testCase.recordId}`, { waitUntil: "networkidle" });
    const inlinePrintVisible = await page.locator("#printInline").isVisible();
    if (inlinePrintVisible) await page.locator("#printInline").hover();
    const state = await page.evaluate(() => {
      const panel = document.getElementById("asset-quality-control");
      const checks = Array.from(panel?.querySelectorAll(".asset-quality-check") || []);
      const gaps = checks.filter((check) => check.classList.contains("is-gap"));
      const toc = document.getElementById("reportToc");
      if (toc) toc.scrollTop = 40;
      const backIcon = document.querySelector("#navIntakeBackLink .action-icon");
      const backIconStyle = backIcon ? getComputedStyle(backIcon) : null;
      return {
        panelCount: document.querySelectorAll("#asset-quality-control").length,
        heading: panel?.querySelector("h2")?.textContent?.trim() || "",
        checkCount: checks.length,
        gapCount: gaps.length,
        gapLinks: gaps.map((gap) => ({
          label: gap.querySelector("a")?.textContent?.trim() || "",
          href: gap.querySelector("a")?.getAttribute("href") || "",
          target: gap.querySelector("a")?.getAttribute("target") || ""
        })),
        navCount: Array.from(document.querySelectorAll("#currentSectionToc a")).filter((link) => link.textContent.trim() === "Asset Quality").length,
        recheckCount: document.querySelectorAll("#recheckAssetQuality").length,
        visibleWorkbookControls: Array.from(document.querySelectorAll("button.workbook-action")).filter((button) => {
          const style = getComputedStyle(button);
          return !button.hidden && style.display !== "none" && style.visibility !== "hidden";
        }).map((button) => button.textContent.trim()),
        workbookIconCollisions: document.querySelectorAll("button.workbook-action.icon-action").length,
        pdfControls: Array.from(document.querySelectorAll("button.icon-action")).filter((button) => /pdf/i.test(button.getAttribute("aria-label") || "")).length,
        navigationScroll: {
          overflowY: toc ? getComputedStyle(toc).overflowY : "",
          clientHeight: toc?.clientHeight || 0,
          scrollHeight: toc?.scrollHeight || 0,
          scrollTop: toc?.scrollTop || 0
        },
        backArrow: {
          fontWeight: backIconStyle?.fontWeight || "",
          fontSize: backIconStyle?.fontSize || "",
          stroke: backIconStyle?.webkitTextStrokeWidth || ""
        },
        inlinePrintHoverBackground: document.getElementById("printInline") ? getComputedStyle(document.getElementById("printInline")).backgroundColor : ""
      };
    });
    const workbookExpected = asset === "validation" || asset === "validation-workspace" || (asset === "gtm" && !testCase.recordId.includes("pre-"));
    const passed = errors.length === 0
      && state.panelCount === 1
      && state.checkCount === 4
      && state.navCount === 1
      && state.recheckCount === 1
      && state.workbookIconCollisions === 0
      && state.navigationScroll.overflowY === "auto"
      && (state.navigationScroll.scrollHeight <= state.navigationScroll.clientHeight || state.navigationScroll.scrollTop > 0)
      && Number(state.backArrow.fontWeight) >= 800
      && state.backArrow.fontSize === "15px"
      && (!inlinePrintVisible || state.inlinePrintHoverBackground === "rgb(107, 114, 128)")
      && (workbookExpected ? state.visibleWorkbookControls.length > 0 : state.visibleWorkbookControls.length === 0)
      && state.gapLinks.every((link) => link.label && link.href && link.target === "_blank")
      && (state.gapCount === 0 ? state.heading === "Ready to use" : state.heading !== "Ready to use");
    results.push({ recordId: testCase.recordId, asset, passed, errors, ...state });
    await page.close();
  }
}

await browser.close();
const failed = results.filter((result) => !result.passed);
console.log(JSON.stringify({ checks: results.length, passed: results.length - failed.length, failed: failed.length, failures: failed }, null, 2));
if (failed.length) process.exitCode = 1;
