import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const cookie = process.env.GTM_QA_COOKIE || "";
const sourceIds = [
  "qa3-pre-dtc-roamready-20260724",
  "qa3-pre-saas-referralpath-20260724"
];

const sourceRecords = [];
for (const sourceId of sourceIds) {
  const response = await fetch(`${baseUrl}/api/records/${encodeURIComponent(sourceId)}`, {
    headers: cookie ? { Cookie: cookie } : {}
  });
  if (!response.ok) throw new Error(`Could not load ${sourceId}: HTTP ${response.status}`);
  sourceRecords.push((await response.json()).record);
}

const records = sourceRecords.map((record, index) => ({
  ...structuredClone(record),
  id: `qa-record-tab-isolation-${index + 1}`,
  name: `Tab Isolation ${index + 1}`,
  data: {
    ...structuredClone(record.data),
    companyName: `Tab Isolation Company ${index + 1}`,
    lastPlanInputSignature: "outdated-signature"
  }
}));
const savedById = new Map(records.map((record) => [record.id, record]));
const putIds = [];

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  ...(cookie ? { extraHTTPHeaders: { Cookie: cookie } } : {})
});
await context.route("**/api/records", async (route) => {
  if (route.request().method() !== "GET") {
    await route.continue();
    return;
  }
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ records: Array.from(savedById.values()) })
  });
});
await context.route("**/api/records/*", async (route) => {
  const id = decodeURIComponent(new URL(route.request().url()).pathname.split("/").pop() || "");
  if (!savedById.has(id)) {
    await route.continue();
    return;
  }
  if (route.request().method() === "PUT") {
    const body = route.request().postDataJSON();
    savedById.set(id, { ...savedById.get(id), ...body, id, data: body.data || savedById.get(id).data });
    putIds.push(id);
  }
  await route.fulfill({
    status: 200,
    contentType: "application/json",
    body: JSON.stringify({ record: savedById.get(id) })
  });
});

const firstPage = await context.newPage();
const secondPage = await context.newPage();
const pageErrors = [];
const dialogs = [];
firstPage.on("pageerror", (error) => pageErrors.push(error.message));
secondPage.on("pageerror", (error) => pageErrors.push(error.message));
firstPage.on("dialog", async (dialog) => {
  dialogs.push(dialog.message());
  await dialog.dismiss();
});

try {
  await firstPage.goto(`${baseUrl}/index.html?recordId=${records[0].id}`, { waitUntil: "load" });
  await firstPage.waitForSelector("#regenerateStalePlanButton");
  await secondPage.goto(`${baseUrl}/index.html?recordId=${records[1].id}`, { waitUntil: "load" });
  await secondPage.waitForSelector("#regenerateStalePlanButton");

  const firstTabState = await firstPage.evaluate(() => ({
    recordId: loadedRecordId,
    companyName: formStateData.companyName || ""
  }));
  await firstPage.getByRole("button", { name: "Generate Updated Plan" }).click();
  const generateAnyway = firstPage.getByRole("button", { name: "Generate Anyway" });
  if (await generateAnyway.isVisible().catch(() => false)) {
    await generateAnyway.click();
  } else if (await firstPage.locator("#dataQualityReview").isVisible().catch(() => false)) {
    await firstPage.evaluate(() => {
      submitIntake("preRevenue", "gtm", true);
    });
  }
  try {
    await firstPage.waitForURL((url) => url.pathname.endsWith("/results.html"), { timeout: 20000 });
  } catch (error) {
    const diagnostic = await firstPage.evaluate(() => ({
      url: window.location.href,
      saveStatus: document.getElementById("saveStatus")?.innerText || "",
      qualityReview: document.getElementById("dataQualityReview")?.innerText || "",
      qualityReviewHidden: document.getElementById("dataQualityReview")?.hidden,
      staleWarningHidden: document.getElementById("planStaleWarning")?.hidden,
      activeSection: activeSectionId
    }));
    throw new Error(`${error.message}\n${JSON.stringify({ diagnostic, dialogs }, null, 2)}`);
  }
  const generatedRecordId = new URL(firstPage.url()).searchParams.get("recordId");
  const firstSaved = savedById.get(records[0].id)?.data || {};
  const secondSaved = savedById.get(records[1].id)?.data || {};

  const checks = {
    firstTabStillDisplaysFirstCompany: firstTabState.companyName === records[0].data.companyName,
    firstTabKeepsItsLoadedRecord: firstTabState.recordId === records[0].id,
    generatedPlanUsesVisibleCompany: generatedRecordId === records[0].id,
    saveTargetsVisibleCompany: putIds.includes(records[0].id),
    otherTabRecordNotOverwritten: secondSaved.companyName === records[1].data.companyName,
    generatedSignaturePersisted: Boolean(firstSaved.lastPlanInputSignature)
      && firstSaved.lastPlanInputSignature !== "outdated-signature",
    noPageErrors: pageErrors.length === 0
  };
  const failures = Object.entries(checks).filter(([, passed]) => !passed).map(([name]) => name);
  console.log(JSON.stringify({
    checks: Object.keys(checks).length,
    passed: Object.keys(checks).length - failures.length,
    failed: failures.length,
    failures,
    firstTabState,
    generatedRecordId,
    putIds,
    pageErrors,
    dialogs
  }, null, 2));
  if (failures.length) process.exitCode = 1;
} finally {
  await context.close();
  await browser.close();
}
