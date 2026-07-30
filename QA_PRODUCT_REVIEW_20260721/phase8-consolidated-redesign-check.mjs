import fs from "node:fs";
import vm from "node:vm";

const app = fs.readFileSync(new URL("../tool/app.js", import.meta.url), "utf8");
const schema = fs.readFileSync(new URL("../tool/intake-schema.js", import.meta.url), "utf8");
const results = fs.readFileSync(new URL("../tool/results.html", import.meta.url), "utf8");
const scripts = [...results.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)]
  .map((match) => match[1])
  .filter((source) => source.trim());

const checks = [
  ["All inline result scripts parse", () => scripts.forEach((source, index) => new vm.Script(source, { filename: `results-inline-${index + 1}.js` }))],
  ["Plan Summary is the return destination", () => /resultsUrl\(undefined,\s*"gtm"\)/.test(app) && /Return to Plan Summary/.test(app)],
  ["Summary uses launch decisions and blockers", () => /function launchDecisionForScore/.test(results) && /Readiness Blockers \/ What Needs Attention/.test(results)],
  ["Evidence confidence is removed from score display", () => !/<span>Evidence confidence<\/span>/.test(results) && !/Evidence confidence: \$\{/.test(results)],
  ["Advanced weight presets compare standard and current scores", () => /readinessWeightSettings/.test(results) && /Standard score:/.test(results) && /The launch decision changed/.test(results)],
  ["Offer value claims use current canonical columns", () => /outcomeType/.test(results) && /buyerFacingClaim/.test(results) && /successMetric/.test(results) && /targetImprovement/.test(results)],
  ["Channel source remains shared multi-select with Other validation", () => /id:\s*"channelSource"[\s\S]{0,240}type:\s*"multiSelectDropdown"/.test(schema) && /requireOther:\s*true/.test(schema)],
  ["Channel labels follow status and results are Active-only", () => /updateChannelContextLabels/.test(app) && /Last 90 Day Results/.test(app) && /value:\s*"Active"/.test(app)],
  ["Channel owner is a role select", () => /label:\s*"Owner role",\s*type:\s*"select"/.test(app) && /"VP Sales"/.test(app)],
  ["Pipeline inputs are explicitly a starting baseline", () => /Starting Pipeline Baseline \(pre-launch\)/.test(app)],
  ["CRM routing and stalled-deal tables are not rendered in core planning", () => /\.filter\(\(table\) => table\.id\.endsWith\("__conversionStages"\)\)/.test(app)],
  ["Tool Setup advances one current task", () => /currentSetupTool/.test(results) && /Work on one current setup task at a time/.test(results)],
  ["Brief review completion stays in context", () => /Mark \$\{tool\.label\} ready and continue/.test(results) && /data-mark-tool-ready/.test(results)],
  ["Weekly review setup is separate and durable", () => /weeklyGtmReviewSetupWorkspace/.test(results) && /Set weekly review ready/.test(results) && /requestedAsset === "weekly-review-setup"/.test(results)],
  ["Weekly evidence forms a controlled next experiment", () => /Form the Next Experiment from Evidence/.test(results) && /weeklyNextHypothesis/.test(results)],
  ["Target setup has one primary CRM-list action", () => /Create the list in \$\{escapeHtml\(systemLabel\)\}/.test(results) && /Messaging, outreach, and weekly review remain separate resumable setup tasks/.test(results)]
];

const resultsList = checks.map(([check, run]) => {
  try {
    const passed = run() !== false;
    return { check, passed };
  } catch (error) {
    return { check, passed: false, detail: error.message };
  }
});

const failed = resultsList.filter((item) => !item.passed);
console.log(JSON.stringify({
  checks: resultsList.length,
  passed: resultsList.length - failed.length,
  failed: failed.length,
  failures: failed.map((item) => item.detail ? `${item.check}: ${item.detail}` : item.check),
  results: resultsList
}, null, 2));

if (failed.length) process.exitCode = 1;
