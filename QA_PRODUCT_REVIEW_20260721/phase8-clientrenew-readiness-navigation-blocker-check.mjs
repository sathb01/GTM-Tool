import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const recordId = "qa3-post-saas-clientrenew-20260724";
const response = await fetch(`${baseUrl}/api/records/${recordId}`);
if (!response.ok) throw new Error(`Could not load ${recordId}: ${response.status}`);
const record = (await response.json()).record;
const data = record.data || {};

const helperSource = fs.readFileSync(path.join(root, "tool", "guided-task-context.js"), "utf8");
const helperContext = vm.createContext({});
vm.runInContext(helperSource, helperContext, { filename: "guided-task-context.js" });
const helper = helperContext.GTM_GUIDED_TASK_CONTEXT;
const resultsSource = fs.readFileSync(path.join(root, "tool", "results.html"), "utf8");

const needsReview = helper.readinessNavigationGuidance({
  ready: false,
  currentTool: "ICP Brief",
  currentStatus: "Needs review"
});
const needsSetup = helper.readinessNavigationGuidance({
  ready: false,
  currentTool: "Target List Setup",
  currentStatus: "Not ready"
});
const inProgress = helper.readinessNavigationGuidance({
  ready: false,
  currentTool: "Messaging Kit",
  currentStatus: "In progress"
});
const blocked = helper.readinessNavigationGuidance({
  ready: false,
  currentTool: "Weekly GTM Review Setup",
  currentStatus: "Waiting / Blocked",
  blocker: "Waiting for the revenue owner to confirm Thursday's review."
});
const ready = helper.readinessNavigationGuidance({ ready: true, started: false });
const complete = helper.readinessNavigationGuidance({ ready: true, started: true });

const checks = [];
const check = (name, passed, detail = "") => checks.push({ name, passed: Boolean(passed), ...(detail ? { detail } : {}) });

check("Correct ClientRenew record loaded", /ClientRenew/i.test(record.name || data.companyName), record.name || data.companyName);
check("Pre-ready sidebar is labeled Readiness", needsReview.label === "Readiness" && /Start here: ICP Brief/.test(needsReview.meta), JSON.stringify(needsReview));
check("Needs-setup state continues to the exact tool", /Target List Setup/.test(needsSetup.actionLabel) && /not ready/i.test(needsSetup.copy), JSON.stringify(needsSetup));
check("In-progress state resumes the exact tool", /Messaging Kit/.test(inProgress.actionLabel) && /in progress/i.test(inProgress.copy), JSON.stringify(inProgress));
check("Blocked state includes the saved blocker", /Waiting for the revenue owner/.test(blocked.copy) && /Weekly GTM Review Setup/.test(blocked.actionLabel), JSON.stringify(blocked));
check("Ready state restores This Week", ready.label === "This Week" && ready.actionLabel === "Start This Week", JSON.stringify(ready));
check("Complete execution state preserves This Week", complete.label === "This Week" && complete.actionLabel === "Resume This Week", JSON.stringify(complete));
check("Sidebar uses state-aware label and exact destination", /addNavItem\("Plan", setupNavigation\.guidance\.label, setupNavigation\.href/.test(resultsSource));
check("Exact setup task is encoded in direct routes", /reportAssetUrlWithState\("active", \{ setupTask: (current|tool)\.id \}\)/.test(resultsSource));
check("Requested setup task opens directly", /requestedSetupTask[\s\S]*?requestedTool[\s\S]*?currentSetupTool = requestedTool/.test(resultsSource));
check("Blocker is canonical workflow state", /if \(toolSetup\.reasons\[toolId\]\) toolSetup\.statuses\[toolId\] = "Waiting \/ Blocked"/.test(resultsSource));
check("Clearing a blocker resumes in progress", /previousReason[\s\S]*?toolSetup\.statuses\[toolId\] = "In progress"/.test(resultsSource));
check("Plan Summary includes saved setup blocker", /setupNavigation\.blockers\[0\][\s\S]*?setupBlocker\?\.reason/.test(resultsSource));
check("Plan Summary blocker routes directly to exact task", /Resolve \$\{escapeHtml\(setupBlocker\.tool\.label\)\} blocker/.test(resultsSource));
check("Redundant manual status dropdown was removed", !/data-tool-setup-status/.test(resultsSource));
check("Reference completion is contextual inline confirmation", /data-mark-tool-ready/.test(resultsSource) && /ready to use this/.test(resultsSource));
check("Target List readiness is inferred from its guided confirmation", /toolSetup\.statuses\.targets = initialGuidance\.ready \? "Ready" : "In progress"/.test(resultsSource));
check("Messaging save advances its setup status", /saveMessagingWorkspace[\s\S]*?markObservedToolReady\(data, "messaging"\)/.test(resultsSource));
check("Outreach save advances its setup status", /saveOutreachWorkspace[\s\S]*?markObservedToolReady\(data, "outreach"\)/.test(resultsSource));
check("Weekly Review has contextual ready completion", /setup\.statuses\["weekly-review-setup"\] = complete \? "Ready" : "In progress"/.test(resultsSource));
check("Continue later advances without a status screen", /data-continue-tool-later[\s\S]*?toolSetup\.statuses\[toolId\] = "Skip for now"/.test(resultsSource));
check("Ready and Complete both advance to the next required tool", /const isComplete = \(tool\) => \["Ready", "Complete", "Skip for now"\]/.test(resultsSource));

const failed = checks.filter((item) => !item.passed);
console.log(JSON.stringify({ checks: checks.length, passed: checks.length - failed.length, failed: failed.length, failures: failed }, null, 2));
if (failed.length) process.exitCode = 1;
