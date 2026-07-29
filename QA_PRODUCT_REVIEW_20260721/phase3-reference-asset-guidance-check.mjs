import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const recordIds = process.env.GTM_QA_RECORD_ID
  ? [process.env.GTM_QA_RECORD_ID]
  : ["qa3-post-saas-clientrenew-20260724", "qa3-pre-dtc-roamready-20260724"];
const cookie = process.env.GTM_QA_COOKIE || "";
const headers = cookie ? { Cookie: cookie } : {};
const checks = [];

function check(name, passed, detail = "") {
  checks.push({ name, passed: Boolean(passed), detail });
}

for (const recordId of recordIds) {
  const sourceResponse = await fetch(`${baseUrl}/api/records/${encodeURIComponent(recordId)}`, { headers });
  if (!sourceResponse.ok) throw new Error(`Could not load ${recordId}: ${sourceResponse.status}`);
}

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});
for (const viewport of [
  { name: "desktop", width: 1440, height: 1000 },
  { name: "mobile", width: 390, height: 844 }
]) {
  for (const recordId of recordIds) {
    const page = await browser.newPage({ viewport });
    if (cookie) await page.setExtraHTTPHeaders({ Cookie: cookie });
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(`${baseUrl}/results.html?v=20260724-reference-assets&asset=active&recordId=${encodeURIComponent(recordId)}`, { waitUntil: "networkidle" });
    const startWeek = page.locator("#startWeekOneButton");
    if (await startWeek.count()) {
      await page.evaluate(() => {
        document.querySelectorAll("[data-tool-setup-status]").forEach((control) => {
          control.value = "Ready";
          control.dispatchEvent(new Event("change", { bubbles: true }));
        });
      });
      await startWeek.click();
      await page.waitForSelector("#active-plan-this-week", { timeout: 20000 });
    }

    const result = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll("[data-weekly-priority]"));
      return {
        cardCount: cards.length,
        references: cards.map((card) => {
          const block = card.querySelector(".active-plan-task-resources");
          const links = Array.from(block?.querySelectorAll("a") || []);
          return {
            hasBlock: Boolean(block),
            heading: block?.querySelector("strong")?.textContent?.trim() || "",
            text: block?.textContent?.replace(/\s+/g, " ").trim() || "",
            links: links.map((link) => ({
              label: link.textContent.trim(),
              type: link.dataset.keepNewWindow === "true" ? "reference" : "tool",
              target: link.getAttribute("target"),
              rel: link.getAttribute("rel"),
              href: link.getAttribute("href")
            })),
            overflow: card.scrollWidth > card.clientWidth
          };
        }),
        bodyOverflow: document.body.scrollWidth > document.documentElement.clientWidth
      };
    });

    const label = `${viewport.name} ${recordId}`;
    check(`${label}: weekly priorities render`, result.cardCount > 0, `${result.cardCount} priorities`);
    check(`${label}: every priority identifies what to use`, result.references.every((item) => item.hasBlock && item.heading === "Use for this task"));
    check(`${label}: every priority gives a relevant asset or tool`, result.references.every((item) => item.links.length > 0));
    check(`${label}: reference assets open separately`, result.references.every((item) => item.links
      .filter((link) => link.type === "reference")
      .every((link) => link.target === "_blank" && /noopener/.test(link.rel || ""))), JSON.stringify(result.references.map((item) => item.links)));
    check(`${label}: reference asset links point to supported assets`, result.references.every((item) => item.links
      .filter((link) => link.type === "reference")
      .every((link) => /[?&]asset=(?:icp|personas)(?:&|$)/.test(link.href || ""))));
    check(`${label}: work tools stay in flow and return to This Week`, result.references.every((item) => item.links
      .filter((link) => link.type === "tool")
      .every((link) => !link.target
        && /[?&]asset=(?:messaging|targets|proof-assets|outreach|validation-workspace|weekly-review)(?:&|$)/.test(link.href || "")
        && /[?&]workReturn=active(?:&|#|$)/.test(link.href || ""))), JSON.stringify(result.references.map((item) => item.links.filter((link) => link.type === "tool"))));
    check(`${label}: priority cards do not overflow`, !result.bodyOverflow && result.references.every((item) => !item.overflow));
    check(`${label}: no page errors`, errors.length === 0, errors.join(" | "));
    await page.close();
  }
}
await browser.close();

const failures = checks.filter((item) => !item.passed);
console.log(JSON.stringify({
  checks: checks.length,
  passed: checks.length - failures.length,
  failed: failures.length,
  failures: failures.map((item) => `${item.name}${item.detail ? `: ${item.detail}` : ""}`)
}, null, 2));
if (failures.length) process.exitCode = 1;
