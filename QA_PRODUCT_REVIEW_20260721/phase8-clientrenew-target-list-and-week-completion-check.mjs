import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const recordId = "qa3-post-saas-clientrenew-20260724";
const response = await fetch(`${baseUrl}/api/records/${recordId}`, { cache: "no-store" });
if (!response.ok) throw new Error(`Could not load ${recordId}: ${response.status}`);
const record = (await response.json()).record;
const data = record.data || {};
const resultsSource = fs.readFileSync(path.join(root, "tool", "results.html"), "utf8");

const targetStart = resultsSource.indexOf("function renderTargetListWorkspace(data)");
const targetEnd = resultsSource.indexOf("function proofBuilderEvidence(data, profile)", targetStart);
const targetSource = resultsSource.slice(targetStart, targetEnd);
const activeStart = resultsSource.indexOf("function renderActivePlanWorkspace(data)");
const activeEnd = resultsSource.indexOf("function messagingProfileModule", activeStart);
const activeSource = resultsSource.slice(activeStart, activeEnd);

const requiredFields = [
  "Company or account name",
  "Website or profile URL",
  "Primary contact and role",
  "Observable ICP fit signals",
  "Fit tier and reason",
  "Source or channel",
  "Owner",
  "Outreach status or CRM stage",
  "Last activity date",
  "Next action and due date",
  "Message or sequence used",
  "Buyer response, objection, or learning"
];
const forbiddenTargetCopy = [
  "Who Belongs on the First List",
  "Use the current ICP as the filter",
  "ICP and Persona references",
  "Primary buyer:",
  "Trigger:",
  "Recommended starting size",
  "Saved customer group:",
  "Account criteria and filters",
  "Do not copy the same working list"
];

const checks = [];
const check = (name, passed, detail = "") => checks.push({ name, passed: Boolean(passed), ...(detail ? { detail } : {}) });

check("Correct ClientRenew record loaded", /ClientRenew/i.test(record.name || data.companyName), record.name || data.companyName);
check("Target page starts with practical discovery heading", /<h2>Find target companies<\/h2>/.test(targetSource));
forbiddenTargetCopy.forEach((copy) => check(`Target page omits redundant narrative: ${copy}`, !targetSource.includes(copy)));
requiredFields.forEach((field) => check(`Required field retained: ${field}`, targetSource.includes(`"${field}"`)));
check("Target page has one compact record-count input", /Accepted companies added or verified in \$\{systemLabel\}/.test(targetSource) && /id="targetListInitialCount" type="number"/.test(targetSource));
check("Target page exposes the exact confirm-and-continue action", /id="confirmAcceptedTargetsAdded"/.test(targetSource) && /Confirm HubSpot additions and continue/.test(targetSource));
check("Target page exposes the exact fields-copy action", /id="copyTargetListFields">Copy Fields list/.test(targetSource));
check("Target page removes old setup and progress actions", !/openTargetListSetup|saveTargetListProgress|targetListSetupProgress|Continue later in Tool Setup/.test(targetSource));
check("Copy action copies required fields only", /copyTextToClipboard\(\["REQUIRED FIELDS", \.\.\.requiredFields\.map/.test(targetSource) && !/ACCOUNT CRITERIA|COMPLETION/.test(targetSource));
check("Confirmation marks the external setup ready", /toolSetup\.statuses\.targets = "Ready"/.test(targetSource));
check("Confirmation advances directly to the next ordered tool", /nextTool[\s\S]*?reportAssetUrlWithState\("active", \{ setupTask: nextTool\.id \}\)/.test(targetSource));
check("Every active setup card has a positive completion path", /Mark \$\{tool\.label\} ready and continue/.test(activeSource) && /Set up and confirm the list/.test(activeSource) && /Complete Messaging Kit and continue/.test(activeSource) && /Complete Outreach Sequence and continue/.test(activeSource) && /Complete GTM Review recommendations and continue/.test(activeSource));
check("Blocker save is secondary", /class="secondary" id="saveToolSetupButton"/.test(activeSource));
check("Continue later remains secondary", /class="secondary" data-continue-tool-later/.test(activeSource));
check("Week completion has one user-facing completion action", /id="reviewCloseWeekButton">Complete Week \$\{weeklyWorkspace\.currentWeek\} and Continue/.test(activeSource));
check("One click invokes the save-and-advance close action", /#reviewCloseWeekButton[\s\S]*?closeButton\.click\(\)/.test(activeSource));
check("Duplicate close workspace is hidden when nothing needs a distinct decision", /review\.hidden = unfinishedCount === 0/.test(activeSource));
check("Distinct unfinished-work action is not a duplicate completion CTA", /id="closeActivePlanWeek">Save close decisions and continue/.test(activeSource));

const failed = checks.filter((item) => !item.passed);
console.log(JSON.stringify({ checks: checks.length, passed: checks.length - failed.length, failed: failed.length, failures: failed }, null, 2));
if (failed.length) process.exitCode = 1;
