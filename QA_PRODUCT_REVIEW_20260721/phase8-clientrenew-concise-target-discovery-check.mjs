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
check("Default screen leads with a generated search brief", /target-search-brief/.test(targetSource) && ["Target company type", "Company size", "Geography", "Observable signals", "Exclusions"].every((label) => targetSource.includes(label)));
check("Primary action is Find target companies and becomes Find more companies", /id="buildTargetSearchPack">\$\{discovery\.candidates\.length \? "Find more companies" : "Find target companies"\}/.test(targetSource));
check("Edit search criteria is secondary and collapsed by default", /class="secondary" id="editTargetSearchCriteria">Edit search criteria/.test(targetSource) && /<details id="targetSearchCriteriaEditor">/.test(targetSource) && !/<details id="targetSearchCriteriaEditor" open/.test(targetSource));
check("Criteria separate target company type from product industry", /Target company type/.test(targetSource) && /Employee range/.test(targetSource) && !/Any public company size/.test(targetSource));
check("Optional search clues are tool-generated, plain-language, and collapsible", /Suggested by GTM Intelligence OS/.test(targetSource) && /Review or revise optional search suggestions/.test(targetSource) && /People or places that could introduce you \(optional\)/.test(targetSource) && /Use normal words or short phrases/.test(targetSource) && /Exclude companies only when this is publicly verified \(optional\)/.test(targetSource));
check("Internal contextual scaffolding is absent", ["Applies to:", "Why now:", "What to enter:", "Readiness effect:", "guidedInputMarkup"].every((label) => !targetSource.includes(label)));
check("No pre-search signal configuration panel is rendered", !/targetObservableSignal|Observable buying signal|Where it can be found:|What it implies:|Source to verify/.test(targetSource));
check("Observable signal catalog is not in the normal flow", !/Customer-success, account-management|Public HubSpot use, integration/.test(targetSource));
check("Find action calls the configured server research endpoint", /fetch\(`\$\{API_BASE\}\/api\/target-discovery`/.test(targetSource) && /method: "POST"/.test(targetSource));
check("Unavailable state keeps manual search optional", /AI research is not configured/.test(targetSource) && /Optional manual search/.test(targetSource));
check("Results show source, rationale, observed evidence, and inference", /Why review:/.test(targetSource) && /Observed evidence/.test(targetSource) && /Inference — not confirmed/.test(targetSource) && /candidateSources\(candidate\)/.test(targetSource));
check("Candidate decisions stay simple", /Good fit/.test(targetSource) && /Not a fit/.test(targetSource) && /Not sure/.test(targetSource) && /Save decision/.test(targetSource));
check("Search method is disclosed only with results", /discovery\.candidates\.length[\s\S]*?<details><summary>How we searched/.test(targetSource));
check("Post-result tuning is bounded by prior decisions", /Find more companies like/.test(targetSource) && /Avoid companies like/.test(targetSource) && /data-discovery-feedback="preferredSignal"/.test(targetSource));
check("No pasted JSON or implementation plumbing is exposed", !/targetCandidateResults|Paste the structured|Review a sourced candidate batch|rebuild search pack/.test(targetSource));
check("Good-fit decisions add only to a review list", /Choose Good fit to add a company to the review list/.test(targetSource) && /Save review list and complete Target List Setup/.test(targetSource));
check("No outreach or CRM write is added", !/send outreach|create contact|Confirm HubSpot additions|copyTargetListFields/.test(targetSource));

const failed = checks.filter((item) => !item.passed);
console.log(JSON.stringify({ checks: checks.length, passed: checks.length - failed.length, failed: failed.length, failures: failed }, null, 2));
if (failed.length) process.exitCode = 1;
