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
check("Good fits create a review list without CRM work", /Choose Good fit to add a company to the review list/.test(targetSource) && !/Confirm HubSpot additions|copyTargetListFields/.test(targetSource));
check("Target page exposes one review-list completion action", /id="confirmTargetReviewList"/.test(targetSource) && /Save review list and continue/.test(targetSource));
check("Target page removes old setup and progress actions", !/openTargetListSetup|saveTargetListProgress|targetListSetupProgress|Continue later in Tool Setup/.test(targetSource));
check("Review-list completion marks setup ready", /toolSetup\.statuses\.targets = "Ready"/.test(targetSource));
check("Review-list completion advances directly to the next ordered tool", /nextTool[\s\S]*?guidedToolWorkspaceUrl\(nextTool\.id, origin\)/.test(targetSource));
check("Every active setup card has a positive completion path", /guidedToolTask\(tool\.id\)\?\.completeLabel/.test(activeSource) && /guidedToolWorkspaceUrl\(tool\.id, "summary"\)/.test(activeSource));
check("Blocker save is secondary", /class="secondary" id="saveToolSetupButton"/.test(activeSource));
check("Continue later remains secondary", /class="secondary" data-continue-tool-later/.test(activeSource));
check("Week completion has one user-facing completion action", /id="reviewCloseWeekButton">Complete Week \$\{weeklyWorkspace\.currentWeek\} and Continue/.test(activeSource));
check("One click invokes the save-and-advance close action", /#reviewCloseWeekButton[\s\S]*?closeButton\.click\(\)/.test(activeSource));
check("Duplicate close workspace is hidden when nothing needs a distinct decision", /review\.hidden = unfinishedCount === 0/.test(activeSource));
check("Distinct unfinished-work action is not a duplicate completion CTA", /id="closeActivePlanWeek">Save close decisions and continue/.test(activeSource));

const failed = checks.filter((item) => !item.passed);
console.log(JSON.stringify({ checks: checks.length, passed: checks.length - failed.length, failed: failed.length, failures: failed }, null, 2));
if (failed.length) process.exitCode = 1;
