import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const recordId = "qa3-post-saas-clientrenew-20260724";
const response = await fetch(`${baseUrl}/api/records/${recordId}`, { cache: "no-store" });
if (!response.ok) throw new Error(`Could not load ${recordId}: ${response.status}`);
const record = (await response.json()).record;
const resultsSource = fs.readFileSync(path.join(root, "tool", "results.html"), "utf8");
const start = resultsSource.indexOf("function renderTargetListWorkspace(data)");
const end = resultsSource.indexOf("function proofBuilderEvidence(data, profile)", start);
const targetSource = resultsSource.slice(start, end);

const checks = [];
const check = (name, passed, detail = "") => checks.push({ name, passed: Boolean(passed), ...(detail ? { detail } : {}) });

check("Correct ClientRenew record loaded", /ClientRenew/i.test(record.name || record.data?.companyName), record.name || record.data?.companyName);
check("Default screen leads with a generated search brief", /target-search-brief/.test(targetSource) && ["Industry / type", "Company size", "Geography", "Observable signals", "Exclusions"].every((label) => targetSource.includes(label)));
check("Primary action is Find target companies", /id="buildTargetSearchPack">Find target companies<\/button>/.test(targetSource));
check("Edit search criteria is secondary and collapsed by default", /class="secondary" id="editTargetSearchCriteria">Edit search criteria/.test(targetSource) && /<details id="targetSearchCriteriaEditor">/.test(targetSource) && !/<details id="targetSearchCriteriaEditor" open/.test(targetSource));
check("Criteria use plain labels and line-separated editing", /One criterion per line/.test(targetSource) && !/semicolon-separated|technical-entry/.test(targetSource));
check("Referral and exclusions are optional plain criteria", /Optional referral or access path/.test(targetSource) && /Exclude companies when this is publicly verified/.test(targetSource));
check("Internal contextual scaffolding is absent", ["Applies to:", "Why now:", "What to enter:", "Readiness effect:", "guidedInputMarkup"].every((label) => !targetSource.includes(label)));
check("No pre-search signal configuration panel is rendered", !/targetObservableSignal|Observable buying signal|Where it can be found:|What it implies:|Source to verify/.test(targetSource));
check("Observable signal catalog is not in the normal flow", !/Customer-success, account-management|Public HubSpot use, integration/.test(targetSource));
check("Find action reveals the controlled search handoff", /approachesSection\.hidden = false/.test(targetSource) && /candidateInput\.hidden = false/.test(targetSource));
check("Paid research limitation remains honest", /does not run paid research automatically/.test(targetSource) && !/fetch\([^)]*api\/research/.test(targetSource));
check("Results show source, rationale, observed evidence, and inference", /Why it is worth review:/.test(targetSource) && /Observed evidence/.test(targetSource) && /Inference — verify before use/.test(targetSource) && /candidate\.url/.test(targetSource));
check("Candidate decisions stay simple", /\["Pending review", "Accepted", "Rejected"\]/.test(targetSource) && /Save decision/.test(targetSource));
check("Search method is disclosed only with results", /discovery\.candidates\.length[\s\S]*?<details><summary>How we searched/.test(targetSource));
check("Post-result refinement can prefer a signal or exclude a pattern", /refinement\.hidden = !discovery\.candidates\.length/.test(targetSource) && /data-discovery-feedback="preferredSignal"/.test(targetSource) && /Exclude this verified pattern/.test(targetSource));
check("No outreach or CRM write is added", !/send outreach|create contact|api\/research/.test(targetSource) && /No CRM connector is used/.test(targetSource));

const failed = checks.filter((item) => !item.passed);
console.log(JSON.stringify({ checks: checks.length, passed: checks.length - failed.length, failed: failed.length, failures: failed }, null, 2));
if (failed.length) process.exitCode = 1;
