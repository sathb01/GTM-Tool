import { createRequire } from "node:module";
import { qaProfiles } from "./company-profiles.mjs";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const cookie = process.env.GTM_QA_COOKIE || "";
const profiles = qaProfiles.filter((profile) => profile.mode === "postRevenue");
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});
const results = [];

async function improvementRoutes(profile) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1000 },
    ...(cookie ? { extraHTTPHeaders: { Cookie: cookie } } : {})
  });
  const page = await context.newPage();
  await page.goto(`${baseUrl}/results.html?v=20260723-improvement-route-audit&asset=gtm&recordId=${profile.id}`, {
    waitUntil: "load"
  });
  await page.waitForSelector("#decision-summary", { timeout: 15000 });
  await page.waitForFunction(() => Array.from(document.querySelectorAll("a"))
    .some((link) => /^Improve This (?:Section|Priority)$/i.test(link.textContent.trim())), null, { timeout: 15000 });
  const routes = await page.evaluate(() => Array.from(document.querySelectorAll("a"))
    .filter((link) => /^Improve This (?:Section|Priority)$/i.test(link.textContent.trim()))
    .map((link, index) => ({
      index,
      label: link.textContent.trim(),
      href: link.getAttribute("href") || "",
      claimId: link.closest("[data-claim-id]")?.dataset.claimId || "",
      sectionId: link.closest("section")?.id || ""
    })));
  await context.close();
  return routes;
}

try {
  for (const profile of profiles) {
    const routes = await improvementRoutes(profile);
    for (const route of routes) {
      const context = await browser.newContext({
        viewport: { width: 1440, height: 1000 },
        ...(cookie ? { extraHTTPHeaders: { Cookie: cookie } } : {})
      });
      const page = await context.newPage();
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.goto(`${baseUrl}/results.html?v=20260723-improvement-route-audit&asset=gtm&recordId=${profile.id}`, {
        waitUntil: "load"
      });
      await page.waitForSelector("#decision-summary", { timeout: 15000 });
      await page.waitForFunction(() => Array.from(document.querySelectorAll("a"))
        .some((link) => /^Improve This (?:Section|Priority)$/i.test(link.textContent.trim())), null, { timeout: 15000 });
      const links = page.locator("a").filter({ hasText: /^Improve This (?:Section|Priority)$/i });
      await links.nth(route.index).evaluate((link) => link.click());
      await page.waitForURL(/index\.html/, { timeout: 15000 });
      await page.waitForSelector(".improvement-focus", { timeout: 15000 });
      const state = await page.evaluate(() => {
        const focus = document.querySelector(".improvement-focus");
        const fieldWrappers = Array.from(focus?.querySelectorAll(".improvement-answer-fields [data-field-id]") || []);
        const editableControls = Array.from(focus?.querySelectorAll(".improvement-answer-fields input:not([type='hidden']), .improvement-answer-fields select, .improvement-answer-fields textarea, .improvement-answer-fields button") || []);
        return {
          activeSection: document.querySelector("#sections > section")?.id || "",
          expectedSection: new URLSearchParams(window.location.search).get("focus") || "",
          heading: focus?.querySelector("h3")?.textContent || "",
          text: focus?.innerText || "",
          mountedFields: fieldWrappers.map((wrapper) => wrapper.dataset.fieldId),
          editableControls: editableControls.length,
          saveAndReturn: Boolean(Array.from(focus?.querySelectorAll("button") || []).find((button) => button.textContent.trim() === "Save Changes and Return")),
          returnWithoutSaving: Boolean(Array.from(focus?.querySelectorAll("a") || []).find((link) => link.textContent.trim() === "Return Without Saving"))
        };
      });
      const checks = {
        improvementCardLoaded: /^Improving:/i.test(state.heading),
        correctSectionOpened: state.activeSection === state.expectedSection,
        sourceFieldsVisible: state.mountedFields.length > 0 && state.editableControls > 0,
        editingDirectionVisible: /Update the .*source answers|Edit the intake answers below|Confirm the offer this proof supports|Confirm the revenue motion|Confirm the motion and capacity/i.test(state.text),
        routeSpecificDirectionVisible: route.claimId === "ranked-proof-assets"
          ? /Full Readiness Analysis/i.test(state.text) && /Proof Readiness/i.test(state.text)
          : route.claimId === "ranked-revenue-motion-discipline"
            ? /Full Revenue Motion Play Assessment/i.test(state.text) && /Conversion Stages/i.test(state.text)
            : route.claimId === "ranked-conversion-assumptions"
              ? /Pipeline Metrics/i.test(state.text) && /Conversion Stages/i.test(state.text)
              : route.claimId === "ranked-crm-data-quality"
                ? /six CRM source answers/i.test(state.text)
                : true,
        saveAndReturnVisible: state.saveAndReturn,
        returnWithoutSavingVisible: state.returnWithoutSaving,
        noPageErrors: errors.length === 0
      };
      const failures = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
      results.push({
        profile: profile.key,
        route,
        checks,
        failures,
        state,
        errors
      });
      await context.close();
    }
  }

  const routeCount = results.length;
  const checkCount = results.reduce((sum, result) => sum + Object.keys(result.checks).length, 0);
  const failures = results.flatMap((result) => result.failures.map((failure) => `${result.profile}:${result.route.claimId || result.route.sectionId}:${failure}`));
  console.log(JSON.stringify({
    routes: routeCount,
    checks: checkCount,
    passed: checkCount - failures.length,
    failed: failures.length,
    failures,
    results: results.map((result) => ({
      profile: result.profile,
      route: result.route.claimId || result.route.sectionId,
      activeSection: result.state.activeSection,
      mountedFields: result.state.mountedFields,
      failures: result.failures
    }))
  }, null, 2));
  if (failures.length || routeCount === 0) process.exitCode = 1;
} finally {
  await browser.close();
}
