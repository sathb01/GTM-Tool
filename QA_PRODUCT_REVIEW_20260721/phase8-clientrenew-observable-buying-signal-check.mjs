import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const recordId = "qa3-post-saas-clientrenew-20260724";
const response = await fetch(`${baseUrl}/api/records/${recordId}`, { cache: "no-store" });
if (!response.ok) throw new Error(`Could not load ${recordId}: ${response.status}`);
const record = (await response.json()).record;
const data = record.data || {};

const helperSource = fs.readFileSync(path.join(root, "tool", "target-discovery.js"), "utf8");
const helperContext = vm.createContext({});
vm.runInContext(helperSource, helperContext, { filename: "target-discovery.js" });
const helper = helperContext.GTM_TARGET_DISCOVERY;
const resultsSource = fs.readFileSync(path.join(root, "tool", "results.html"), "utf8");
const targetStart = resultsSource.indexOf("function renderTargetListWorkspace(data)");
const targetEnd = resultsSource.indexOf("function proofBuilderEvidence(data, profile)", targetStart);
const targetSource = resultsSource.slice(targetStart, targetEnd);
const readinessStart = resultsSource.indexOf("function signalReadinessDimensions(data");
const readinessEnd = resultsSource.indexOf("function signalReadinessSnapshot(data", readinessStart);
const readinessSource = resultsSource.slice(readinessStart, readinessEnd);
const taskStart = resultsSource.indexOf("function readinessTaskForImprovement(");
const taskEnd = resultsSource.indexOf("function readinessDiagnostic(", taskStart);
const taskSource = resultsSource.slice(taskStart, taskEnd);

const icp = data.bestFitCustomerGroup || data.quickBestFitCustomer;
const buyer = data["signalPlayPortfolio__play-1__primaryBuyerPersona"] || data.bestFitDecisionMaker;
const savedGeneric = data["signalPlayAssessments__play-1__signalRoutingRules__signal-rule-1__signal"];
const savedGenericBefore = JSON.stringify({
  bestFitTrigger: data["bestFitTrigger__item-1"],
  buyingTrigger: data["buyingTriggersSummary__item-1"],
  routingSignal: savedGeneric,
  scoreImpact: data["signalPlayAssessments__play-1__signalRoutingRules__signal-rule-1__scoreImpact"]
});
const signals = helper.observableBuyingSignals({ icp, buyer, crm: "HubSpot" });
const normalizedLegacy = helper.normalizeSavedBuyingSignal(savedGeneric);

const checks = [];
const check = (name, passed, detail = "") => checks.push({ name, passed: Boolean(passed), ...(detail ? { detail } : {}) });

check("Correct ClientRenew record loaded", /ClientRenew/i.test(record.name || data.companyName), record.name || data.companyName);
check("Fixture contains the legacy generic signal being migrated", /^Customer complaints$/i.test(savedGeneric), savedGeneric);
check("Generic complaint signal is classified legacy and excluded", normalizedLegacy.status === "Legacy / unverified" && normalizedLegacy.eligibleForPriority === false, JSON.stringify(normalizedLegacy));
check("Generic complaint signal is not a supported current option", signals.every((signal) => !/customer complaints?/i.test(signal.label)), signals.map((signal) => signal.label).join(" | "));
check("Supported signals include ClientRenew hiring context", signals.some((signal) => /customer-success.*account-management.*renewal.*RevOps/i.test(signal.label)), signals.map((signal) => signal.label).join(" | "));
check("Supported signals include public HubSpot evidence", signals.some((signal) => /HubSpot/i.test(signal.label)), signals.map((signal) => signal.label).join(" | "));
check("Supported signals include recurring client-service evidence", signals.some((signal) => /recurring-client-service/i.test(signal.label)), signals.map((signal) => signal.label).join(" | "));
check("Supported signals include growth or service expansion", signals.some((signal) => /Acquisition.*growth.*service expansion/i.test(signal.label)), signals.map((signal) => signal.label).join(" | "));
check("Supported signals include referral or CRM context", signals.some((signal) => /Referral.*existing relationship/i.test(signal.label)), signals.map((signal) => signal.label).join(" | "));
check("Every supported signal states source and implication", signals.every((signal) => signal.whereFound && signal.implication), JSON.stringify(signals));
check("Signal guidance does not fabricate company facts", signals.every((signal) => /can |may |does not prove|remains reported context/i.test(signal.implication)), signals.map((signal) => signal.implication).join(" | "));
check("Priority rule is unavailable without a selected observable signal", helper.priorityRuleForSignal("", signals) === null);
check("Priority rule is contextual after selection", /ranks accounts for outreach review only/i.test(helper.priorityRuleForSignal(signals[0].id, signals)?.explanation || ""));
check("Target UI does not ask for a signal before the first search", !/targetObservableSignal|Select an observable signal|Observable buying signal/.test(targetSource));
check("Target UI keeps signal-source guidance out of the normal flow", !/Where it can be found:|What it implies:|Source to verify/.test(targetSource));
check("Target UI offers only a simple post-result signal preference", /data-discovery-feedback="preferredSignal"/.test(targetSource) && /refinement\.hidden = !discovery\.candidates\.length/.test(targetSource));
check("Legacy value remains handled in the canonical readiness migration", /legacyUnverifiedBuyingSignals/.test(resultsSource) && /excludedFromPriority: true/.test(resultsSource));
check("Readiness scoring excludes legacy generic routing rules", /filter\(\(row\) => !legacyUnverifiedBuyingSignal\(row\.values\.signal\)\)/.test(readinessSource));
check("Readiness task requires sourceable signal before point rule", /Choose a sourceable buying signal/.test(taskSource) && /data-observable-priority-fields/.test(taskSource) && /data-observable-signal-select/.test(taskSource));
check("Readiness migration archives old rule before replacement", /legacyUnverifiedBuyingSignals/.test(resultsSource) && /excludedFromPriority: true/.test(resultsSource));
check("Pure migration inspection did not mutate the saved fixture", savedGenericBefore === JSON.stringify({
  bestFitTrigger: data["bestFitTrigger__item-1"],
  buyingTrigger: data["buyingTriggersSummary__item-1"],
  routingSignal: savedGeneric,
  scoreImpact: data["signalPlayAssessments__play-1__signalRoutingRules__signal-rule-1__scoreImpact"]
}));

const failed = checks.filter((item) => !item.passed);
console.log(JSON.stringify({ checks: checks.length, passed: checks.length - failed.length, failed: failed.length, failures: failed }, null, 2));
if (failed.length) process.exitCode = 1;
