import fs from "node:fs";
import path from "node:path";
import { qaProfiles } from "./company-profiles.mjs";

const root = path.resolve(import.meta.dirname, "..");
const records = JSON.parse(fs.readFileSync(path.join(root, "server/data/records.json"), "utf8"));
const failures = [];
const findings = [];
let passed = 0;

function check(name, condition, detail = "") {
  if (condition) {
    passed += 1;
    return;
  }
  failures.push({ name, detail });
}

function record(id) {
  return records.find((item) => item.id === id);
}

function textValues(data) {
  return Object.entries(data || {}).filter(([, value]) => typeof value === "string");
}

function field(data, key) {
  return String(data?.[key] ?? "").trim();
}

function has(value, pattern) {
  return pattern.test(String(value || ""));
}

const legacyPhrases = /pawpath|brightnest|forgeline|relaymetrics|nesttrail|queuepilot|fieldsip|renewalgrid|fishing shorts|blacksmith|mission belt|grounded brand/i;
const placeholders = /ai please|ai recommendation|not captured yet|completed answer for|undefined|null|\[object object\]/i;

for (const profile of qaProfiles) {
  const item = record(profile.id);
  check(`${profile.key}: saved record exists`, Boolean(item));
  if (!item) continue;
  const data = item.data || {};
  const values = textValues(data);
  const allText = values.map(([, value]) => value).join(" | ");

  check(`${profile.key}: semantic fixture version`, field(data, "qaProfileVersion") === "2026-07-24-semantic-v2");
  check(`${profile.key}: company name`, field(data, "companyName") === profile.name, field(data, "companyName"));
  check(`${profile.key}: customer context`, field(data, "customerContextStarter") === profile.customer.plainLanguage);
  check(`${profile.key}: primary segment`, field(data, "quickBestFitCustomer") === profile.customer.primarySegment);
  check(`${profile.key}: primary problem`, field(data, "quickBuyerProblem") === profile.problem.primary);
  check(`${profile.key}: primary offer`, field(data, "primaryOfferName") === profile.product.primary);
  check(`${profile.key}: no placeholders`, !placeholders.test(allText));
  check(`${profile.key}: no bare Other`, !values.some(([, value]) => value.trim() === "Other"));
  check(`${profile.key}: no legacy company leakage`, !legacyPhrases.test(allText));
  check(`${profile.key}: evidence boundary saved`, field(data, "qaEvidenceBoundary") === JSON.stringify(profile.provenance));
  if (profile.mode === "postRevenue") {
    check(`${profile.key}: primary offer relationship uses a row ID`, field(data, "primaryGtmOffer") === "offer-1", field(data, "primaryGtmOffer"));
    check(`${profile.key}: primary targeting strategy relationship uses a row ID`, field(data, "primarySignalPlay") === "play-1", field(data, "primarySignalPlay"));
    check(`${profile.key}: primary revenue motion relationship uses a row ID`, field(data, "primaryRevenueMotion") === "motion-1", field(data, "primaryRevenueMotion"));
    check(`${profile.key}: linked targeting strategy relationships use row IDs`,
      /^play-\d+$/.test(field(data, "revenueMotionPortfolio__motion-1__linkedSignalPlay"))
      && /^play-\d+$/.test(field(data, "revenueMotionPortfolio__motion-2__linkedSignalPlay")),
      `${field(data, "revenueMotionPortfolio__motion-1__linkedSignalPlay")} / ${field(data, "revenueMotionPortfolio__motion-2__linkedSignalPlay")}`);
  }

  const repeated = [...new Map(values
    .filter(([, value]) => value.length >= 60 && !/^https?:/i.test(value))
    .map(([key, value]) => [value, { value, keys: values.filter(([, candidate]) => candidate === value).map(([candidateKey]) => candidateKey) }])).values()]
    .filter((entry) => entry.keys.length > 12);
  check(`${profile.key}: no long answer repeated across more than 12 fields`, repeated.length === 0,
    repeated.map((entry) => `${entry.keys.length}x ${entry.value.slice(0, 100)}`).join("; "));

  const groupOne = field(data, "possibleCustomerGroups__customer-group-1__groupName");
  const groupTwo = field(data, "possibleCustomerGroups__customer-group-2__groupName");
  if (profile.mode === "postRevenue") {
    check(`${profile.key}: two customer hypotheses are distinct`, groupOne && groupTwo && groupOne !== groupTwo, `${groupOne} / ${groupTwo}`);
  }

  const suspicious = values.filter(([key, value]) => {
    if (/url|website|publicPresence/.test(key)) return false;
    if (profile.key === "referralpath") return /gift purchase|consumer trend|specialty option|end consumer \/ direct-to-consumer/i.test(value);
    if (profile.key === "roamready") return /procurement-led|enterprise security|retail buyer outreach|business account/i.test(value);
    if (profile.key === "trailpour") return /saas|software subscription|patient referral|family travel/i.test(value);
    if (profile.key === "clientrenew") return /retail assortment|sell-through|family travel|patient referral/i.test(value);
    return false;
  });
  check(`${profile.key}: no scenario-incompatible answers`, suspicious.length === 0,
    suspicious.slice(0, 10).map(([key, value]) => `${key}=${value}`).join("; "));

  if (profile.key === "roamready") {
    check("roamready: D2C route selected", /end consumer|direct-to-consumer/i.test(field(data, "preRevenueRouteToMarket")), field(data, "preRevenueRouteToMarket"));
    check("roamready: validation includes observable commitment", /preorder|deposit/i.test(field(data, "preWedgeOfferType")), field(data, "preWedgeOfferType"));
    check("roamready: missing evidence includes willingness to pay", /willingness to pay/i.test(field(data, "preMissingEvidenceDtc")), field(data, "preMissingEvidenceDtc"));
  }
  if (profile.key === "referralpath") {
    check("referralpath: business route selected", /business buyer/i.test(field(data, "preRevenueRouteToMarket")), field(data, "preRevenueRouteToMarket"));
    check("referralpath: pilot is the wedge", /pilot/i.test(field(data, "preWedgeOfferType")), field(data, "preWedgeOfferType"));
    check("referralpath: channel problem is workflow relevant", /workflow|adoption|proof/i.test(field(data, "preProblemHypothesisChannel")), field(data, "preProblemHypothesisChannel"));
  }
  if (profile.key === "trailpour") {
    check("trailpour: retailer is primary", /independent outdoor retailers/i.test(field(data, "bestFitCustomerGroup")));
    check("trailpour: consumer segment remains secondary", /outdoor households/i.test(groupTwo), groupTwo);
    check("trailpour: wholesale motion is preserved",
      /wholesale|retail/i.test(field(data, "revenueMotionPortfolio__motion-1__playName")),
      field(data, "revenueMotionPortfolio__motion-1__playName"));
  }
  if (profile.key === "clientrenew") {
    check("clientrenew: evidence-backed segment is primary", /managed-service and it consulting firms/i.test(field(data, "bestFitCustomerGroup")));
    check("clientrenew: assumed SaaS segment remains a separate hypothesis", /b2b saas companies/i.test(groupTwo), groupTwo);
    check("clientrenew: problem is renewal workflow", /renewal risk|renewal/i.test(field(data, "quickBuyerProblem")), field(data, "quickBuyerProblem"));
  }

  findings.push({
    id: profile.id,
    name: profile.name,
    savedKeys: Object.keys(data).length,
    longDuplicateGroupsOver12: repeated.length,
    suspiciousAnswers: suspicious.length
  });
}

const result = {
  generatedAt: new Date().toISOString(),
  passed,
  failed: failures.length,
  failures,
  records: findings
};

const outputPath = path.join(import.meta.dirname, "semantic-record-results.json");
if (process.env.GTM_QA_WRITE_RESULTS === "1") {
  fs.writeFileSync(outputPath, `${JSON.stringify(result, null, 2)}\n`);
}
console.log(JSON.stringify(result, null, 2));
if (failures.length) process.exitCode = 1;
