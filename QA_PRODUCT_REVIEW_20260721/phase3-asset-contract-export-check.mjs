import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const cookie = process.env.GTM_QA_COOKIE || "";
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  ...(cookie ? { extraHTTPHeaders: { Cookie: cookie } } : {})
});
const page = await context.newPage();
const pageErrors = [];
page.on("pageerror", (error) => pageErrors.push(error.message));

const profiles = [
  { id: "qa3-pre-dtc-roamready-20260724", preRevenue: true },
  { id: "qa3-pre-saas-referralpath-20260724", preRevenue: true },
  { id: "qa3-post-mixed-trailpour-20260724", preRevenue: false },
  { id: "qa3-post-saas-clientrenew-20260724", preRevenue: false }
];
const sharedAssets = ["gtm", "health", "active", "icp", "personas", "messaging", "targets", "proof-assets", "outreach", "weekly-review"];
const results = [];

try {
  for (const profile of profiles) {
    const assets = profile.preRevenue
      ? [...sharedAssets, "validation", "validation-workspace"]
      : sharedAssets;
    for (const asset of assets) {
      await page.goto(`${baseUrl}/results.html?asset=${encodeURIComponent(asset)}&recordId=${encodeURIComponent(profile.id)}`, { waitUntil: "load" });
      await page.waitForFunction(
        (expectedAsset) => window.GTM_CURRENT_ASSET_CONTRACT?.asset === expectedAsset,
        asset,
        { timeout: 20000 }
      );
      const state = await page.evaluate((expectedAsset) => {
        const contract = window.GTM_CURRENT_ASSET_CONTRACT;
        const activeLink = document.querySelector(`#reportToc a[data-asset="${expectedAsset}"]`);
        const navLinks = Array.from(document.querySelectorAll("#reportToc a[data-asset]"));
        const visibleControlRects = Array.from(document.querySelectorAll(".top-actions > a, .top-actions > button, .report-file-actions > a, .report-file-actions > button"))
          .filter((element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
          })
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return { id: element.id, left: rect.left, right: rect.right, top: rect.top, bottom: rect.bottom };
          });
        const controlsOverlap = visibleControlRects.some((first, index) => visibleControlRects.slice(index + 1).some((second) => (
          first.left < second.right
          && first.right > second.left
          && first.top < second.bottom
          && first.bottom > second.top
        )));
        const toc = document.getElementById("reportToc");
        const tocStyle = toc ? getComputedStyle(toc) : null;
        let tocCanScroll = Boolean(toc && ["auto", "scroll"].includes(tocStyle?.overflowY));
        if (tocCanScroll && toc.scrollHeight > toc.clientHeight) {
          toc.scrollTop = 20;
          tocCanScroll = toc.scrollTop > 0;
          toc.scrollTop = 0;
        }
        return {
          contract,
          bodyContract: document.body.dataset.assetContract,
          ready: document.body.dataset.assetContractReady,
          exportReady: document.body.dataset.exportReady,
          activeLinkText: activeLink?.textContent.trim() || "",
          activeLinkIsActive: activeLink?.classList.contains("active") || false,
          everyAssetHasMeta: navLinks.length > 0 && navLinks.every((link) => Boolean(link.querySelector(".asset-nav-meta")?.textContent.trim())),
          navUsesCleanLabels: navLinks.every((link) => !/^(?:open|view)\b/i.test(link.querySelector(".asset-nav-label")?.textContent.trim() || "")),
          controlsOverlap,
          tocCanScroll,
          pdfLabel: document.getElementById("exportButton")?.textContent.trim() || "",
          workbookLabel: document.getElementById("downloadTrackerTop")?.getAttribute("aria-label")
            || document.getElementById("downloadTrackerTop")?.textContent.trim()
            || document.getElementById("downloadValidationWorkbookBottom")?.textContent.trim()
            || "",
          printLabel: document.getElementById("printButton")?.getAttribute("aria-label")
            || document.getElementById("printButton")?.textContent.trim()
            || "",
          visibleSections: Array.from(document.querySelectorAll("main > section"))
            .filter((section) => !section.hidden && !section.classList.contains("removed-section")).length
        };
      }, asset);
      await page.emulateMedia({ media: "print" });
      const printState = await page.evaluate(() => ({
        reportNavigationHidden: getComputedStyle(document.querySelector(".report-nav")).display === "none",
        topNavigationHidden: getComputedStyle(document.querySelector(".app-top-nav")).display === "none",
        printableSections: Array.from(document.querySelectorAll("main > section"))
          .filter((section) => {
            const style = getComputedStyle(section);
            const rect = section.getBoundingClientRect();
            return style.display !== "none" && rect.width > 0 && rect.height > 0;
          }).length
      }));
      await page.emulateMedia({ media: "screen" });
      const checks = {
        correctContractApplied: state.contract?.asset === asset && state.bodyContract === asset,
        contentContractIsExplicit: state.contract?.purpose && state.contract?.requiredContent?.length >= 5,
        printableAssetIsReady: state.ready === "true" && state.exportReady === "true" && state.visibleSections > 0,
        correctExportControlsAreAvailable: state.contract?.exportType === "workbook"
          ? /workbook/i.test(state.workbookLabel)
          : /download pdf/i.test(state.pdfLabel) && /print/i.test(state.printLabel),
        navigationShowsAssetStatus: state.activeLinkText && state.everyAssetHasMeta,
        currentAssetIsHighlighted: state.activeLinkIsActive,
        navigationLabelsAreClean: state.navUsesCleanLabels,
        sidebarScrollRemainsAvailable: state.tocCanScroll,
        actionControlsDoNotOverlap: !state.controlsOverlap,
        printModeIsClean: printState.reportNavigationHidden && printState.topNavigationHidden && printState.printableSections > 0
      };
      results.push({
        profile: profile.id,
        asset,
        checks,
        failures: Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name)
      });
    }
  }

  const failures = results.flatMap((result) => result.failures.map((failure) => `${result.profile} / ${result.asset}: ${failure}`));
  const checks = results.reduce((count, result) => count + Object.keys(result.checks).length, 0);
  console.log(JSON.stringify({
    checks,
    passed: checks - failures.length,
    failed: failures.length,
    failures,
    pageErrors,
    assetsChecked: results.length
  }, null, 2));
  if (failures.length || pageErrors.length) process.exitCode = 1;
} finally {
  await context.close();
  await browser.close();
}
