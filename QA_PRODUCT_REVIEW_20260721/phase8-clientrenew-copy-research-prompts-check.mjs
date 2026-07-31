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
const start = resultsSource.indexOf("function renderTargetListWorkspace(data)");
const end = resultsSource.indexOf("function proofBuilderEvidence(data, profile)", start);
const targetSource = resultsSource.slice(start, end);

const icp = data.bestFitCustomerGroup || data.quickBestFitCustomer;
const variables = helper.deriveSearchVariables({
  icp,
  geography: data.geography,
  mustHave: [data["icpMustHaveSignals__item-1"]],
  exclusions: [data["bestFitDisqualificationSignals__item-1"]]
});
const approaches = helper.buildSearchApproaches(variables);
const promptPack = helper.buildResearchPromptPack({
  company: data.companyName,
  icp,
  buyer: data["signalPlayPortfolio__play-1__primaryBuyerPersona"],
  variables,
  approaches,
  feedback: { moreLikeCompany: "Strong Example Co", preferredSignal: "Account-management leadership hiring" }
});

const checks = [];
const check = (name, passed, detail = "") => checks.push({ name, passed: Boolean(passed), ...(detail ? { detail } : {}) });

check("Correct ClientRenew record loaded", /ClientRenew/i.test(record.name || data.companyName), record.name || data.companyName);
check("Copy button is inside optional How we searched disclosure", /<details><summary>How we searched<\/summary>[\s\S]*?id="copyResearchPrompts">Copy research prompts<\/button>/.test(targetSource));
check("Button exists only when candidates exist", /discovery\.candidates\.length \? `[\s\S]*?copyResearchPrompts/.test(targetSource));
check("Automatic server discovery remains the primary action", /id="buildTargetSearchPack"/.test(targetSource) && /api\/target-discovery/.test(targetSource));
check("Copy action uses current saved context and refinements", /buildResearchPromptPack\(\{[\s\S]*?icp: discoveryContext\.icp[\s\S]*?feedback: discovery\.feedback/.test(targetSource));
check("Copied prompt pack names the saved ICP", promptPack.includes(icp), promptPack);
check("Copied prompt pack includes every focused approach", approaches.every((approach) => promptPack.includes(approach.query)), promptPack);
check("Copied prompt pack includes guided refinements", /Strong Example Co/.test(promptPack) && /Account-management leadership hiring/.test(promptPack), promptPack);
check("Copied prompt pack is human-readable, not a JSON schema", !/[{}\[\]]/.test(promptPack) && !/Return JSON|candidates\":|sourceUrls/.test(promptPack), promptPack);
check("Copied prompt pack preserves evidence boundaries", /observed evidence/i.test(promptPack) && /inference clearly labeled as unconfirmed/i.test(promptPack), promptPack);
check("Copied prompt pack forbids contacts, outreach, and CRM writes", /Do not find contacts/.test(promptPack) && /send messages/.test(promptPack) && /write to a CRM/.test(promptPack), promptPack);
check("Copy action provides brief success confirmation", /Research prompts copied\./.test(targetSource));
check("Client API key and CRM writes remain absent", !/Authorization|Bearer|process\.env|Confirm HubSpot additions|copyTargetListFields/.test(targetSource));

const failed = checks.filter((item) => !item.passed);
console.log(JSON.stringify({ checks: checks.length, passed: checks.length - failed.length, failed: failed.length, failures: failed }, null, 2));
if (failed.length) process.exitCode = 1;
