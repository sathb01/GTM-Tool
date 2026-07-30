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
const buyer = data.bestFitDecisionMaker || data["revenueMotionPortfolio__motion-1__primaryBuyer"];
const offer = data["offerPortfolio__offer-1__offerName"] || data.primaryOfferName;
const motion = data["revenueMotionPortfolio__motion-1__playName"] || data.quickCurrentSalesMotion;
const pilot = data["revenueMotionPortfolio__motion-1__newOffer"] || data.bestFitFirstUseCase;
const channel = data["revenueMotionPortfolio__motion-1__channelSource"] || data.quickPrimaryRevenueSource;
const recommendation = helper.smallestEvidenceProducingNextStep({ customer, buyer, offer, motion, pilot, channel });
const currentCanonicalValue = data["offerAssessments__offer-1__easiestNextStep"] || "";

const checks = [];
const check = (name, passed, detail = "") => checks.push({ name, passed: Boolean(passed), ...(detail ? { detail } : {}) });

check("Correct ClientRenew record loaded", /ClientRenew/i.test(record.name || data.companyName), record.name || data.companyName);
check("Canonical next-step source is identified", Object.prototype.hasOwnProperty.call(data, "offerAssessments__offer-1__easiestNextStep"), currentCanonicalValue);
check("A vague one-word saved action is not treated as readiness evidence", currentCanonicalValue.toLowerCase() === "demo" && !helper.isMeaningfulNextStep(currentCanonicalValue), currentCanonicalValue);
check("ClientRenew recommendation is never empty", recommendation.mode === "recommendation" && Boolean(recommendation.recommendation.trim()), recommendation.recommendation);
check("Recommendation names the saved customer", recommendation.recommendation.includes(customer), recommendation.recommendation);
check("Recommendation names the saved buyer", recommendation.recommendation.includes(buyer), recommendation.recommendation);
check("Recommendation names the saved offer", recommendation.recommendation.includes(offer), recommendation.recommendation);
check("Recommendation names the saved motion context", recommendation.why.includes(motion), recommendation.why);
check("Recommendation defines an evidence-producing action", /30-minute review/i.test(recommendation.recommendation) && /accept, object, or decline/i.test(recommendation.recommendation), recommendation.recommendation);
check("Recommendation explains readiness impact", /Offer and Proof readiness/i.test(recommendation.readinessEffect), recommendation.readinessEffect);
check("Rendered task prefills the recommendation and remains editable", /recommendedValue[\s\S]*?<textarea[^>]*data-score-field=/.test(resultsSource));
check("Rendered task preserves save and optional skip actions", /Save this readiness task and recalculate/.test(resultsSource) && /Continue without adding \/ Skip for now/.test(resultsSource));
check("Insufficient context falls back to bounded choices", (() => {
  const fallback = helper.smallestEvidenceProducingNextStep({});
  return fallback.mode === "choice" && !fallback.recommendation && fallback.choices.length === 3 && fallback.choices.every(Boolean);
})());

const failed = checks.filter((item) => !item.passed);
console.log(JSON.stringify({ checks: checks.length, passed: checks.length - failed.length, failed: failed.length, failures: failed }, null, 2));
if (failed.length) process.exitCode = 1;
