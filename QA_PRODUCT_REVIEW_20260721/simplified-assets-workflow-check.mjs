import fs from "node:fs";

const source = fs.readFileSync(new URL("../tool/results.html", import.meta.url), "utf8");
const inlineScripts = [...source.matchAll(new RegExp("<script(?![^>]*\\bsrc=)[^>]*>([\\s\\S]*?)<\\/script>", "gi"))].map((match) => match[1]);
inlineScripts.forEach((script) => new Function(script));
const results = [];
const check = (name, passed) => results.push({ name, passed: Boolean(passed) });

check("ICP is presented as a usable brief", /title: "ICP Brief"/.test(source) && /Who we are targeting/.test(source) && /How to recognize a good fit/.test(source) && /What we still need to learn/.test(source));
check("B2B ICP target follows the buying account", /function preRevenueLooksLikeBuyingAccount/.test(source) && /pathKind === "channel"/.test(source) && /preRevenueListAnswer\(target, "Name the paying customer or buying account/.test(source));
check("ICP does not put segment trait categories in the target name", !/\["Who we are targeting", preRevenueListAnswer\(preRevenueKnownOrClue\([^\n]*segmentType/.test(source));
check("ICP translates dropdown selections into natural language", /function preRevenueIcpNaturalLanguage/.test(source) && /preRevenueIcpAnswer\([^\n]+"problem"/.test(source) && /preRevenueIcpAnswer\([^\n]+"urgency"/.test(source));
check("ICP can be copied, printed, or edited", /id="copyIcpBrief"/.test(source) && /Download \/ Print/.test(source) && /Edit ICP Source Answers/.test(source));
check("Target List explains how completion is recorded", /How to complete Target List Setup/.test(source) && /Save review list and complete Target List Setup/.test(source));
check("Target-search clues use plain language", /Website or software clues to look for/.test(source) && /People or places that could introduce you/.test(source));
check("Messaging is directional and accepts the final user message", /provides direction—not a finished message/.test(source) && /Save the Message You Will Use/.test(source) && /Copy Directional Guidance/.test(source));
check("Messaging does not render duplicate results or generic proof gaps", !/main\.appendChild\(evidence\);/.test(source) && !/main\.appendChild\(assets\);/.test(source));
check("Proof builder gives a practical product-demonstration assignment", /List at least five practical buyer or customer benefits/.test(source) && /Why Game/.test(source) && /What buyer action would count as a successful outcome/.test(source));
check("Proof builder preserves old usage data without requesting new duplicate logs", /Existing saved[\s\S]*usage data remains readable/.test(source) && !/usage\.querySelector\("#addProofUse"\)/.test(source));
check("Outreach Sequence rendering remains present", /function renderOutreachWorkspace/.test(source) && /Complete Outreach Sequence and continue/.test(source));

const failed = results.filter((result) => !result.passed);
results.forEach((result) => console.log(`${result.passed ? "PASS" : "FAIL"}: ${result.name}`));
if (failed.length) process.exitCode = 1;
else console.log(`${results.length} of ${results.length} checks passed.`);
