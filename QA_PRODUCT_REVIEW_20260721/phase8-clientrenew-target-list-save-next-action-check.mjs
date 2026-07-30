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

const customer = data.bestFitCustomerGroup || data.quickBestFitCustomer;
const system = data.revenueTrackingSystem || "HubSpot";
const complete = helper.targetListProgressGuidance({
  status: "List created with required fields",
  system,
  customer,
  nextTool: "Messaging Kit"
});
const incomplete = helper.targetListProgressGuidance({
  status: "List created; required fields still missing",
  system,
  customer,
  nextTool: "Messaging Kit"
});
const notStarted = helper.targetListProgressGuidance({
  status: "Not started",
  system,
  customer,
  nextTool: "Messaging Kit"
});
const creationPlan = helper.targetListCreationPlan({
  company: data.companyName,
  customer,
  criteria: [
    `Customer group: ${customer}`,
    `Problem relevance: ${data.bestFitPrimaryPain || data.quickBuyerProblem}`,
    `Trigger: ${data.quickUrgencyNow}`
  ],
  exclusions: [data.quickWhoToAvoid],
  requiredFields: ["Account name", "Website", "Buyer role", "Fit reason", "Source", "Owner", "Status", "Next action and due date"]
});
const countMissing = helper.targetListProgressGuidance({
  status: "First qualified accounts added",
  initialCount: "",
  system,
  customer,
  nextTool: "Messaging Kit"
});

const checks = [];
const check = (name, passed, detail = "") => checks.push({ name, passed: Boolean(passed), ...(detail ? { detail } : {}) });

check("Correct ClientRenew record loaded", /ClientRenew/i.test(record.name || data.companyName), record.name || data.companyName);
check("Completed list setup advances", complete.ready, JSON.stringify(complete));
check("Completed list setup names the next ordered task", /Messaging Kit/.test(complete.body) && /Messaging Kit/.test(complete.actionLabel), JSON.stringify(complete));
check("Completed next action is never empty", Boolean(complete.title && complete.body && complete.actionLabel), JSON.stringify(complete));
check("Incomplete setup remains current", !incomplete.ready, JSON.stringify(incomplete));
check("Incomplete setup names exact required fields", /account name.*website.*buyer role.*fit reason.*source.*owner.*status.*dated next action/i.test(incomplete.body), incomplete.body);
check("Incomplete setup explains why the fields matter", /who was worked, why they fit, and what happens next/i.test(incomplete.body), incomplete.body);
check("Not-started setup provides a concrete creation action", !notStarted.ready && /Create the list in HubSpot/i.test(notStarted.actionLabel), JSON.stringify(notStarted));
check("Added-account status requires a saved count", !countMissing.ready && /account count is empty/i.test(countMissing.body) && countMissing.actionTarget === "#target-list-progress", JSON.stringify(countMissing));
check("Primary list action creates a ClientRenew-specific checklist", /ClientRenew/.test(creationPlan.listName) && creationPlan.initialQuantity === 25 && creationPlan.criteria.some((item) => item.includes(customer)), JSON.stringify(creationPlan));
check("Creation checklist includes saved exclusions", creationPlan.exclusions.some((item) => item.includes(data.quickWhoToAvoid)), JSON.stringify(creationPlan.exclusions));
check("Creation checklist includes required HubSpot fields", /Account name/.test(creationPlan.requiredFields.join(" ")) && /Next action and due date/.test(creationPlan.requiredFields.join(" ")), JSON.stringify(creationPlan.requiredFields));
check("Primary Create action reveals the manual checklist", /id="openTargetListSetup">Create the list in/.test(resultsSource) && /openTargetListSetup[\s\S]*?checklist\.hidden = false/.test(resultsSource));
check("Checklist explicitly avoids assuming HubSpot integration", /No HubSpot integration is assumed/.test(resultsSource));
check("Checklist provides criteria, exclusions, fields, name, quantity, and completion", /Account criteria and filters[\s\S]*?Exclusions[\s\S]*?Required HubSpot fields or properties[\s\S]*?Complete and continue/.test(resultsSource) && /Recommended list name:/.test(resultsSource) && /Initial quantity:/.test(resultsSource));
check("Checklist routes to progress completion", /href="#target-list-progress">Mark list created \/ record count \/ continue/.test(resultsSource));
check("Target List page has a Save progress action", /id="saveTargetListProgress">Save progress</.test(resultsSource));
check("Save handler persists the target workspace", /saveTargetListProgress[\s\S]*?saveTargetListWorkspace\(data, targetWorkspace/.test(resultsSource));
check("Save handler advances Target List Setup only when ready", /toolSetup\.statuses\.targets = initialGuidance\.ready \? "Ready" : "In progress"/.test(resultsSource));
check("Save handler immediately renders the next guided action", /saveTargetListWorkspace[\s\S]*?renderNextTargetListAction\(guidance, nextTool\)/.test(resultsSource));
check("Ready state continues through Tool Setup", /guidance\.ready \? reportAssetUrl\("active"\)/.test(resultsSource));
check("Incomplete state routes to the contextual list action", /"#target-list-system-setup"/.test(resultsSource));

const failed = checks.filter((item) => !item.passed);
console.log(JSON.stringify({ checks: checks.length, passed: checks.length - failed.length, failed: failed.length, failures: failed }, null, 2));
if (failed.length) process.exitCode = 1;
