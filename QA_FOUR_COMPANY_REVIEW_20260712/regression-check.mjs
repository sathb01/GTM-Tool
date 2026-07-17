import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const records = JSON.parse(fs.readFileSync(path.join(root, "server/data/records.json"), "utf8"));
const appSource = fs.readFileSync(path.join(root, "tool/app.js"), "utf8");
const resultsSource = fs.readFileSync(path.join(root, "tool/results.html"), "utf8");
const facilitationSource = fs.readFileSync(path.join(root, "tool/facilitation.html"), "utf8");

const ids = {
  pawpath: "qa-pre-dtc-pawpath-20260712",
  forgeline: "qa-post-b2b-forgeline-20260712",
  brightnest: "qa-pre-retail-brightnest-20260712",
  relay: "qa-post-saas-relaymetrics-20260712"
};
const fullIds = Object.fromEntries(Object.entries(ids).map(([key, id]) => [key, `${id}-full-20260714`]));

const failures = [];
const warnings = [];
let passed = 0;

function check(name, condition, detail = "") {
  if (condition) {
    passed += 1;
    return;
  }
  failures.push({ name, detail });
}

function warn(name, condition, detail = "") {
  if (!condition) warnings.push({ name, detail });
}

function record(id) {
  return records.find((item) => item.id === id);
}

function text(data) {
  return Object.values(data || {}).filter((value) => typeof value === "string").join(" | ");
}

function has(data, pattern) {
  return pattern.test(text(data));
}

function field(data, key) {
  return String(data?.[key] || "").trim();
}

function assertCoreRecord(label, item) {
  check(`${label}: saved record exists`, Boolean(item));
  if (!item) return;
  check(`${label}: company name`, Boolean(field(item.data, "companyName")));
  check(`${label}: company stage`, Boolean(field(item.data, "companyStage")));
  check(`${label}: no unresolved AI placeholder`, !/(^|\W)AI(?: recommendation| please)?($|\W)/i.test(text(item.data)));
  check(`${label}: no bare Other answer`, !Object.values(item.data).some((value) => String(value).trim() === "Other"));
  check(`${label}: saved timestamp`, Boolean(field(item.data, "savedAt") || item.updatedAt));
}

const pawpath = record(ids.pawpath);
const forgeline = record(ids.forgeline);
const brightnest = record(ids.brightnest);
const relay = record(ids.relay);

[
  ["PawPath", pawpath],
  ["ForgeLine", forgeline],
  ["BrightNest", brightnest],
  ["RelayMetrics", relay]
].forEach(([label, item]) => assertCoreRecord(label, item));

if (pawpath) {
  const data = pawpath.data;
  check("PawPath: pre-revenue stage", /pre.?revenue/i.test(field(data, "companyStage")));
  check("PawPath: DTC route is primary", /direct.to.consumer|end consumer/i.test(field(data, "preRevenueRouteToMarket")));
  check("PawPath: specific first-win segment", /urban dog owners.*before sunrise|urban dog owners.*after dark/i.test(text(data)));
  check("PawPath: validation uses consumer evidence", /waitlist|customer or user interviews|willingness to pay/i.test(text(data)));
  check("PawPath: retail is not the selected first buying path", !/retail|wholesale/i.test(field(data, "preCustomerHypotheses__first-win-segment-1__likelyBuyerPath")));
  warn("PawPath: review mode agrees with pre-revenue stage", /pre.?revenue/i.test(field(data, "reviewMode")), `reviewMode is ${field(data, "reviewMode") || "blank"}`);
}

if (brightnest) {
  const data = brightnest.data;
  check("BrightNest: pre-revenue stage", /pre.?revenue/i.test(field(data, "companyStage")));
  check("BrightNest: retail-first segment is specific", /independent.*retailers.*one to five locations/i.test(text(data)));
  check("BrightNest: channel buyer is selected first", /channel buyers|retail|wholesale/i.test(field(data, "prePrimaryHypothesis")));
  check("BrightNest: validation includes retail economics", /margin|opening order|paid.*store|wholesale/i.test(text(data)));
  check("BrightNest: supporting DTC path does not replace retail target", !/end users with a specific use case/i.test(field(data, "prePrimaryHypothesis")));
}

if (forgeline) {
  const data = forgeline.data;
  check("ForgeLine: specialty manufacturing is the focus", /specialty manufacturers/i.test(field(data, "bestFitCustomerGroup")));
  check("ForgeLine: enterprise transformation is excluded", /enterprise transformations/i.test(text(data)));
  check("ForgeLine: core offer is named", /throughput improvement program/i.test(field(data, "primaryGtmOffer")));
  check("ForgeLine: primary buyer is COO", /COO/i.test(field(data, "bestFitDecisionMaker")));
  check("ForgeLine: existing referral motion is preserved", /referral/i.test(field(data, "primaryRevenueMotion")));
  check("ForgeLine: missing proof assets are specific", /ROI calculator/i.test(text(data)) && /proposal template/i.test(text(data)));
}

if (relay) {
  const data = relay.data;
  check("RelayMetrics: evidence-backed segment wins", /professional services firms.*20-75/i.test(field(data, "bestFitCustomerGroup")));
  check("RelayMetrics: assumed SaaS segment remains labeled as an assumption", /assumed ICP.*SaaS/i.test(field(data, "quickBestFitCustomer")));
  check("RelayMetrics: test motion uses the evidence-backed segment", /professional-services forecast test/i.test(field(data, "primaryRevenueMotion")));
  check("RelayMetrics: offer is named", /RelayMetrics Forecast Workspace/i.test(field(data, "primaryGtmOffer")));
  check("RelayMetrics: primary buyer is explicit", /Founder|Owner/i.test(field(data, "bestFitDecisionMaker")));
}

const requiredAssets = ["active", "icp", "personas", "messaging", "targets", "proof-assets", "outreach", "pipeline-workspace", "weekly-review"];
requiredAssets.forEach((asset) => {
  check(`Navigation: ${asset} is routed from intake`, appSource.includes(`"${asset}"`));
  check(`Navigation: ${asset} is routed from report`, resultsSource.includes(`reportAssetUrl("${asset}")`) || resultsSource.includes(`asset") === "${asset}"`));
});
check("Navigation: GTM Plan Summary is the first asset", /addNavItem\("Assets", "GTM Plan Summary", reportAssetUrl\("gtm"\)\);\s*addNavItem\("Assets", "Plan Status"/.test(resultsSource));
check("Intake assets: GTM Plan Summary is first", /const assetLinks = isPreRevenueMode\(\)\s*\? \[\s*\["GTM Plan Summary", "gtm"\]/.test(appSource));
check("GTM Plan Summary: four cards use dynamic plan state", /const dynamicSummary = dynamicPlanSummary\(model\)/.test(resultsSource) && /currentPriorities/.test(resultsSource) && /Evidence: \$\{dynamicSummary\.feedback\.state\}/.test(resultsSource));
check("GTM Plan Summary: 90-day focus is bulleted", /<h3>Recommended 90-Day Focus<\/h3>\s*<ul class="two-column-list">/.test(resultsSource));
check("GTM Plan Summary: decision and completeness are bulleted", /<h3>Decision Required<\/h3>\$\{summaryBulletList\(decisionContent\.decisionRequired, true\)\}/.test(resultsSource) && /<h3>Plan Completeness<\/h3>\$\{summaryBulletList\(planCompletenessCopy\(model\)\)\}/.test(resultsSource));
check("Improvement flow: exact report return is preserved", /function reportImprovementReturn\(trigger\)/.test(resultsSource) && /resumeY/.test(resultsSource));
check("Improvement flow: save and return actions are explicit", /Save Changes and Return/.test(resultsSource + facilitationSource) && /Return Without Saving/.test(facilitationSource));
check("Active Plan: action runner preserves its origin", /function setupActiveActionRoundTripLinks\(\)/.test(resultsSource) && /actionReturnTo/.test(resultsSource));
check("Active Plan: action runner has explicit return actions", /Save Evidence and Return/.test(resultsSource) && /activeActionReturnWithoutSaving/.test(resultsSource));
check("ICP Brief: missing customer context has guided improvement", /improveIcpCustomerContext/.test(resultsSource) && /task: "customer-context"/.test(resultsSource));
check("Customer Priority Framework: customer context source is available", /title: "Start With the Customer Context"[\s\S]*id: "customerContextStarter"/.test(appSource + fs.readFileSync(path.join(root, "tool/intake-schema.js"), "utf8")));
check("Validation Workbook: limited to validation surfaces", !/tracker\.textContent = "Download Validation Workbook"/.test(resultsSource));
check("Pipeline: weekly review consumes opportunity data", /pipelineWorkspaceState\(data, profile\)/.test(resultsSource) && /openOpportunities/.test(resultsSource));
check("Pipeline: CRM source-of-truth mode exists", resultsSource.includes("CRM is the source of truth"));
check("Persistence: asset workspaces update the saved record", /api\/records\//.test(resultsSource) && /method: "PUT"/.test(resultsSource));
check("Mode consistency: pre-revenue records are normalized on intake load", /toolMode === "Pre-Revenue Validation"[\s\S]{0,100}reviewMode = "preRevenue"/.test(appSource));
check("Mode consistency: pre-revenue records are normalized on report load", /record\.data\?\.toolMode === "Pre-Revenue Validation"[\s\S]{0,100}record\.data\.reviewMode = "preRevenue"/.test(resultsSource));

const workspaceContracts = [
  ["Messaging Kit", "messagingWorkspaceState", "saveMessagingWorkspace", "renderMessagingKit"],
  ["Target List", "targetListWorkspaceState", "saveTargetListWorkspace", "renderTargetListWorkspace"],
  ["Proof Asset Builder", "proofBuilderState", "saveProofBuilderWorkspace", "renderProofAssetWorkspace"],
  ["Outreach Sequence", "outreachWorkspaceState", "saveOutreachWorkspace", "renderOutreachWorkspace"],
  ["Pipeline and Opportunities", "pipelineWorkspaceState", "savePipelineWorkspace", "renderPipelineWorkspace"],
  ["Weekly GTM Review", "weeklyReviewEvidence", "saveWeeklyReviewWorkspace", "renderWeeklyReviewWorkspace"]
];
workspaceContracts.forEach(([label, stateFunction, saveFunction, renderFunction]) => {
  check(`${label}: state contract exists`, resultsSource.includes(`function ${stateFunction}`));
  check(`${label}: persistence contract exists`, resultsSource.includes(`function ${saveFunction}`));
  check(`${label}: render contract exists`, resultsSource.includes(`function ${renderFunction}`));
});

check("Link copy: asset links do not repeat Open before an asset name", !/Open (?:Active Plan|Messaging Kit|Target List|Proof Asset Builder|Outreach Sequence|Weekly GTM Review|Validation Workspace|GTM Action Plan)/.test(resultsSource + appSource));

Object.entries(fullIds).forEach(([key, id]) => {
  const item = record(id);
  const label = `Fully populated ${key}`;
  check(`${label}: saved record exists`, Boolean(item));
  if (!item) return;
  const data = item.data;
  check(`${label}: no unresolved placeholder answer`, !/(^|\W)(?:AI please|AI recommendation|Not captured yet)($|\W)/i.test(text(data)));
  check(`${label}: no bare Other answer`, !Object.values(data).some((value) => String(value).trim() === "Other"));
  check(`${label}: Messaging Kit populated`, data.messagingKitWorkspace?.drafts?.length > 0);
  check(`${label}: Target List populated`, data.targetListWorkspace?.targets?.length > 0);
  check(`${label}: Proof Asset Builder populated`, data.proofAssetWorkspace?.drafts?.length > 0);
  check(`${label}: Outreach Sequence populated`, data.outreachSequenceWorkspace?.sequences?.length > 0);
  check(`${label}: Pipeline populated`, data.pipelineOpportunityWorkspace?.opportunities?.length > 0);
  check(`${label}: Weekly Review populated`, data.weeklyReviewWorkspace?.reviews?.length > 0);
  const targets = new Set((data.targetListWorkspace?.targets || []).map((target) => target.id));
  const messages = new Set((data.messagingKitWorkspace?.drafts || []).map((draft) => draft.id));
  const proof = new Set((data.proofAssetWorkspace?.drafts || []).map((draft) => draft.id));
  const assignments = (data.outreachSequenceWorkspace?.sequences || []).flatMap((sequence) => sequence.assignments || []);
  const steps = (data.outreachSequenceWorkspace?.sequences || []).flatMap((sequence) => sequence.steps || []);
  check(`${label}: outreach targets resolve`, assignments.every((assignment) => !assignment.targetId || targets.has(assignment.targetId)));
  check(`${label}: outreach messages resolve`, steps.every((step) => !step.messageId || messages.has(step.messageId)));
  check(`${label}: outreach proof resolves`, steps.every((step) => !step.proofId || proof.has(step.proofId)));
  check(`${label}: pipeline targets resolve`, (data.pipelineOpportunityWorkspace?.opportunities || []).every((opportunity) => !opportunity.targetId || targets.has(opportunity.targetId)));
  check(`${label}: CRM source is explicit`, Boolean(data.pipelineOpportunityWorkspace?.sourceOfTruth));
});

const output = {
  generatedAt: new Date().toISOString(),
  passed,
  failed: failures.length,
  warnings: warnings.length,
  failures,
  warningDetails: warnings
};

console.log(JSON.stringify(output, null, 2));
if (failures.length) process.exitCode = 1;
