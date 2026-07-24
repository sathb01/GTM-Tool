import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { qaProfiles } from "./company-profiles.mjs";

const root = path.resolve(import.meta.dirname, "..");
const apiBase = process.env.GTM_QA_API || process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787";
const requestHeaders = {
  "Content-Type": "application/json",
  ...(process.env.GTM_QA_COOKIE ? { Cookie: process.env.GTM_QA_COOKIE } : {})
};
const dryRun = process.argv.includes("--dry-run");
const unresolvedOutputPath = path.join(import.meta.dirname, "unresolved-fields.json");
const taxonomySource = fs.readFileSync(path.join(root, "tool/gtm-taxonomy.js"), "utf8");
const schemaSource = fs.readFileSync(path.join(root, "tool/intake-schema.js"), "utf8");
const context = vm.createContext({ window: {} });
vm.runInContext(taxonomySource, context, { filename: "gtm-taxonomy.js" });
vm.runInContext(schemaSource, context, { filename: "intake-schema.js" });
const schema = context.window.GTM_INTAKE_SCHEMA;

const slug = (value) => String(value || "").trim().toLowerCase()
  .replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const filled = (value) => String(value ?? "").trim() !== "";
const list = (value) => Array.isArray(value) ? value : [];
const clean = (value) => String(value || "").trim();

function showWhenMatches(definition, data, rowData = {}) {
  const condition = definition?.showWhen;
  if (!condition) return true;
  const actual = String(rowData[condition.field] ?? data[condition.field] ?? "");
  if (Object.prototype.hasOwnProperty.call(condition, "checked")) {
    return condition.checked ? /^(yes|true|1|on)$/i.test(actual) : !/^(yes|true|1|on)$/i.test(actual);
  }
  if (Array.isArray(condition.values)) return condition.values.map(String).includes(actual);
  if (Object.prototype.hasOwnProperty.call(condition, "contains")) return actual.includes(String(condition.contains));
  if (Object.prototype.hasOwnProperty.call(condition, "value")) return actual === String(condition.value);
  return true;
}

function optionEntries(definition, rowId = "") {
  const raw = definition.optionsByRow?.[rowId] || definition.options || [];
  return list(raw).map((option) => typeof option === "string"
    ? { value: option, label: option }
    : { value: String(option?.value ?? option?.id ?? option?.label ?? ""), label: String(option?.label ?? option?.value ?? option?.id ?? "") })
    .filter((option) => option.value || option.label);
}

function findOption(definition, patterns, rowId = "") {
  const entries = optionEntries(definition, rowId);
  for (const pattern of list(patterns)) {
    const match = entries.find((entry) => pattern.test(`${entry.label} ${entry.value}`));
    if (match) return match.value;
  }
  return "";
}

function findOptions(definition, patterns, rowId = "", max = 3) {
  const entries = optionEntries(definition, rowId);
  const selected = [];
  list(patterns).forEach((pattern) => {
    const match = entries.find((entry) => pattern.test(`${entry.label} ${entry.value}`) && !selected.includes(entry.value));
    if (match && selected.length < max) selected.push(match.value);
  });
  return selected;
}

function joined(values) {
  return list(values).filter(Boolean).join("; ");
}

function profileFlags(profile) {
  return {
    pre: profile.mode === "preRevenue",
    dtc: /dtc-consumer/.test(profile.archetype),
    mixed: /mixed-consumer/.test(profile.archetype),
    saas: /saas/.test(profile.archetype),
    healthcare: /referralpath/.test(profile.key)
  };
}

function alternateSegment(profile) {
  return profile.customer.secondarySegment || profile.customer.assumedSegment || profile.customer.broadMarket;
}

function baseData(profile) {
  const flags = profileFlags(profile);
  const primaryOutcome = flags.mixed ? "Increase margin" : flags.pre ? "Customer validation" : "Increase revenue";
  return {
    companyName: profile.name,
    website: profile.company.website,
    toolMode: flags.pre ? "Pre-Revenue Validation" : "GTM Readiness",
    reviewMode: flags.pre ? "preRevenue" : "detailed",
    preparedBy: profile.operator.name,
    respondentRole: profile.operator.role,
    reviewPeriod: flags.pre ? "Current quarter" : "Last 12 months",
    primaryOfferName: profile.product.primary,
    primaryOfferUrl: `${profile.company.website}/primary-offer`,
    secondaryOfferName: profile.product.secondary,
    secondaryOfferUrl: `${profile.company.website}/secondary-offer`,
    companyStage: profile.company.stage,
    geography: profile.company.geography,
    teamSize: profile.company.teamSize,
    revenueRange: flags.pre ? "Pre-revenue" : profile.company.revenueRange,
    hasRecurringRevenue: flags.saas ? "Yes" : "No",
    customerCount: profile.company.customerCount,
    averageDealSize: flags.saas
      ? (profile.company.averageDealSize || profile.product.priceHypothesis)
      : (flags.mixed ? "46" : profile.product.priceHypothesis.replace(/[^0-9-]/g, "")),
    primarySalesMotion: flags.pre ? "Founder-led" : (flags.mixed ? "Field sales" : "Inside sales"),
    researchNotes: `Synthetic QA profile. Saved evidence: ${profile.provenance.savedEvidence.join(", ")}. Assumptions: ${profile.provenance.assumptions.join(", ")}.`,
    quickBestFitCustomer: profile.customer.primarySegment,
    quickBuyerProblem: profile.problem.primary,
    quickOfferPromise: `${profile.product.primary} helps ${profile.customer.primarySegment.toLowerCase()} ${profile.outcome.buyer.charAt(0).toLowerCase()}${profile.outcome.buyer.slice(1)}`,
    quickPrimaryOutcome: primaryOutcome,
    quickSuccessMeasure: profile.outcome.measure,
    quickPrimaryRevenueSource: flags.dtc ? "Inbound website leads" : flags.mixed ? "Retail / field / local selling" : flags.pre ? "Network referrals" : "Direct outbound email",
    quickCurrentSalesMotion: flags.pre ? "Founder-led" : flags.mixed ? "Field sales" : "Inside sales",
    quick90DayGoal: flags.pre ? "Customer validation" : flags.mixed ? "Revenue" : "Revenue",
    quick90DayRevenueTarget: flags.pre ? "0" : flags.mixed ? "450000" : "156000",
    quick90DaySuccessMetric: profile.outcome.success30 || profile.outcome.success90,
    quickBiggestConstraint: flags.pre ? "Product readiness" : flags.mixed ? "Focus" : "ICP clarity",
    quickWhoToAvoid: profile.customer.avoid,
    weeklyRevenueHours: flags.pre ? "11-20" : "20+",
    customerContextStarter: profile.customer.plainLanguage,
    bestFitCustomerGroup: profile.customer.primarySegment,
    bestFitPrimaryPain: profile.problem.primary,
    bestFitDecisionMaker: profile.customer.buyer,
    primaryGtmOffer: "offer-1",
    primaryRevenueMotion: "motion-1"
  };
}

function scoreFor(definition, profile) {
  const flags = profileFlags(profile);
  const id = definition.id || "";
  let score = flags.pre ? 3 : 4;
  if (/proof|contentAssets/i.test(id)) score = flags.pre ? 2 : 3;
  else if (/funnel|salesMotion|channelFocus/i.test(id)) score = flags.pre ? 2 : flags.mixed ? 3 : 2;
  else if (/budget|teamCapacity/i.test(id)) score = flags.pre ? 2 : 3;
  else if (/urgency|icp|offer|position|pricing/i.test(id)) score = flags.pre ? 3 : 4;
  return String(Math.min(score, Math.max(1, definition.options?.length || 5)));
}

function selectAnswer(definition, profile, rowId = "", contextLabel = "") {
  const flags = profileFlags(profile);
  const id = definition.id || "";
  const label = `${definition.label || ""} ${contextLabel}`.toLowerCase();
  const direct = {
    toolMode: flags.pre ? "Pre-Revenue Validation" : "GTM Readiness",
    companyStage: profile.company.stage,
    geography: profile.company.geography,
    revenueRange: flags.pre ? "Pre-revenue" : profile.company.revenueRange,
    primarySalesMotion: flags.pre ? "Founder-led" : flags.mixed ? "Field sales" : "Inside sales",
    reviewPeriod: flags.pre ? "Current quarter" : "Last 12 months",
    quick90DayGoal: flags.pre ? "Customer validation" : "Revenue",
    quickBiggestConstraint: flags.pre ? "Product readiness" : flags.mixed ? "Focus" : "ICP clarity",
    weeklyRevenueHours: flags.pre ? "11-20" : "20+",
    preProductStage: flags.dtc ? "Prototype" : "Pilot-ready",
    preOfferStage: flags.dtc ? "Preorder / waitlist offer" : "Pilot / design partner offer",
    preWeeklyCapacity: flags.dtc ? "11-20 hours" : "20+ hours",
    preTrackingLocation: profile.systems.crm === "Spreadsheet" ? "Spreadsheet" : "CRM",
    preReviewCadence: "Weekly",
    preLearningOwner: flags.pre ? "Founder or person running the validation motion" : profile.route.owner,
    preDecisionRules: "Use our recommendations"
  }[id];
  if (direct && optionEntries(definition, rowId).some((entry) => entry.value === direct || entry.label === direct)) return direct;
  const explicit = selectAnswerById(definition, profile, rowId, label);
  if (explicit) return explicit;

  if (/owner|responsible|who owns/.test(label)) {
    return findOption(definition, flags.pre ? [/founder/i, /shared founder/i] : flags.mixed ? [/sales lead/i, /founder/i] : [/sales lead/i, /founder/i], rowId);
  }
  if (/cadence|how often|review frequency/.test(label)) return findOption(definition, [/weekly/i, /every week/i], rowId);
  if (/priority/.test(label)) return findOption(definition, [/high/i, /tier a/i, /primary/i], rowId);
  if (/status/.test(label)) return findOption(definition, [/in progress/i, /active/i, /ready/i, /draft/i], rowId);
  if (/data quality/.test(label)) return findOption(definition, flags.pre ? [/low/i, /mid|medium/i] : [/mid|medium/i, /high/i], rowId);
  if (/is this role involved/.test(label)) return findOption(definition, /blocker/.test(rowId) && !profile.customer.blocker ? [/no/i] : [/yes/i], rowId);
  if (/decision power/.test(label)) return findOption(definition, /economic|executive|approver/.test(rowId) ? [/high/i] : [/medium/i, /low/i], rowId);
  if (/influence level/.test(label)) return findOption(definition, /champion|user|implementation/.test(rowId) ? [/high/i] : [/medium/i], rowId);
  if (/performance rank/.test(label)) return findOption(definition, [/2|3|medium|middle/i, /high/i], rowId);
  if (/assessment depth/.test(label)) return findOption(definition, [/full|detailed|complete/i], rowId);
  if (/constraint level/.test(label)) return findOption(definition, flags.pre ? [/high/i, /medium/i] : [/medium/i, /high/i], rowId);
  if (/most likely objection|concern/.test(label)) return findOption(definition, flags.dtc ? [/price|quality|need/i] : flags.mixed ? [/margin|sell-through|inventory/i] : [/integration|security|proof|budget/i], rowId);
  if (/how will we measure success/.test(label)) return findOption(definition, flags.mixed ? [/revenue|margin|reorder/i] : flags.pre ? [/validation|customer|commitment/i] : [/pipeline|revenue|conversion/i], rowId);
  if (/confidence|evidence/.test(label)) return findOption(definition, flags.pre ? [/medium/i, /some/i] : [/high/i, /strong/i, /medium/i], rowId);
  if (/revenue potential|economic/.test(label)) return findOption(definition, [/high/i, /strong/i, /possible/i], rowId);
  if (/sales motion|motion today/.test(label)) return findOption(definition, flags.pre ? [/founder-led/i] : flags.mixed ? [/field sales/i, /partner-led/i] : [/inside sales/i], rowId);
  if (/route|buying path|customer lens/.test(label)) return findOption(definition, flags.dtc ? [/direct to consumer/i] : flags.mixed ? [/retail/i, /mixed/i] : [/business account/i, /corporate/i, /team purchase/i], rowId);
  if (/crm|tracking location|source of truth/.test(label)) return findOption(definition, [new RegExp(profile.systems.crm, "i"), /spreadsheet/i, /crm/i], rowId);
  if (/caution signals/.test(label)) return profile.constraints[0];
  if (/disqualification rules|disqualification signals/.test(label)) return profile.customer.avoid;
  if (/stages most likely to buy/.test(label)) return profile.problem.urgency;
  if (/current workaround/.test(label)) return profile.problem.currentAlternative;
  return "";
}

function multiSelectAnswer(definition, profile, rowId = "", contextLabel = "") {
  const flags = profileFlags(profile);
  const id = definition.id || "";
  const label = `${definition.label || ""} ${contextLabel}`.toLowerCase();
  const patternMap = {
    preRevenueRouteToMarket: flags.dtc ? [/end consumer/i, /direct-to-consumer/i] : [/business buyer/i, /corporate/i, /team/i],
    preValidationFocus: [/customer/i, /problem/i, /willingness to pay|price/i],
    preExistingAccess: flags.dtc ? [/email list/i, /community/i, /founder network/i] : [/industry relationships/i, /advisor/i, /founder network/i],
    preKnownConstraints: flags.healthcare ? [/regulatory/i, /technical build/i, /limited time/i] : [/limited capital/i, /limited time/i, /other/i],
    preBroadCustomerTypes: flags.dtc ? [/end user/i, /parent/i, /consumer/i] : [/small businesses/i, /business buyer/i, /operator/i],
    preFirstCustomerTypes: flags.dtc ? [/end user/i, /parent/i, /consumer/i] : [/small businesses/i, /business buyer/i, /operator/i],
    preEvidenceTracked: flags.dtc ? [/problem intensity/i, /willingness to pay/i, /next-step conversion/i] : [/problem intensity/i, /objections/i, /pilot interest/i]
  };
  if (patternMap[id]) {
    const selected = findOptions(definition, patternMap[id], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (id === "preBroadMarket") {
    const selected = findOptions(definition, flags.dtc ? [/consumer physical product/i, /home, family, lifestyle/i] : [/business software/i, /regulated, technical/i], rowId, 2);
    if (selected.length) return joined(selected);
  }
  if (id === "preBroadMarketProblem") {
    const selected = findOptions(definition, flags.dtc ? [/specific use case/i, /inconvenient.*hard to use/i] : [/buyer.*workflow/i, /financial.*risk/i], rowId, 2);
    if (selected.length) return joined(selected);
  }
  if (id === "prePainMechanismDtc") {
    const selected = findOptions(definition, [/real conditions/i, /fewer things to remember/i, /prepared.*confident/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (id === "preUrgencyTriggerDtc") {
    const selected = findOptions(definition, [/upcoming event.*trip/i, /problem with current option/i], rowId, 2);
    if (selected.length) return joined(selected);
  }
  if (id === "preCurrentWorkaroundDtc") {
    const selected = findOptions(definition, [/current product.*already use/i, /combining.*something else/i], rowId, 2);
    if (selected.length) return joined(selected);
  }
  if (id === "preMissingEvidenceDtc") {
    const selected = findOptions(definition, [/willingness to pay/i, /use occasion/i, /repeat purchase/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (id === "preProblemHypothesisChannel") {
    const selected = findOptions(definition, [/workflow.*solution set/i, /convert.*adopted/i, /proof before.*risk/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (id === "prePainMechanismChannel") {
    const selected = findOptions(definition, [/fills a clear gap/i, /path to.*adoption/i, /easy enough to test/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (id === "preUrgencyTriggerChannel") {
    const selected = findOptions(definition, [/workflow.*planning/i, /performance shortfall/i, /budget or buying cycle/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (id === "preCurrentWorkaroundChannel") {
    const selected = findOptions(definition, [/existing.*workflow/i, /current supplier.*platform.*internal team/i], rowId, 2);
    if (selected.length) return joined(selected);
  }
  if (id === "preHypothesisReason") {
    const selected = findOptions(definition, flags.dtc ? [/easiest to reach/i, /fastest validation/i, /dtc demand/i] : [/strongest problem/i, /founder credibility/i, /early revenue/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (id === "preWedgeOutcome") {
    const selected = findOptions(definition, flags.dtc ? [/demand/i, /willingness to pay/i, /price point/i] : [/business or channel/i, /pilot/i, /terms/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (id === "prePathOptionsUnderConsideration" || id === "customerRouteLenses") {
    const selected = findOptions(definition, flags.dtc ? [/dtc|end consumer/i, /community|recommender/i] : [/corporate|business buyer/i, /partner/i], rowId, 2);
    if (selected.length) return joined(selected);
  }
  if (id === "prePathEvidenceSignals") {
    const selected = findOptions(definition, flags.dtc ? [/consumers.*interest/i, /easier access to consumers/i, /faster feedback/i] : [/business buyers.*interest/i, /easier access to.*business/i, /clearer willingness/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (id === "preStrongestPathSignal") {
    const selected = findOptions(definition, flags.dtc ? [/preorder|deposit/i, /repeat interest/i] : [/pilot|test order/i, /correct buyer/i], rowId, 2);
    if (selected.length) return joined(selected);
  }
  if (id === "prePathDecisionCriteria") {
    const selected = findOptions(definition, [/stronger urgency/i, /clearer economics/i, /faster proof/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (id === "validationPathDtc") {
    const selected = findOptions(definition, [/interview target/i, /landing page|waitlist/i, /preorders|deposits/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (id === "validationPathChannel") {
    const selected = findOptions(definition, [/pitch a small set/i, /demo.*pilot review/i, /test order|pilot placement/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (id === "riskRequirementsDtc") {
    const selected = findOptions(definition, [/quality/i, /price is too high/i, /new brand/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (id === "riskRequirementsChannel") {
    const selected = findOptions(definition, [/will not sell through/i, /margin.*not strong/i, /customer demand is unproven/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (id === "implementationRequirements") {
    const selected = findOptions(definition, flags.dtc ? [/prototype.*ready/i, /quality.*consistent/i, /fulfillment.*work/i] : [/pilot.*can work/i, /onboarding.*clear/i, /commercial terms/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (id === "reviewRequirements") {
    const selected = findOptions(definition, flags.healthcare ? [/security/i, /data privacy/i, /compliance/i] : flags.saas ? [/security/i, /it.*technical/i, /finance/i] : [/finance/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (id === "dealStallRisks") {
    const selected = findOptions(definition, flags.mixed ? [/finance questions roi/i, /proof is not strong/i, /no clear next step/i] : [/technical.*security/i, /finance questions roi/i, /proof is not strong/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (id === "buyingCommitteePrimaryConcern") {
    const selected = findOptions(definition, flags.mixed ? [/roi/i, /price/i, /internal capacity/i] : [/roi/i, /implementation effort/i, /security/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (id === "buyingCommitteeLikelyObjection") {
    const selected = findOptions(definition, flags.mixed ? [/price/i, /lack of proof/i, /competing priorities/i] : [/unclear roi/i, /technical.*security/i, /change effort/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (id === "channelBuyingCriteria") {
    const selected = findOptions(definition, flags.mixed ? [/margin.*economic/i, /sell-through.*repeat/i, /reliable delivery/i] : [/workflow.*fit/i, /proof.*pilots/i, /onboarding.*setup/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (id === "bestFitFirstUseCase") {
    const selected = findOptions(definition, flags.mixed ? [/improve.*sell-through/i, /improve margin/i, /differentiate/i] : [/improve reporting|visibility/i, /reduce manual work/i, /improve.*revenue/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (id === "signalDataSources") {
    const selected = findOptions(definition, flags.mixed ? [/crm/i, /customer interviews/i, /customer success notes/i] : [/crm/i, /company websites/i, /linkedin/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (id === "targetCustomerGroup") return joined([profile.customer.primarySegment, alternateSegment(profile)].filter(Boolean));
  if (["buyingCommitteeRoles", "roleInDecision"].includes(id)) {
    if (id === "roleInDecision") {
      const rolePatterns = /economic|approver/.test(rowId) ? [/approve/i, /budget/i, /final decision/i]
        : /champion|user|implementation/.test(rowId) ? [/use/i, /evaluate/i, /influence/i, /implement/i]
          : [/influence/i, /evaluate/i, /block/i];
      const selected = findOptions(definition, rolePatterns, rowId, 3);
      if (selected.length) return joined(selected);
    }
    const selected = findOptions(definition, flags.dtc ? [/end consumer/i, /user/i, /influencer/i] : flags.mixed ? [/buyer/i, /owner/i, /merchandising/i, /finance/i] : [/operations/i, /finance/i, /executive/i, /technical/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (id === "caresAbout" || /care about most/.test(label)) {
    const selected = findOptions(definition, flags.dtc ? [/ease|quality|price|experience/i] : flags.mixed ? [/margin/i, /sell-through/i, /reorder/i, /risk/i] : [/roi|time/i, /risk/i, /integration|implementation/i, /visibility/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (id === "salesAssetsNeeded" || /sales asset needed/.test(label)) {
    const selected = findOptions(definition, flags.pre ? [/demo|sample|prototype/i, /pricing/i, /faq|proof/i] : flags.mixed ? [/sell sheet/i, /case study/i, /margin|pricing/i] : [/case study/i, /roi/i, /security|implementation/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (/committee concern|committee objection|usually involved in.*buying|usually involved in.*motion/.test(label)) {
    const selected = findOptions(definition, flags.dtc ? [/price/i, /quality/i, /user/i] : flags.mixed ? [/margin/i, /sell-through/i, /inventory/i, /finance/i] : [/security/i, /integration/i, /finance/i, /operations/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (/bad first focus|hard to win or serve|risk/.test(label)) {
    const selected = findOptions(definition, flags.dtc ? [/price/i, /hard to reach/i, /low urgency/i] : flags.mixed ? [/support/i, /margin/i, /sales cycle/i] : [/security/i, /integration/i, /sales cycle/i, /hard to reach/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (/customer lens/.test(label)) {
    const selected = findOptions(definition, flags.dtc ? [/direct-to-consumer/i, /end consumer/i] : flags.mixed ? [/retail/i, /direct-to-consumer/i] : [/business buyer/i], rowId, 2);
    if (selected.length) return joined(selected);
  }
  if (/specific use cases|jobs-to-be-done/.test(label)) {
    const selected = findOptions(definition, flags.dtc ? [/specific activity/i, /convenience/i, /experience/i] : flags.mixed ? [/find products/i, /sell-through/i, /margin/i] : [/workflow/i, /visibility/i, /manual/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (/trigger the end consumer|why would they care now|event.*deadline.*pressure/.test(label)) {
    const selected = findOptions(definition, flags.dtc ? [/upcoming event|season|trip/i, /current option/i, /immediate need/i] : flags.mixed ? [/season/i, /buying window/i, /performance/i] : flags.pre ? [/founder has access/i, /launch timing/i] : [/deadline/i, /leadership/i, /renewal/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (/observable traits/.test(label)) {
    const selected = findOptions(definition, flags.dtc ? [/use case/i, /life stage/i, /community/i] : flags.mixed ? [/channel type/i, /size/i, /category/i] : [/industry|role/i, /company stage/i, /workflow/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (/assuming about this segment/.test(label)) {
    const selected = findOptions(definition, [/problem/i, /willingness|budget/i, /reachable/i, /buying path/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (/why would they trust|credibility/.test(label)) {
    const selected = findOptions(definition, flags.pre ? [/relevant experience/i, /prototype|demo/i, /introduction|relationship/i] : [/customer proof/i, /relevant experience/i, /data/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (/delivery|fulfillment|onboarding|use/.test(label)) {
    const selected = findOptions(definition, flags.dtc ? [/quality/i, /fulfillment/i, /returns/i] : flags.mixed ? [/inventory/i, /fulfillment/i, /support/i] : [/integration/i, /owner/i, /data/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (/who has to believe|successful validation signal/.test(label)) {
    const selected = findOptions(definition, flags.dtc ? [/buyer|consumer/i, /preorder|deposit/i, /willingness/i] : flags.mixed ? [/buyer/i, /reorder/i, /margin/i] : [/buyer/i, /pilot/i, /meaningful next step/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (/stall/.test(label)) {
    const selected = findOptions(definition, flags.mixed ? [/commercial|pricing/i, /approval/i, /timing/i] : [/security/i, /proof/i, /decision/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (/customer outcomes.*prove/.test(label)) {
    const selected = findOptions(definition, flags.mixed ? [/revenue/i, /margin/i, /retention/i] : [/time/i, /visibility/i, /revenue/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (/problem|pain|unmet need/.test(label)) {
    const selected = findOptions(definition, flags.dtc ? [/use case/i, /lifestyle/i, /right features/i] : flags.mixed ? [/customers want/i, /sell-through/i, /margin/i] : [/workflow/i, /financial.*risk/i, /specific use case/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (/channel|source|reach|access/.test(label)) {
    const selected = findOptions(definition, flags.dtc ? [/email list/i, /community/i, /interview/i] : flags.mixed ? [/retail/i, /trade show/i, /existing customer/i] : [/referral/i, /outbound/i, /industry/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (/buyer|approve|influence|role/.test(label)) {
    const selected = findOptions(definition, flags.dtc ? [/end consumer/i, /parent/i, /user/i] : flags.mixed ? [/retail buyer/i, /owner/i, /merchandising/i] : [/operations/i, /owner/i, /finance/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (/evidence|proof/.test(label)) {
    const selected = findOptions(definition, flags.pre ? [/interview/i, /prototype|demo/i, /waitlist|pilot/i] : [/customer/i, /crm|revenue/i, /case study|testimonial/i], rowId, 3);
    if (selected.length) return joined(selected);
  }
  if (/continue/.test(label)) return findOption(definition, [/meaningful next step/i, /multiple targets confirm/i, /use recommendation/i], rowId);
  if (/revise/.test(label)) return findOption(definition, [/problem exists but urgency is weak/i, /price.*wrong/i, /use recommendation/i], rowId);
  if (/stop|pause/.test(label)) return findOption(definition, [/no meaningful responses/i, /do not recognize/i, /use recommendation/i], rowId);
  return "";
}

function buyerRoleTitle(profile, roleId) {
  const titles = {
    "economic-buyer": profile.customer.approver || profile.customer.buyer,
    "executive-sponsor": profile.customer.approver || profile.customer.buyer,
    champion: profile.customer.buyer,
    "day-to-day-user": profile.customer.user,
    "implementation-owner": profile.customer.influencer || profile.customer.user,
    "technical-security-reviewer": profile.customer.blocker || "Technical or data reviewer",
    "procurement-finance": profile.customer.approver || "Finance reviewer",
    legal: "Legal or contract reviewer",
    operations: profile.customer.buyer,
    "customer-success-support": profile.customer.user,
    "external-advisor-consultant": "Trusted advisor or referral partner",
    "board-investor": "Board member or investor",
    "likely-blocker": profile.customer.blocker || "Operational or financial reviewer"
  };
  return titles[roleId] || profile.customer.influencer;
}

function buyerRoleText(profile, roleId, columnId) {
  const flags = profileFlags(profile);
  const title = buyerRoleTitle(profile, roleId);
  const economic = /economic-buyer|executive-sponsor|procurement-finance|board-investor/.test(roleId);
  const user = /champion|day-to-day-user|implementation-owner|operations|customer-success-support/.test(roleId);
  const risk = /technical-security-reviewer|legal|likely-blocker/.test(roleId);
  if (columnId === "commonTitles") return title;
  if (columnId === "painPriority") {
    if (economic) return flags.mixed ? "Protect contribution margin and avoid inventory that will not reorder." : "Protect recurring revenue and justify the investment with measurable commercial impact.";
    if (risk) return flags.mixed ? "Avoid supply, quality, contract, or support risk that could create cost and disruption." : "Avoid security, data, implementation, and ownership risk.";
    return profile.problem.primary;
  }
  if (columnId === "needsToBelieve") {
    if (economic) return flags.mixed ? "The assortment can meet target margin and reorder thresholds after support costs." : "The expected retention or revenue impact justifies cost, implementation effort, and change risk.";
    if (risk) return flags.mixed ? "Delivery, quality, terms, and support are reliable enough for a controlled rollout." : "Security, data requirements, implementation ownership, and contract terms are acceptable.";
    return flags.dtc ? `The kit works in a real waiting occasion and is worth ${profile.product.priceHypothesis}.` : "The workflow improves the team's weekly work without adding an unreasonable implementation burden.";
  }
  if (columnId === "objectionDetail") {
    if (economic) return flags.mixed ? "The account may question whether reorder and margin justify the opening order and support effort." : "The buyer may question whether the measurable revenue or retention impact justifies the investment.";
    if (risk) return flags.mixed ? "The reviewer may worry about quality, fulfillment, returns, or contract exposure." : "The reviewer may worry that data, security, integration, or internal ownership is not ready.";
    return "The user may agree with the problem but resist changing the current workflow or product habit.";
  }
  if (columnId === "message") {
    if (economic) return flags.mixed ? "Test a focused assortment against explicit margin, sell-through, and reorder rules before expanding." : "Run one controlled workflow pilot tied to renewal coverage, risk detection, and commercial results.";
    if (risk) return flags.mixed ? "Start with clear quality, fulfillment, support, and commercial requirements before committing inventory." : "Define the security, data, implementation, and ownership requirements before the pilot begins.";
    return flags.dtc ? "Test one compact, reusable kit during a real trip or wait and judge whether it reduces screen reliance and parent stress." : "Give the operating team one reliable view of the work, owners, and next actions without replacing the core system.";
  }
  if (columnId === "discoveryQuestions") {
    if (economic) return flags.mixed ? "What margin and reorder threshold must a new product meet? What support cost would make the account unattractive?" : "What commercial result would justify acting this quarter? What happens if the current risk remains unresolved?";
    if (risk) return flags.mixed ? "Which quality, delivery, terms, or return requirements must be met before a test order?" : "Which security, data, integration, legal, and ownership requirements must be met before a pilot?";
    return flags.dtc ? "Tell me about the last long trip or wait. What did you bring, what failed, and what would have made the experience better?" : "Walk me through the current workflow. Where does work stall, who owns the next action, and how is success measured?";
  }
  return "";
}

function structuredTableText(definition, profile, key, rowLabel, tableId) {
  const columnId = definition.id || "";
  const parts = key.split("__");
  const rowId = parts[1] || "";
  if (tableId === "buyerRoleCards") return buyerRoleText(profile, rowId, columnId);
  if (tableId === "personaPriority" && columnId === "why") {
    const title = buyerRoleTitle(profile, rowId);
    return `${title} is rated for this plan according to decision power, exposure to the problem, and ability to move the next step.`;
  }
  if (tableId === "successLooksLike") {
    const timeframe = rowId === "30-days" ? "30 days" : rowId === "60-days" ? "60 days" : "90 days";
    if (columnId === "primaryFocus") return rowId === "30-days" ? "Confirm the focused customer and evidence baseline" : rowId === "60-days" ? "Run the focused motion and improve the weakest response" : "Make a continue, revise, or stop decision from measured evidence";
    if (columnId === "needTo") return rowId === "30-days" ? profile.route.activityTarget : rowId === "60-days" ? `Use the first ${timeframe} of evidence to improve one message, offer, or qualification variable without changing the whole test.` : (profile.outcome.success90 || profile.outcome.success30);
    if (columnId === "target") return rowId === "90-days" ? (profile.outcome.success90 || profile.outcome.continue) : rowId === "60-days" ? "Complete the planned test volume and produce at least three meaningful next steps or commitments." : profile.route.activityTarget;
    if (columnId === "owner") return profile.route.owner;
    if (columnId === "verification") return profile.systems.sourceOfTruth === "Google Sheets" ? "Review the saved target, conversation, commitment, and evidence rows in Google Sheets." : `Review the saved activity, conversion, opportunity, and evidence data in ${profile.systems.sourceOfTruth}.`;
  }
  if (tableId === "possibleCustomerGroups") {
    const segment = rowId.endsWith("2") ? alternateSegment(profile) : profile.customer.primarySegment;
    if (["groupName", "segmentIdentityDetails", "sizeDefinition"].includes(columnId)) return segment;
    if (columnId === "whoTheyAre") return rowId.endsWith("2") ? alternateSegment(profile) : profile.customer.plainLanguage;
    if (columnId === "whyNow") return profile.problem.urgency;
    if (columnId === "notesEvidence") return profile.evidence.statement;
  }
  if (tableId === "offerPortfolio") {
    if (columnId === "offerName") return rowId.endsWith("2") ? profile.product.secondary : profile.product.primary;
    if (columnId === "newTargetCustomerGroup") return profile.customer.primarySegment;
    if (columnId === "newPrimaryBuyer") return profile.customer.buyer;
    if (columnId === "buyingCommitteeMissingAssetNote") return rowId.endsWith("2") ? profile.proof.missing[1] || profile.proof.missing[0] : profile.proof.missing[0];
  }
  if (tableId === "topBlockers") {
    if (columnId === "blocker") return profile.constraints[0];
    if (columnId === "whyItMatters") return `This constraint could prevent the team from completing the focused test or interpreting its results reliably.`;
    if (columnId === "mustBeTrue") return `The team must define a workable limit for ${profile.constraints[0].toLowerCase()} before increasing test volume.`;
    if (columnId === "nextAction") return `Assign an owner to resolve or bound ${profile.constraints[0].toLowerCase()} this week.`;
  }
  return "";
}

function textAnswer(definition, profile, key, rowLabel = "", tableId = "") {
  const flags = profileFlags(profile);
  const id = definition.id || key;
  const label = `${definition.label || ""} ${rowLabel}`.toLowerCase();
  const direct = {
    companyName: profile.name,
    website: profile.company.website,
    preparedBy: profile.operator.name,
    respondentRole: profile.operator.role,
    primaryOfferName: profile.product.primary,
    primaryOfferUrl: `${profile.company.website}/primary-offer`,
    secondaryOfferName: profile.product.secondary,
    secondaryOfferUrl: `${profile.company.website}/secondary-offer`,
    teamSize: profile.company.teamSize,
    customerCount: profile.company.customerCount,
    researchNotes: `Synthetic QA only. Evidence: ${profile.provenance.savedEvidence.join(", ")}. Assumptions: ${profile.provenance.assumptions.join(", ")}.`,
    quickBestFitCustomer: profile.customer.primarySegment,
    quickBuyerProblem: profile.problem.primary,
    quickOfferPromise: `${profile.product.primary} helps ${profile.customer.primarySegment.toLowerCase()} ${profile.outcome.buyer.charAt(0).toLowerCase()}${profile.outcome.buyer.slice(1)}`,
    quickSuccessMeasure: profile.outcome.measure,
    quick90DaySuccessMetric: profile.outcome.success30 || profile.outcome.success90,
    quickWhoToAvoid: profile.customer.avoid,
    customerContextStarter: profile.customer.plainLanguage,
    bestFitCustomerGroup: profile.customer.primarySegment,
    bestFitDecisionMaker: profile.customer.buyer,
    primaryGtmOffer: profile.product.primary,
    primaryRevenueMotion: profile.route.motion,
    preBroadMarketUnknownComparable: flags.dtc ? "Family travel gear, reusable activity kits, and screen-free children's activities" : "Clinic operations workflow and referral-management software",
    preCustomerTypesUnknownUser: flags.dtc ? profile.customer.user : profile.customer.user,
    preDecisionRulesRevision: `${profile.outcome.continue} ${profile.outcome.revise} ${profile.outcome.stop}`,
    preReviseRule: profile.outcome.revise
  }[id];
  if (filled(direct)) return String(direct);
  const structured = structuredTableText(definition, profile, key, rowLabel, tableId);
  if (filled(structured)) return structured;

  if (/email/.test(label)) return `qa3+${profile.key}@example.invalid`;
  if (/phone/.test(label)) return "555-0200";
  if (/website|url/.test(label)) return profile.company.website;
  if (tableId === "gtmSystems" && /tool/.test(label)) {
    if (/crm/.test(rowLabel.toLowerCase())) return profile.systems.crm;
    if (/marketing|email/.test(rowLabel.toLowerCase())) return profile.systems.marketing;
    if (/analytics/.test(rowLabel.toLowerCase())) return profile.systems.analytics;
    if (/billing|proposal|contract/.test(rowLabel.toLowerCase())) return profile.systems.billing || profile.systems.commerce || "Google Workspace";
    return profile.mode === "preRevenue" ? "Not in use yet" : "HubSpot";
  }
  if (/current number|current answer/.test(label)) {
    const row = rowLabel.toLowerCase();
    if (/open opportunit/.test(row)) return profile.mode === "preRevenue" ? "0" : "12";
    if (/pipeline/.test(row)) return profile.mode === "preRevenue" ? "0" : "312000";
    if (/win rate/.test(row)) return profile.mode === "preRevenue" ? "Not established" : "18%";
    if (/sales cycle/.test(row)) return profile.mode === "preRevenue" ? "Not established" : "74 days";
    if (/lead|conversation|meeting/.test(row)) return profile.mode === "preRevenue" ? "8" : "16";
    return profile.mode === "preRevenue" ? "Not established" : "Measured in the CRM";
  }
  if (/common titles/.test(label)) {
    if (/economic|executive|approver/.test(rowLabel.toLowerCase())) return profile.customer.approver || profile.customer.buyer;
    if (/champion|user|implementation/.test(rowLabel.toLowerCase())) return profile.customer.user;
    if (/blocker|technical|legal|finance/.test(rowLabel.toLowerCase())) return profile.customer.blocker || profile.customer.influencer;
    return profile.customer.influencer;
  }
  if (/need to believe before moving forward/.test(label)) {
    return profileFlags(profile).dtc
      ? `The kit will be useful during a real waiting occasion, durable enough to reuse, and worth ${profile.product.priceHypothesis}.`
      : profileFlags(profile).mixed
        ? "The assortment can earn target margin, sell through in the expected window, and reorder without excessive support."
        : "The problem is urgent, the workflow can be implemented with acceptable risk, and the expected value exceeds the cost and change burden.";
  }
  if (/message that resonates/.test(label)) {
    return profileFlags(profile).dtc
      ? "One compact, reusable way to keep children engaged during travel and restaurant waits with less reliance on a screen."
      : profileFlags(profile).mixed
        ? "A differentiated hydration assortment designed to protect margin and earn a measurable reorder."
        : `${profile.product.primary} helps ${profile.customer.buyer.toLowerCase()} ${profile.outcome.buyer.charAt(0).toLowerCase()}${profile.outcome.buyer.slice(1)}`;
  }
  if (/owner|prepared by|responsible/.test(label)) return profile.route.owner;
  if (/customer group name|segment name/.test(label)) return profile.customer.primarySegment;
  if (/what makes this a distinct segment/.test(label)) return profile.customer.primarySegment;
  if (/who are they|describe the customer|customer profile|target customer|segment description|segment identity/.test(label)) return profile.customer.plainLanguage;
  if (/end consumer|who ultimately uses|user profile/.test(label)) return profile.customer.user;
  if (/channel buyer|decision maker|economic buyer|primary buyer|who decides|approver/.test(label)) return profile.customer.buyer;
  if (/buying committee|influencer|stakeholder/.test(label)) return [profile.customer.buyer, profile.customer.influencer, profile.customer.approver, profile.customer.blocker].filter(Boolean).join("; ");
  if (/customer \/ account|customer \/ active user/.test(label)) return profile.mode === "preRevenue" ? "Synthetic design partner 1" : "Synthetic customer account 1";
  if (/expansion opportunity/.test(label)) return profileFlags(profile).mixed ? "Expand the proven assortment after the account reaches the reorder threshold" : "Expand to an additional recurring client portfolio after the first workflow reaches adoption targets";
  if (/owns signal monitoring/.test(label)) return profile.route.owner;
  if (/problem|pain|unmet need/.test(label)) return profile.problem.primary;
  if (/founder or team background/.test(label)) return profileFlags(profile).dtc
    ? "The founder has eight years of consumer product development and runs a family-travel newsletter."
    : "The founders previously built clinic workflow software and the advisor managed referral operations for independent specialty practices.";
  if (/anything important.*dropdowns/.test(label)) return "The first test must distinguish stated interest from an observable commitment and must not treat interviews as purchase proof.";
  if (/what would the buyer receive or agree to/.test(label)) return profile.product.offer;
  if (/intentionally not included/.test(label)) return profileFlags(profile).dtc
    ? "No full production guarantee, subscription commitment, or national retail availability is included in the validation offer."
    : "No enterprise integration, custom EHR build, or organization-wide rollout is included in the first pilot.";
  if (/makes this urgent now/.test(label)) return profile.problem.urgency;
  if (/customers you should avoid/.test(label) || /who should we avoid/.test(label)) return profile.customer.avoid;
  if (/best-fit headcount range/.test(label)) return profile.customer.primarySegment;
  if (/who usually starts the conversation/.test(label)) return profile.customer.buyer;
  if (/who can block the deal/.test(label)) return profile.customer.blocker || "A finance or operational reviewer who does not accept the evidence or implementation burden";
  if (/why now|urgency|trigger|timing/.test(label)) return profile.problem.urgency;
  if (/alternative|competitor|workaround/.test(label)) return profile.problem.currentAlternative;
  if (/consequence|cost of|impact of problem/.test(label)) return profile.problem.consequence;
  if (/offer|product|solution|service/.test(label)) return profile.product.offer;
  if (/outcome|success|result|value|impact/.test(label)) return profile.outcome.buyer;
  if (/measure|metric|baseline/.test(label)) return profile.outcome.measure;
  if (/continue/.test(label)) return profile.outcome.continue;
  if (/revise/.test(label)) return profile.outcome.revise;
  if (/stop|pause/.test(label)) return profile.outcome.stop;
  if (/evidence|proof|confidence/.test(label)) return profile.evidence.statement;
  if (/missing|gap|unclear|unknown/.test(label)) return profile.evidence.missing.join("; ");
  if (/constraint|risk|blocker|caution/.test(label)) return profile.constraints.join("; ");
  if (/channel|source|where.*find|where.*reach/.test(label)) return profile.route.channels.join("; ");
  if (/motion|sales process/.test(label)) return profile.route.motion;
  if (/activity|weekly work|target/.test(label)) return profile.route.activityTarget;
  if (/cadence|review/.test(label)) return profile.route.reviewCadence;
  if (/next action|next step|call to action|ask/.test(label)) return flags.dtc ? "Complete a 20-minute interview and consider a refundable preorder deposit" : flags.pre ? "Complete a workflow review and consider a structured pilot" : "Schedule a focused diagnostic and agree the next evaluation step";
  if (/price|budget|economic|ability to pay|deal size|revenue/.test(label)) return profile.product.price || profile.product.priceHypothesis || profile.company.revenue;
  if (/size|scale|employee|location|account criteria/.test(label)) return profile.customer.primarySegment;
  if (/notes/.test(label) && tableId === "publicPresence") return "Synthetic QA URL; no public research performed";
  if (/notes|detail|summary|rationale|why/.test(label)) return profile.evidence.statement;
  return "";
}

function dynamicRows(table, profile, data) {
  if (Array.isArray(table.rows)) return table.rows.map((row) => typeof row === "string" ? { id: slug(row), label: row } : row);
  const existing = [...new Set(Object.keys(data).filter((key) => key.startsWith(`${table.id}__`)).map((key) => key.split("__")[1]).filter(Boolean))];
  if (existing.length) return existing.map((id) => ({ id, label: id }));
  const countByTable = {
    preCustomerHypotheses: 2,
    possibleCustomerGroups: 2,
    offerPortfolio: 2,
    signalPlayPortfolio: 2,
    revenueMotionPortfolio: 2
  };
  const count = countByTable[table.id] || Math.max(1, Number(table.minRows) || 1);
  return Array.from({ length: count }, (_, index) => ({
    id: table.id === "preCustomerHypotheses" ? `first-win-segment-${index + 1}`
      : table.id === "possibleCustomerGroups" ? `customer-group-${index + 1}`
        : table.id === "offerPortfolio" ? `offer-${index + 1}`
          : table.id === "signalPlayPortfolio" ? `play-${index + 1}`
            : table.id === "revenueMotionPortfolio" ? `motion-${index + 1}`
              : `${slug(table.rowLabel || "row")}-${index + 1}`,
    label: `${table.rowLabel || "Row"} ${index + 1}`
  }));
}

function populateDefinition(definition, profile, data, key, unresolved, rowId = "", rowLabel = "", tableId = "", rowData = {}) {
  if (!key || filled(data[key]) || !showWhenMatches(definition, data, rowData)) return;
  const type = definition.type || "text";
  let answer = "";
  if (type === "scoreSelect") answer = scoreFor(definition, profile);
  else if (type === "checkbox") answer = definition.id === "hasRecurringRevenue" ? (profileFlags(profile).saas ? "Yes" : "No") : "Yes";
  else if (type === "date") answer = profile.mode === "preRevenue" ? "2026-08-21" : "2026-10-21";
  else if (type === "money" || type === "number") answer = /revenue target/i.test(definition.label || "") ? (profile.mode === "preRevenue" ? "0" : "150000") : "1000";
  else if (type === "select" || type === "radio") answer = selectAnswer(definition, profile, rowId, rowLabel);
  else if (["multiSelectDropdown", "multiSelect", "checkboxGroup"].includes(type)) answer = multiSelectAnswer(definition, profile, rowId, rowLabel);
  else if (type === "repeatableList") {
    const itemDefinition = { ...definition, id: `${definition.id}__item-1`, type: definition.itemType || "text" };
    if (tableId && itemDefinition.type === "select") {
      answer = selectAnswer(itemDefinition, profile, rowId, rowLabel) || findOption(itemDefinition, [/customer/i, /interview/i, /industry/i, /existing/i], rowId);
      if (answer) data[key] = answer;
      else unresolved.push({ profile: profile.key, key, label: definition.label, type: itemDefinition.type, rowLabel, tableId });
      return;
    }
    const itemKey = `${key}__item-1`;
    if (itemDefinition.type === "select") answer = selectAnswer(itemDefinition, profile, rowId, rowLabel) || findOption(itemDefinition, [/customer/i, /interview/i, /industry/i, /existing/i], rowId);
    else answer = textAnswer(itemDefinition, profile, itemKey, rowLabel, tableId);
    if (answer) data[itemKey] = answer;
    else unresolved.push({ profile: profile.key, key: itemKey, label: definition.label, type: itemDefinition.type, rowLabel, tableId });
    return;
  } else answer = textAnswer(definition, profile, key, rowLabel, tableId);

  if (answer) data[key] = answer;
  else unresolved.push({ profile: profile.key, key, label: definition.label || definition.title || "", type, rowLabel, tableId, options: optionEntries(definition, rowId).map((option) => option.label) });
}

function walkNode(node, profile, data, unresolved, seen = new Set()) {
  if (!node || typeof node !== "object" || seen.has(node) || !showWhenMatches(node, data)) return;
  seen.add(node);
  if (node.id && node.type && !node.columns) populateDefinition(node, profile, data, node.id, unresolved);
  if (node.id && Array.isArray(node.columns)) {
    dynamicRows(node, profile, data).forEach((row) => {
      const rowData = {};
      node.columns.forEach((column) => {
        const type = column.typeByRow?.[row.id] || column.type;
        const definition = { ...column, type, options: column.optionsByRow?.[row.id] || column.options };
        const key = `${node.id}__${row.id}__${column.id}`;
        populateDefinition(definition, profile, data, key, unresolved, row.id, row.label, node.id, rowData);
        if (filled(data[key])) rowData[column.id] = data[key];
      });
    });
  }
  Object.entries(node).forEach(([key, value]) => {
    if (["legacyFields", "legacyTables", "options", "optionsByRow", "rows", "columns"].includes(key)) return;
    if (Array.isArray(value)) value.forEach((item) => walkNode(item, profile, data, unresolved, seen));
    else walkNode(value, profile, data, unresolved, seen);
  });
}

function applicableSections(profile) {
  const pre = profile.mode === "preRevenue";
  return schema.sections.filter((section) => !section.hidden && !section.deprecated && (pre ? section.id === "company" || section.preRevenue : !section.preRevenue));
}

function buildRecord(profile) {
  const data = baseData(profile);
  const unresolved = [];
  const sections = applicableSections(profile);
  for (let pass = 0; pass < 3; pass += 1) sections.forEach((section) => walkNode(section, profile, data, unresolved, new Set()));
  data.qaProfileVersion = "2026-07-24-semantic-v2";
  data.qaEvidenceBoundary = JSON.stringify(profile.provenance);
  data.savedAt = new Date().toISOString();
  const uniqueUnresolved = [...new Map(unresolved.filter((item) => !filled(data[item.key])).map((item) => [item.key, item])).values()];
  return {
    record: { id: profile.id, name: profile.name, data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    unresolved: uniqueUnresolved,
    sections: sections.map((section) => section.id)
  };
}

const builds = qaProfiles.map(buildRecord);
const unresolved = builds.flatMap((build) => build.unresolved);
if (unresolved.length) {
  fs.writeFileSync(unresolvedOutputPath, `${JSON.stringify(unresolved, null, 2)}\n`);
  console.error(`Replacement fixture generation stopped: ${unresolved.length} fields need explicit semantic rules.`);
  console.error(`Review ${unresolvedOutputPath}`);
  process.exitCode = 1;
} else if (dryRun) {
  if (fs.existsSync(unresolvedOutputPath)) fs.unlinkSync(unresolvedOutputPath);
  console.log(JSON.stringify(builds.map(({ record, sections }) => ({ id: record.id, name: record.name, savedKeys: Object.keys(record.data).length, sections })), null, 2));
} else {
  if (fs.existsSync(unresolvedOutputPath)) fs.unlinkSync(unresolvedOutputPath);
  const results = [];
  for (const { record, sections } of builds) {
    const response = await fetch(`${apiBase}/api/records/${encodeURIComponent(record.id)}`, {
      method: "PUT",
      headers: requestHeaders,
      body: JSON.stringify(record)
    });
    if (!response.ok) throw new Error(`Could not save ${record.name}: ${response.status} ${await response.text()}`);
    const saved = (await response.json()).record;
    const reload = await fetch(`${apiBase}/api/records/${encodeURIComponent(record.id)}`, { headers: requestHeaders });
    if (!reload.ok) throw new Error(`Could not reload ${record.name}: ${reload.status}`);
    const reloaded = (await reload.json()).record;
    if (JSON.stringify(saved.data) !== JSON.stringify(reloaded.data)) throw new Error(`${record.name} changed during API save and reload`);
    results.push({ id: record.id, name: record.name, savedKeys: Object.keys(reloaded.data).length, sections, exactReloadMatch: true });
  }
  console.log(JSON.stringify(results, null, 2));
}

function selectAnswerById(definition, profile, rowId, label) {
  const flags = profileFlags(profile);
  const id = definition.id || "";
  if (id === "industryId") return findOption(definition, [new RegExp(profile.company.industry.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), flags.saas ? /software|technology/i : /consumer/i], rowId);
  if (id === "businessTypeId") return findOption(definition, [flags.saas ? /b2b saas/i : flags.dtc ? /dtc ecommerce brand/i : /wholesale product business|consumer packaged goods/i], rowId);
  if (id === "mainGrowthConstraint") return findOption(definition, flags.pre ? [/unclear product-market fit/i, /under capitalization/i] : flags.mixed ? [/lack of strategic planning/i, /process scalability/i] : [/unclear product-market fit/i, /intense competition/i], rowId);
  if (id === "prePrimaryHypothesis") return profile.customer.primarySegment;
  if (id === "segmentName") return findOption(definition, rowId.endsWith("2") ? [/problem-aware buyers/i] : flags.dtc ? [/end users with a specific use case/i] : [/small businesses or teams/i], rowId);
  if (id === "primarySignalPlay") return "play-1";
  if (id === "linkedSignalPlay") return rowId.endsWith("2") ? "play-2" : "play-1";
  if (id === "bestFitChampion") return profile.customer.user;
  if (id === "bestFitExpectedSalesCycle") return findOption(definition, flags.mixed ? [/30-60|31-60|1-2 month/i] : [/60-90|61-90|2-3 month/i, /30-60/i], rowId);
  if (id === "bestFitBudgetCategory") return findOption(definition, flags.mixed ? [/merchandising|inventory|category|marketing/i] : [/operations|software|technology|department/i], rowId);
  if (id === "bestFitMaturityStage") return findOption(definition, flags.mixed ? [/growth/i, /established/i] : [/growth/i, /early/i], rowId);
  if (id === "businessPriority") return findOption(definition, [/revenue/i, /strategic reference/i], rowId);
  if (id === "clientAttribute") return findOption(definition, flags.mixed ? [/ability to expand/i, /testimonials/i] : [/inform roadmap/i, /testimonials/i], rowId);
  if (id === "supportedSalesCycle") return findOption(definition, flags.mixed ? [/30-60 days/i] : [/60-90 days/i], rowId);
  if (["goal30", "goal60", "goal90"].includes(id)) return findOption(definition, flags.mixed ? [/revenue|retention|expansion/i] : [/pipeline|revenue|validation/i], rowId);
  if (id === "sellingCapacity") return findOption(definition, flags.mixed ? [/sales owner plus support/i] : [/team-based/i, /dedicated sales owner/i], rowId);
  if (id === "revenueDataQuality") return findOption(definition, flags.mixed ? [/mixed|medium|some gaps/i] : [/low|inconsistent|some gaps/i], rowId);
  if (id === "personaRiskSeverity") return findOption(definition, [/medium/i, /high/i], rowId);
  if (id === "peopleInvolved") return findOption(definition, flags.dtc ? [/^1$/i, /2-3/i] : [/4-6/i, /2-3/i], rowId);
  if (id === "preDiscoveryTargetAccuracy") return findOption(definition, [/yes|accurate/i], rowId);
  if (id === "preFastestPathToTest") return findOption(definition, flags.dtc ? [/dtc.*end consumer/i] : [/corporate.*business buyer/i], rowId);
  if (id === "preWedgeOfferType") return findOption(definition, flags.dtc ? [/preorder/i, /deposit/i] : [/pilot/i, /founding customer/i], rowId);
  if (id === "prePriceTest") return findOption(definition, flags.dtc ? [/deposit|preorder|price range/i] : [/paid pilot|pilot fee|price range/i], rowId);
  if (id === "preRoutingDecisionNextStep") return findOption(definition, [/run.*test|interview|compare|validate/i], rowId);
  if (id === "preWeeklyActivityTarget") return findOption(definition, [/use recommendation/i, /10|20|30/i], rowId);
  if (id === "preMessageLead") return findOption(definition, [/problem|use case|recommendation/i], rowId);
  if (id === "currentStatus") return findOption(definition, [/active/i, /testing/i, /planned/i], rowId);
  if (id === "gtmMotion") return findOption(definition, flags.mixed ? [/retail.*local selling/i, /partner.*referral/i] : [/outbound sales/i, /founder-led/i], rowId);
  if (id === "customerGroup") return rowId.endsWith("2") ? alternateSegment(profile) : profile.customer.primarySegment;
  if (["offer", "offerOrUseCase"].includes(id)) return rowId.endsWith("2") ? profile.product.secondary : profile.product.primary;
  if (["primaryBuyer", "primaryBuyerPersona"].includes(id)) return profile.customer.buyer;
  if (id === "linkedSignalPlay") return rowId.endsWith("2") ? "Secondary targeting strategy" : "Primary targeting strategy";
  if (id === "channelSource") return profile.route.channels[Math.min(rowId.endsWith("2") ? 1 : 0, profile.route.channels.length - 1)];
  if (id === "primaryBuyer" || /primary buyer or decision driver/.test(label)) return profile.customer.buyer;
  if (id === "offerRole") return findOption(definition, rowId.endsWith("2") ? [/expansion|secondary|add-on/i] : [/primary|core|wedge/i], rowId);
  if (id === "assessmentDepth") return findOption(definition, [/full|detailed|complete/i], rowId);
  if (id === "performance rank") return findOption(definition, [/middle|medium|2|3/i], rowId);
  if (id === "source") return findOption(definition, [/crm/i, /customer/i, /website/i, /manual/i], rowId);
  if (id === "availableToday") return findOption(definition, [/yes/i, /partial/i], rowId);
  if (id === "reliability") return findOption(definition, [/medium/i, /high/i], rowId);
  if (id === "collectionMethod") return findOption(definition, [/manual/i, /both/i], rowId);
  if (id === "signal") return findOption(definition, flags.mixed ? [/low margin/i, /heavy implementation/i] : [/poor data quality/i, /long procurement/i, /low urgency/i], rowId);
  if (id === "action") return findOption(definition, [/disqualify|deprioritize|review/i], rowId);
  if (id === "involved") {
    const involvedRoles = flags.mixed
      ? ["economic-buyer", "executive-sponsor", "champion", "day-to-day-user", "procurement-finance", "operations"]
      : ["economic-buyer", "executive-sponsor", "champion", "day-to-day-user", "implementation-owner", "technical-security-reviewer", "procurement-finance", "operations", "likely-blocker"];
    return findOption(definition, involvedRoles.includes(rowId) ? [/yes/i] : [/no/i], rowId);
  }
  if (id === "decisionPower") return findOption(definition, /economic|executive|approver/.test(rowId) ? [/high/i] : [/medium/i, /low/i], rowId);
  if (id === "influenceLevel") return findOption(definition, /user|champion|implementation/.test(rowId) ? [/high/i] : [/medium/i, /high/i], rowId);
  if (id === "likelyObjection") return findOption(definition, flags.dtc ? [/price/i, /trust/i, /risk/i] : flags.mixed ? [/roi/i, /risk/i, /price/i] : [/security/i, /implementation burden/i, /roi/i], rowId);
  if (id === "importance") {
    const important = /economic|executive|champion|day-to-day-user|implementation-owner/.test(rowId);
    const notInvolved = flags.mixed && /technical-security|likely-blocker/.test(rowId);
    return findOption(definition, notInvolved ? [/not involved/i] : important ? [/high/i] : [/medium/i], rowId);
  }
  if (id === "confidence") return findOption(definition, flags.pre ? [/medium/i] : [/high/i, /medium/i], rowId);
  if (id === "rank") return findOption(definition, [/2|3|medium|middle/i, /high/i], rowId);
  if (id === "level") return findOption(definition, flags.pre ? [/high|constraint/i, /medium/i] : [/medium/i, /high/i], rowId);
  if (id === "measure") return findOption(definition, flags.mixed ? [/revenue|margin|reorder/i] : flags.pre ? [/customer|validation|conversation|commitment/i] : [/pipeline|revenue|conversion/i], rowId);
  if (id === "salesCycleFit") return findOption(definition, [/strong|good|high/i, /possible|medium/i], rowId);
  if (id === "strategicValue") return findOption(definition, [/high/i, /medium/i], rowId);
  if (id === "revenuePotentialContext" || id === "deliveryFit") return findOption(definition, [/yes|meaningful|can serve|strong/i, /probably|possible/i], rowId);
  if (id === "data quality" || /data quality/.test(label)) return findOption(definition, flags.pre ? [/low/i, /mid|medium/i] : [/mid|medium/i, /high/i], rowId);
  if (id === "expansionType") return findOption(definition, [/reorder|cross-sell|upsell|additional/i], rowId);
  if (id === "outcomeAchieved") return findOption(definition, flags.mixed ? [/revenue|margin|retention/i] : [/revenue|time|visibility/i], rowId);
  if (id === "expansionPotential") return findOption(definition, [/yes/i, /maybe/i], rowId);
  if (id === "timing") return findOption(definition, [/this quarter|30|60|90|now/i], rowId);
  if (id === "buyingSituation") return findOption(definition, flags.mixed ? [/department-led purchase/i] : [/cross-functional buying committee/i, /executive-sponsored/i], rowId);
  if (id === "blockerType") return findOption(definition, flags.mixed ? [/capacity|data|focus/i] : [/proof|process|focus|data/i], rowId);
  if (id === "successFocus") return findOption(definition, [/90-day success/i, /all timeframes/i], rowId);
  if (id === "severity") return findOption(definition, [/high/i, /medium/i], rowId);
  if (id === "timeframe") return findOption(definition, [/this week|30 days|this month/i], rowId);
  if (id === "permissionStatus") return findOption(definition, flags.pre ? [/internal reference only/i, /not asked yet/i] : [/likely yes/i, /confirmed yes/i], rowId);
  if (id === "proofStrength") return findOption(definition, flags.pre ? [/medium|early/i] : [/high|strong/i, /medium/i], rowId);
  if (id === "outcomeProven") return findOption(definition, flags.mixed ? [/margin|revenue|retention/i] : [/revenue|time|visibility|conversion/i], rowId);
  if (id === "shouldBecomeRule") return findOption(definition, [/caution signal/i], rowId);
  if (["bestFitBuyingStages", "bestFitCurrentWorkaround", "bestFitDisqualificationSignals", "icpCautionSignals", "icpDisqualificationRules"].includes(id)) {
    if (id === "bestFitBuyingStages") return profile.problem.urgency;
    if (id === "bestFitCurrentWorkaround") return profile.problem.currentAlternative;
    if (id === "bestFitDisqualificationSignals" || id === "icpDisqualificationRules") return profile.customer.avoid;
    return profile.constraints[0];
  }
  return "";
}
