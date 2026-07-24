import { qaProfiles } from "./company-profiles.mjs";

const failures = [];
let passed = 0;

function check(name, condition, detail = "") {
  if (condition) {
    passed += 1;
    return;
  }
  failures.push({ name, detail });
}

function present(value) {
  return Array.isArray(value)
    ? value.length > 0 && value.every((item) => String(item || "").trim())
    : Boolean(String(value || "").trim());
}

function profileText(profile) {
  return JSON.stringify(profile).toLowerCase();
}

check("Exactly four replacement profiles", qaProfiles.length === 4, `Found ${qaProfiles.length}`);
check("Exactly two pre-revenue profiles", qaProfiles.filter((profile) => profile.mode === "preRevenue").length === 2);
check("Exactly two post-revenue profiles", qaProfiles.filter((profile) => profile.mode === "postRevenue").length === 2);
check("Exactly two SaaS profiles", qaProfiles.filter((profile) => /saas/.test(profile.archetype)).length === 2);
check("One pre-revenue D2C profile", qaProfiles.some((profile) => profile.archetype === "pre-revenue-dtc-consumer-product"));
check("One post-revenue mixed consumer profile", qaProfiles.some((profile) => profile.archetype === "post-revenue-mixed-consumer-brand"));

const ids = new Set();
const names = new Set();
for (const profile of qaProfiles) {
  check(`${profile.key}: unique record ID`, !ids.has(profile.id), profile.id);
  ids.add(profile.id);
  check(`${profile.key}: unique company name`, !names.has(profile.name), profile.name);
  names.add(profile.name);

  const required = {
    operatorName: profile.operator?.name,
    operatorRole: profile.operator?.role,
    website: profile.company?.website,
    industry: profile.company?.industry,
    businessModel: profile.company?.businessModel,
    stage: profile.company?.stage,
    primaryProduct: profile.product?.primary,
    productDescription: profile.product?.description,
    offer: profile.product?.offer,
    customerSegment: profile.customer?.primarySegment,
    customerDescription: profile.customer?.plainLanguage,
    buyer: profile.customer?.buyer,
    primaryProblem: profile.problem?.primary,
    urgency: profile.problem?.urgency,
    buyerOutcome: profile.outcome?.buyer,
    successMeasure: profile.outcome?.measure,
    continueRule: profile.outcome?.continue,
    reviseRule: profile.outcome?.revise,
    stopRule: profile.outcome?.stop,
    evidence: profile.evidence?.known,
    evidenceStatement: profile.evidence?.statement,
    missingEvidence: profile.evidence?.missing,
    primaryRoute: profile.route?.primary,
    channels: profile.route?.channels,
    motion: profile.route?.motion,
    activityTarget: profile.route?.activityTarget,
    reviewCadence: profile.route?.reviewCadence,
    constraints: profile.constraints,
    proofAvailable: profile.proof?.available,
    proofMissing: profile.proof?.missing,
    sourceOfTruth: profile.systems?.sourceOfTruth,
    savedEvidenceBoundary: profile.provenance?.savedEvidence,
    assumptionBoundary: profile.provenance?.assumptions
  };
  Object.entries(required).forEach(([field, value]) => {
    check(`${profile.key}: ${field} is defined`, present(value));
  });

  check(`${profile.key}: evidence and assumptions do not overlap`,
    !profile.provenance.savedEvidence.some((evidence) => profile.provenance.assumptions.some((assumption) => evidence.toLowerCase() === assumption.toLowerCase())));
  check(`${profile.key}: no bare Other value`, !Object.values(profile).some((value) => String(value).trim() === "Other"));
  check(`${profile.key}: no unresolved AI placeholder`, !/(ai please|ai recommendation|not captured yet)/i.test(profileText(profile)));
  check(`${profile.key}: continue rule is measurable`, /\d|at least|exceeds|reaches|positive/i.test(profile.outcome.continue), profile.outcome.continue);
  check(`${profile.key}: revise rule names a variable`, /(segment|use occasion|contents|price|workflow|integration|assortment|merchandising|account criteria|problem|proof)/i.test(profile.outcome.revise), profile.outcome.revise);
  check(`${profile.key}: stop rule is explicit`, /(pause|stop)/i.test(profile.outcome.stop), profile.outcome.stop);
}

const roamReady = qaProfiles.find((profile) => profile.key === "roamready");
const referralPath = qaProfiles.find((profile) => profile.key === "referralpath");
const trailPour = qaProfiles.find((profile) => profile.key === "trailpour");
const clientRenew = qaProfiles.find((profile) => profile.key === "clientrenew");

check("RoamReady is D2C-first", /direct to consumer/i.test(roamReady.route.primary));
check("RoamReady does not use B2B approval as the primary path", !/procurement|practice administrator|retail buyer/i.test(roamReady.customer.buyer));
check("ReferralPath includes a multi-role B2B buying path", present(referralPath.customer.blocker) && present(referralPath.customer.approver));
check("ReferralPath does not claim security is proven", referralPath.evidence.missing.some((item) => /security/i.test(item)));
check("TrailPour separates primary retail and secondary D2C segments", present(trailPour.customer.primarySegment) && present(trailPour.customer.secondarySegment));
check("TrailPour uses retailer economics for its primary decision", /sell-through|margin|reorder/i.test(trailPour.outcome.measure));
check("ClientRenew preserves the assumed segment separately", present(clientRenew.customer.assumedSegment));
check("ClientRenew recommendation is grounded in historical wins", /six of ten fastest wins/i.test(clientRenew.evidence.known.join(" ")));

const forbiddenLegacyPhrases = [
  "pawpath",
  "brightnest",
  "forgeline",
  "relaymetrics",
  "fishing shorts",
  "blacksmith",
  "mission belt",
  "grounded brand",
  "nesttrail",
  "queuepilot",
  "fieldsip",
  "renewalgrid"
];
for (const profile of qaProfiles) {
  forbiddenLegacyPhrases.forEach((phrase) => {
    check(`${profile.key}: no legacy phrase ${phrase}`, !profileText(profile).includes(phrase));
  });
}

const result = {
  generatedAt: new Date().toISOString(),
  profiles: qaProfiles.map(({ id, name, mode, archetype }) => ({ id, name, mode, archetype })),
  passed,
  failed: failures.length,
  failures
};

console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;
