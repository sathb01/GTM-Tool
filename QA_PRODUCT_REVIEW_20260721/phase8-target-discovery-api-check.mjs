import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const serverSource = fs.readFileSync(path.join(root, "server", "server.js"), "utf8");
const resultsSource = fs.readFileSync(path.join(root, "tool", "results.html"), "utf8");
const targetStart = resultsSource.indexOf("function renderTargetListWorkspace(data)");
const targetEnd = resultsSource.indexOf("function proofBuilderEvidence(data, profile)", targetStart);
const targetSource = resultsSource.slice(targetStart, targetEnd);

const statusResponse = await fetch(`${baseUrl}/api/target-discovery`, { cache: "no-store" });
const status = await statusResponse.json();
const unavailableResponse = status.configured ? null : await fetch(`${baseUrl}/api/target-discovery`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    context: { company: "ClientRenew OS", icp: "Managed-service and IT consulting firms", buyer: "COO or VP Client Services" },
    criteria: { categories: ["managed IT services"], geography: "North America", batchSize: 5 }
  })
});
const unavailableBody = unavailableResponse ? await unavailableResponse.json() : null;

const checks = [];
const check = (name, passed, detail = "") => checks.push({ name, passed: Boolean(passed), ...(detail ? { detail } : {}) });

check("Target discovery status endpoint responds", statusResponse.ok && typeof status.configured === "boolean", JSON.stringify(status));
check("Status endpoint never returns an API key", !/key|secret|token/i.test(JSON.stringify(status)), JSON.stringify(status));
if (!status.configured) {
  check("Unconfigured POST is safely rejected", unavailableResponse.status === 501, `${unavailableResponse.status} ${JSON.stringify(unavailableBody)}`);
  check("Unconfigured response names the required server step", /OPENAI_API_KEY/.test(unavailableBody?.nextStep || ""), JSON.stringify(unavailableBody));
}
check("Backend route is registered before generic research", /handleTargetDiscovery\(request, response, url\)[\s\S]*?handleResearch\(request, response, url\)/.test(serverSource));
check("Backend uses server-only OpenAI credentials", /Authorization": `Bearer \$\{process\.env\.OPENAI_API_KEY\}`/.test(serverSource) && !/Authorization|Bearer|process\.env/.test(targetSource));
check("Backend research uses OpenAI web search", /callOpenAiTargetDiscovery[\s\S]*?web_search_preview/.test(serverSource));
check("Backend limits target research cost", /targetDiscoveryRateLimit/.test(serverSource) && /five runs per day/.test(serverSource));
check("Backend prompt forbids contacts, outreach, and CRM writes", /Research companies only, not individual contacts/.test(serverSource) && /Do not draft or send outreach/.test(serverSource) && /do not write to a CRM/.test(serverSource));
check("Backend requires sources and observed evidence", /Every candidate must have at least one direct public source URL/.test(serverSource) && /!primaryUrl \|\| !observedEvidence\.length/.test(serverSource));
check("Backend ranks and caps the candidate batch", /\.sort\(\(a, b\) => a\.rank - b\.rank\)[\s\S]*?\.slice\(0, batchSize\)/.test(serverSource));
check("Frontend primary action calls only the backend endpoint", /fetch\(`\$\{API_BASE\}\/api\/target-discovery`/.test(targetSource) && !/api\.openai\.com/.test(targetSource));
check("Frontend sends prior decisions for refinement", /decisions: discovery\.candidates\.map/.test(targetSource) && /rating: candidate\.rating/.test(targetSource));
check("Frontend renders server candidates directly", /result\.candidates/.test(targetSource) && /renderCandidates\(\)/.test(targetSource));
check("Frontend has no pasted JSON workflow", !/targetCandidateResults|parseCandidateResults\(|Paste the structured|Review a sourced candidate batch/.test(targetSource));
check("Manual search is an optional unavailable-state fallback", /Optional manual search/.test(targetSource) && /Manual search is available below as an optional fallback/.test(targetSource));
check("Candidate review never writes to CRM or outreach", !/Confirm HubSpot additions|copyTargetListFields|send outreach|create contact/.test(targetSource));

const failed = checks.filter((item) => !item.passed);
console.log(JSON.stringify({ configured: status.configured, checks: checks.length, passed: checks.length - failed.length, failed: failed.length, failures: failed }, null, 2));
if (failed.length) process.exitCode = 1;
