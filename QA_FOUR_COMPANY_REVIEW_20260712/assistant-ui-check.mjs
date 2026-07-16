import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const recordId = "qa-post-b2b-forgeline-20260712-full-20260714";
const browser = await chromium.launch({ headless: true, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const results = [];

for (const path of [
  `/index.html?recordId=${recordId}`,
  `/results.html?asset=gtm&recordId=${recordId}`
]) {
  const page = await context.newPage();
  const requests = [];
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.route("**/api/assistant", async (route) => {
    requests.push(JSON.parse(route.request().postData() || "{}"));
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ answer: "Recommended starting point:\n- Keep one priority segment.\n- Validate it with five buyer conversations." })
    });
  });
  const response = await page.goto(`${baseUrl}${path}`, { waitUntil: "networkidle" });
  const topInput = page.locator(".workspace-find-ask input");
  await topInput.fill("Revenue");
  await page.locator(".workspace-find-ask").evaluate((form) => form.requestSubmit());
  await page.locator(".workspace-assistant-panel").waitFor({ state: "visible" });
  const searchRequestCount = requests.length;
  const resultCount = await page.locator(".workspace-assistant-results a").count();
  await page.locator("#workspaceAssistantQuestion").fill("What should I improve first?");
  await page.locator("[data-assistant-ask]").click();
  await page.locator(".workspace-assistant-answer").waitFor({ state: "visible" });
  const payload = requests[0] || {};
  results.push({
    path,
    status: response?.status(),
    inputVisible: await topInput.isVisible(),
    resultCount,
    searchRequestCount,
    askRequestCount: requests.length,
    payloadHasRecord: payload.recordId === recordId,
    payloadHasSection: Boolean(payload.section),
    payloadHasContext: Boolean(payload.pageContext),
    answerVisible: (await page.locator(".workspace-assistant-answer").innerText()).includes("Recommended starting point"),
    errors
  });
  await page.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));
const failed = results.some((item) => item.status !== 200 || !item.inputVisible || item.resultCount < 1 || item.searchRequestCount !== 0 || item.askRequestCount !== 1 || !item.payloadHasRecord || !item.payloadHasSection || !item.payloadHasContext || !item.answerVisible || item.errors.length);
if (failed) process.exitCode = 1;
