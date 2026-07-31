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

const conciseStart = resultsSource.indexOf("function renderWeeklyReviewSetup(data)");
const evidenceStart = resultsSource.indexOf("function weeklyReviewEvidence(data, profile)", conciseStart);
const conciseSource = resultsSource.slice(conciseStart, evidenceStart);
const weeklyWorkspaceStart = resultsSource.indexOf("function renderWeeklyReviewWorkspace(data)");
const weeklyWorkspaceSource = resultsSource.slice(weeklyWorkspaceStart);

const checks = [];
const check = (name, passed, detail = "") => checks.push({ name, passed: Boolean(passed), ...(detail ? { detail } : {}) });

check("Correct ClientRenew record loaded", /ClientRenew/i.test(record.name || data.companyName), record.name || data.companyName);
check("ClientRenew blocker remains cleared", !Object.prototype.hasOwnProperty.call(data.activePlanToolSetupWorkspace?.reasons || {}, "weekly-review-setup"), JSON.stringify(data.activePlanToolSetupWorkspace?.reasons || {}));
check("No-blocker summary omits generic improvement CTA", /setupBlocker \?[\s\S]*?: !blockerReady \?[\s\S]*?Improve the highest-impact blockers[\s\S]*?: ""/.test(resultsSource));
check("Only Not Ready score gaps become launch blockers", /const scoreBlockers = status\.label === "Not Ready"/.test(resultsSource));
check("No-blocker next state resumes exact setup task", /const nextState = setupNavigation\.current[\s\S]*?Setup in progress[\s\S]*?focusedLaunch\.href/.test(resultsSource));
check("No-blocker next state supports This Week execution", /setupNavigation\.setup\.started[\s\S]*?Continue This Week[\s\S]*?resume\.href/.test(resultsSource));
check("Concise setup has the approved title", /Recommended Steps for GTM Review/.test(conciseSource));
[
  "Establish management owner",
  "Determine review cadence",
  "Confirm the CRM as the single source of truth",
  "Set up a recurring meeting",
  "Define Go / No-Go criteria"
].forEach((step) => check(`Concise setup includes: ${step}`, conciseSource.includes(step)));
check("Concise setup is framed as recommendations, not a form", /concise setup recommendations, not a separate review form/.test(conciseSource));
check("Decision recording location is not rendered in concise setup", !/Decision recording location|weeklySetupLocation|recording-location confirmation/.test(conciseSource));
check("Setup does not render scorecard confirmation", !/weeklySetupScorecard|Scorecard confirmation/.test(conciseSource));
check("Setup does not render weekly decision-choice confirmation", !/weeklySetupDecisions|Decision choices for/.test(conciseSource));
check("Setup reuses canonical owner, cadence, CRM, and decision rules", /pipelineReviewOwner[\s\S]*?revenueReportingCadence[\s\S]*?revenueTrackingSystem[\s\S]*?continueRule[\s\S]*?stopRule/.test(conciseSource));
check("Setup asks only for missing canonical values", /const ownerInput = owner \? ""/i.test(conciseSource) && /const crmInput = crm \? ""/i.test(conciseSource) && /const dayInput = reviewDay \? ""/i.test(conciseSource));
check("Setup completion is one readiness confirmation", /id="setWeeklyReviewReady">Set weekly review ready/.test(conciseSource));
check("Ready setup provides a direct current-work action", /Set weekly review ready and continue/.test(conciseSource) && /guidedToolNextUrl\(data, "weekly-review-setup", origin\)/.test(conciseSource));
check("Actual weekly review contains the small scorecard", /Weekly scorecard:[\s\S]*?activity, responses, conversations, qualified opportunities, and one learning signal/.test(weeklyWorkspaceSource));
check("Actual weekly review saves the learning signal", /learningSignal: overview\.querySelector\("#weeklyReviewLearningSignal"\)/.test(weeklyWorkspaceSource));
check("Actual weekly review retains Continue Revise Pause Stop choices", /Final decision[\s\S]*?\["Need more evidence", "Continue", "Revise", "Pause \/ Stop"\]/.test(weeklyWorkspaceSource));

const failed = checks.filter((item) => !item.passed);
console.log(JSON.stringify({ checks: checks.length, passed: checks.length - failed.length, failed: failed.length, failures: failed }, null, 2));
if (failed.length) process.exitCode = 1;
