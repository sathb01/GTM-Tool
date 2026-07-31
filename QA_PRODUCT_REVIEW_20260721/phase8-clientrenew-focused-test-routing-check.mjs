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

const incomplete = helper.focusedTestRouteGuidance({
  setupComplete: false,
  currentTool: "Target List Setup",
  currentStatus: "In progress",
  currentDone: "The Target List structure is ready in HubSpot; Week 1 will add the 25 targets."
});
const complete = helper.focusedTestRouteGuidance({
  setupComplete: true,
  weekAction: "Build the Target List",
  listStatus: "List created with required fields",
  resultsLocation: "HubSpot and Weekly GTM Review"
});

const checks = [];
const check = (name, passed, detail = "") => checks.push({ name, passed: Boolean(passed), ...(detail ? { detail } : {}) });

check("Correct ClientRenew record loaded", /ClientRenew/i.test(record.name || data.companyName), record.name || data.companyName);
check("Incomplete launch names one exact prerequisite", !incomplete.ready && /Target List Setup/.test(incomplete.label) && /in progress/i.test(incomplete.explanation), JSON.stringify(incomplete));
check("Incomplete launch includes the completion condition", /Target List structure is ready in HubSpot/.test(incomplete.explanation), incomplete.explanation);
check("Complete launch enters the focused test", complete.ready && complete.label === "Start the focused test", JSON.stringify(complete));
check("Complete launch names the first action", /Build the Target List/.test(complete.explanation), complete.explanation);
check("Complete launch names list status and result location", /List created with required fields/.test(complete.explanation) && /HubSpot and Weekly GTM Review/.test(complete.explanation), complete.explanation);
check("Summary computes a state-aware focused-launch route", /const focusedLaunch = focusedTestLaunchState\(model\)/.test(resultsSource));
check("Summary no longer hardcodes Start focused test to generic active route", !/href="\$\{escapeHtml\(reportAssetUrl\("active"\)\)\}">Start the focused test/.test(resultsSource));
check("Current tool routes directly to its task", /guidedToolWorkspaceUrl\(current\.id, "summary"\)/.test(resultsSource) && !/reportAssetUrlWithState\("active", \{ setupTask: current\.id \}\)/.test(resultsSource));
check("Completed setup uses an explicit execution-state route", /reportAssetUrlWithState\("active", \{ focusedTest: "1" \}\)/.test(resultsSource));
check("Focused-test route starts Week 1 only when setup is ready", /focusedTestRequested && toolSetup\.ready && !toolSetup\.started/.test(resultsSource));
check("Execution entry shows first action and 25-account status", /Focused test started[\s\S]*?First action:[\s\S]*?25-account test:/.test(resultsSource));
check("Execution entry names where results are recorded", /Record results in:/.test(resultsSource));

const failed = checks.filter((item) => !item.passed);
console.log(JSON.stringify({ checks: checks.length, passed: checks.length - failed.length, failed: failed.length, failures: failed }, null, 2));
if (failed.length) process.exitCode = 1;
