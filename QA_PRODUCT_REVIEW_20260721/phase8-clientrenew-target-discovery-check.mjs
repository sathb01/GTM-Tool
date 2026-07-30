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

const context = {
  icp: data.bestFitCustomerGroup || data.quickBestFitCustomer,
  geography: data.geography,
  mustHave: Object.entries(data).filter(([key]) => /^icpMustHaveSignals__item-/.test(key)).map(([, value]) => value),
  exclusions: Object.entries(data).filter(([key]) => /^avoidSegments__item-/.test(key)).map(([, value]) => value),
  disqualifications: Object.entries(data).filter(([key]) => /^icpDisqualificationRules__item-/.test(key)).map(([, value]) => value),
  referralPaths: [data.quickPrimaryRevenueSource]
};
const variables = helper.deriveSearchVariables(context);
const approaches = helper.buildSearchApproaches(variables);
const prompt = helper.buildDiscoveryPrompt({ company: data.companyName, variables, approaches, feedback: { technology: "Require a public source." } });
const candidates = helper.parseCandidateResults(JSON.stringify({
  candidates: [{
    company: "Evidence Example",
    url: "https://example.invalid/evidence",
    sourceLabel: "Company website",
    observedEvidence: ["Public managed-services page"],
    inferredFit: ["Recurring-client model may fit"],
    missingInformation: ["Current HubSpot use"],
    risks: ["Employee count not confirmed"]
  }]
}));

const checks = [];
const check = (name, passed, detail = "") => checks.push({ name, passed: Boolean(passed), ...(detail ? { detail } : {}) });

check("Correct ClientRenew record loaded", /ClientRenew/i.test(record.name || data.companyName), record.name || data.companyName);
check("ClientRenew categories become observable proxies", variables.categories.includes("managed IT services") && variables.categories.includes("IT consulting"), JSON.stringify(variables.categories));
check("ClientRenew employee range is derived", variables.employeeMin === 40 && variables.employeeMax === 200, JSON.stringify({ min: variables.employeeMin, max: variables.employeeMax }));
check("HubSpot becomes an investigation signal, not a fact", variables.technologySignals.some((item) => /HubSpot.*mention|partner-directory/i.test(item)), JSON.stringify(variables.technologySignals));
check("Recurring-service language becomes an observable signal", variables.serviceSignals.some((item) => /recurring|managed-services/i.test(item)), JSON.stringify(variables.serviceSignals));
check("Missing CS function stays a team-structure hypothesis", variables.teamSignals.some((item) => /no dedicated customer-success role/i.test(item)), JSON.stringify(variables.teamSignals));
check("Search pack uses a small number of focused approaches", approaches.length === 4 && approaches.every((item) => item.query && item.why && item.evidenceBoundary), JSON.stringify(approaches));
check("Search queries do not use the literal ICP sentence", approaches.every((item) => !item.query.includes(context.icp)), approaches.map((item) => item.query).join(" | "));
check("AI prompt explicitly separates observed and inferred evidence", /Separate observed evidence from inferred fit/.test(prompt) && /Never claim employee count, HubSpot use/.test(prompt));
check("AI prompt includes reviewer refinements", /technology: Require a public source/.test(prompt));
check("AI prompt forbids outreach", /Do not find contacts, draft outreach, or send messages/.test(prompt));
check("Candidate parser preserves evidence boundaries", candidates.length === 1 && candidates[0].observedEvidence.length === 1 && candidates[0].inferredFit.length === 1 && candidates[0].missingInformation.length === 1 && candidates[0].risks.length === 1, JSON.stringify(candidates[0]));
check("Candidate parser rejects non-public URL schemes", helper.normalizeCandidate({ company: "Unsafe", url: "javascript:alert(1)" }).url === "");
check("Discovery is nested safely in existing target workspace", /targetWorkspace\.discovery = discovery/.test(targetSource) && /version: 1/.test(targetSource));
check("Existing discovery variables and candidates are preserved", /storedDiscovery\.variables/.test(targetSource) && /storedDiscovery\.candidates/.test(targetSource));
check("Primary page explains observable public signals", /Find target companies[\s\S]*?observable public signals/.test(targetSource));
check("User edits variables before building search pack", /targetDiscoveryCategories/.test(targetSource) && /buildTargetSearchPack/.test(targetSource));
check("Focused approaches explain query why and boundary", /Focused search approaches[\s\S]*?Evidence boundary/.test(targetSource));
check("No paid browser research is invoked", /No paid browser-triggered research runs here/.test(targetSource) && !/fetch\([^)]*api\/research/.test(targetSource));
check("Controlled AI prompt is copy-only", /id="copyTargetDiscoveryPrompt">Copy AI discovery prompt/.test(targetSource) && /copyTextToClipboard\(prompt\)/.test(targetSource));
check("Candidate import requires sourced structured fields", /company, source URL, observed evidence, inferred fit, missing information, and risks/.test(targetSource));
check("Candidate import limits results to the selected review batch", /\.slice\(0, discovery\.variables\.batchSize\)/.test(targetSource));
check("Candidate review clearly labels hypotheses", /Inferred fit — hypothesis only/.test(targetSource));
check("User remains candidate approver", /The user remains the approver/.test(targetSource) && /\["Pending review", "Accepted", "Rejected"\]/.test(targetSource));
check("Next-batch feedback captures all approved patterns", ["industry", "geography", "size", "technology", "referral", "exclusion"].every((field) => targetSource.includes(`data-discovery-feedback="${field}"`)));
check("Accepted companies require manual HubSpot verification", /Accepted candidates still require manual/.test(targetSource) && /no CRM connector/.test(targetSource));
check("Required HubSpot fields remain available", /Company or account name/.test(targetSource) && /Buyer response, objection, or learning/.test(targetSource));
check("Fields-copy action copies only the checklist", /copyTargetListFields[\s\S]*?\["REQUIRED FIELDS", \.\.\.requiredFields\.map/.test(targetSource));
check("Initial target defaults to 25 with contextual editing", variables.initialTarget === 25 && /Initial qualified-list target/.test(targetSource));
check("Completing HubSpot handoff advances Tool Setup", /toolSetup\.statuses\.targets = "Ready"/.test(targetSource) && /setupTask: nextTool\.id/.test(targetSource));

const failed = checks.filter((item) => !item.passed);
console.log(JSON.stringify({ checks: checks.length, passed: checks.length - failed.length, failed: failed.length, failures: failed }, null, 2));
if (failed.length) process.exitCode = 1;
