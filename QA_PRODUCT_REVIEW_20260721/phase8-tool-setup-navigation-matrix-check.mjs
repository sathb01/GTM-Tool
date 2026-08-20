import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const source = fs.readFileSync(path.join(root, "tool", "results.html"), "utf8");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const recordId = "qa3-post-saas-clientrenew-20260724";
const response = await fetch(`${baseUrl}/api/records/${recordId}`, { cache: "no-store" });
if (!response.ok) throw new Error(`Could not load ${recordId}: ${response.status}`);
const record = (await response.json()).record;

const tasks = [
  { id: "icp", label: "ICP Brief", asset: "icp", completion: /appendGuidedReferenceCompletion\(data, "icp"\)/ },
  { id: "personas", label: "Persona Brief", asset: "personas", completion: /appendGuidedReferenceCompletion\(data, "personas"\)/ },
  { id: "targets", label: "Target List Setup", asset: "targets", completion: /id="confirmTargetReviewList"[\s\S]*?Save review list and complete Target List Setup/ },
  { id: "messaging", label: "Messaging Kit", asset: "messaging", completion: /id="saveMessagingDraft">Save Message and continue/ },
  { id: "outreach", label: "Outreach Sequence", asset: "outreach", completion: /id="saveOutreachSequence">Complete Outreach Sequence and continue/ },
  { id: "weekly-review-setup", label: "Weekly GTM Review Setup", asset: "weekly-review-setup", completion: /id="setWeeklyReviewReady">Set weekly review ready and continue/ }
];

const checks = [];
const check = (task, pathName, passed, detail = "") => checks.push({ task, path: pathName, passed: Boolean(passed), ...(detail ? { detail } : {}) });
const escaped = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

check("ClientRenew", "fixture", /ClientRenew/i.test(record?.name || record?.data?.companyName || ""), record?.name || "missing record");
for (const task of tasks) {
  const registryPattern = new RegExp(`id: "${escaped(task.id)}", label: "${escaped(task.label)}", asset: "${escaped(task.asset)}"`);
  check(task.label, "canonical task registry", registryPattern.test(source));
  check(task.label, "Plan Summary CTA", /guidedToolWorkspaceUrl\(current\.id, "summary"\)/.test(source) && /guidedToolWorkspaceUrl\(tool\.id, "summary"\)/.test(source));
  check(task.label, "Readiness Blocker CTA", /href: guidedToolWorkspaceUrl\(tool\.id, "summary"\)/.test(source));
  check(task.label, "Tool Setup CTA", /guidedToolWorkspaceUrl\(tool\.id, "summary"\)/.test(source));
  check(task.label, "This Week CTA", /activePlanToolUrl\(resource\.asset, "active"\)/.test(source) && /returnMode === "active" \? "this-week" : "summary"/.test(source));
  check(task.label, "direct asset URL", /function guidedToolWorkspaceUrl/.test(source) && /taskOrigin: guidedToolOrigin\(origin\)/.test(source));
  check(task.label, "completion CTA", task.completion.test(source));
  check(task.label, "blocker and continue later", /appendGuidedToolSecondaryControls\(data, guidedTask\.id\)/.test(source) && /id="saveGuidedToolBlocker"/.test(source) && /id="continueGuidedToolLater"/.test(source));
  check(task.label, "return context", /guidedToolReturnUrl\(taskOrigin\)/.test(source) && /Opened from \$\{escapeHtml\(returnLabel\)\}/.test(source));
}

check("All tasks", "no intermediate setup route", !/reportAssetUrlWithState\("active", \{ setupTask:/.test(source));
check("All tasks", "no status-only primary completion", !/data-mark-tool-ready/.test(source));
check("All tasks", "sticky workspace clearance", /workspace-return-bar \{ position: sticky; top: 70px/.test(source) && /scroll-padding-top: 250px/.test(source) && /workspace-section \{ scroll-margin-top: 250px/.test(source) && /The browser resolves a hash before this sticky return bar exists\./.test(source));
check("All tasks", "return bar stays in the workspace column", /currentNav\.insertAdjacentElement\("afterend", bar\)/.test(source) && /Prepending this[\s\S]{0,180}sidebar's grid area/.test(source));
check("All tasks", "origin-specific returns", /taskOrigin === "this-week" \? "This Week" : "Plan Summary"/.test(source) && /guidedToolReturnUrl\(origin\)/.test(source));

const failed = checks.filter((item) => !item.passed);
const matrix = tasks.map((task) => ({
  task: task.label,
  checks: checks.filter((item) => item.task === task.label).length,
  passed: checks.filter((item) => item.task === task.label && item.passed).length
}));
console.log(JSON.stringify({ record: record?.name, checks: checks.length, passed: checks.length - failed.length, failed: failed.length, matrix, failures: failed }, null, 2));
if (failed.length) process.exitCode = 1;
