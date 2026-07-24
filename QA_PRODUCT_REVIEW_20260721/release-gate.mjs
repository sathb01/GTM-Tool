import { execFile } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = path.resolve(import.meta.dirname, "..");
const node = process.execPath;
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const releaseMarker = String(process.env.GTM_RELEASE_MARKER || "").trim();
const cookie = String(process.env.GTM_QA_COOKIE || "").trim();
const isLive = !/^https?:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?$/i.test(baseUrl);
const startedAt = new Date();
const timestamp = startedAt.toISOString().replace(/[:.]/g, "-");
const archiveDirectory = path.join(import.meta.dirname, "releases", timestamp);

const syntaxSuites = [
  ["Syntax: intake application", "tool/app.js"],
  ["Syntax: intake schema", "tool/intake-schema.js"],
  ["Syntax: server", "server/server.js"],
  ["Syntax: AI intake assistance", "tool/ai-intake-assist.js"],
  ["Syntax: shared feedback", "tool/ui-feedback.js"]
].map(([name, file]) => ({ name, command: node, args: ["--check", file], category: "syntax" }));

const browserSuites = [
  ["Synthetic profile quality", "profile-quality-check.mjs", "content"],
  ["Semantic answer quality", "semantic-record-check.mjs", "content"],
  ["Intake startup and section persistence", "intake-startup-navigation-check.mjs", "persistence"],
  ["Visible field binding", "visible-field-binding-check.mjs", "schema"],
  ["Score and evidence separation", "phase1-score-separation-check.mjs", "scoring"],
  ["Claim dependency integrity", "phase1-claim-dependency-check.mjs", "scoring"],
  ["Conflict resolution", "phase1-conflict-resolution-check.mjs", "content"],
  ["Ranked recommendation provenance", "phase1-ranked-provenance-check.mjs", "content"],
  ["Adaptive AI control safety", "phase2-ai-classification-check.mjs", "ai"],
  ["Four-company AI context isolation", "phase2-four-company-ai-context-check.mjs", "ai"],
  ["Canonical plan integrity", "phase3-canonical-plan-check.mjs", "plans"],
  ["Asset contracts and exports", "phase3-asset-contract-export-check.mjs", "assets"],
  ["Experience and accessibility", "phase4-experience-accessibility-check.mjs", "responsive"],
  ["Post-revenue section deep links", "post-section-deep-link-check.mjs", "routes"],
  ["Four-company intake and output sweep", "headless-intake-output-check.mjs", "render"]
].map(([name, file, category]) => ({
  name,
  command: node,
  args: [path.join("QA_PRODUCT_REVIEW_20260721", file)],
  category
}));

if (!isLive) {
  browserSuites.splice(8, 0, {
    name: "Guided ranked-priority roundtrip",
    command: node,
    args: [path.join("QA_PRODUCT_REVIEW_20260721", "phase1-ranked-roundtrip-check.mjs")],
    category: "persistence"
  });
}

function parsedSummary(stdout) {
  const text = String(stdout || "").trim();
  if (!text) return {};
  for (let index = 0; index < text.length; index += 1) {
    if (!["{", "["].includes(text[index])) continue;
    try {
      const value = JSON.parse(text.slice(index));
      if (Array.isArray(value)) {
        return {
          checks: value.length,
          passed: value.filter((item) => item?.passed !== false).length,
          failed: value.filter((item) => item?.passed === false).length,
          failures: value.filter((item) => item?.passed === false).map((item) => item?.check || item?.recordId || "Failed check")
        };
      }
      return {
        checks: Number(value.checks ?? value.passed ?? 0),
        passed: Number(value.passed ?? 0),
        failed: Number(value.failed ?? (Array.isArray(value.failures) ? value.failures.length : 0)),
        failures: Array.isArray(value.failures) ? value.failures.slice(0, 20) : []
      };
    } catch {
      // Continue until a complete JSON value is found.
    }
  }
  return {};
}

async function deployedMarkerGate() {
  if (!isLive) {
    return {
      name: "Deployment marker",
      category: "deployment",
      status: "skipped",
      checks: 0,
      passed: 0,
      failed: 0,
      durationMs: 0,
      detail: "Local release gate does not require a deployed marker."
    };
  }
  if (!releaseMarker) {
    return {
      name: "Deployment marker",
      category: "deployment",
      status: "failed",
      checks: 1,
      passed: 0,
      failed: 1,
      durationMs: 0,
      failures: ["Set GTM_RELEASE_MARKER to a string present only in the intended deployed release."]
    };
  }
  const began = Date.now();
  try {
    const response = await fetch(`${baseUrl}/index.html?v=${encodeURIComponent(timestamp)}`, {
      headers: cookie ? { Cookie: cookie } : {},
      redirect: "follow"
    });
    const html = await response.text();
    const passed = response.ok && html.includes(releaseMarker);
    return {
      name: "Deployment marker",
      category: "deployment",
      status: passed ? "passed" : "failed",
      checks: 1,
      passed: passed ? 1 : 0,
      failed: passed ? 0 : 1,
      durationMs: Date.now() - began,
      failures: passed ? [] : [`Marker "${releaseMarker}" was not found at ${baseUrl}.`]
    };
  } catch (error) {
    return {
      name: "Deployment marker",
      category: "deployment",
      status: "failed",
      checks: 1,
      passed: 0,
      failed: 1,
      durationMs: Date.now() - began,
      failures: [error.message]
    };
  }
}

async function runSuite(suite) {
  const began = Date.now();
  try {
    const { stdout, stderr } = await execFileAsync(suite.command, suite.args, {
      cwd: root,
      env: {
        ...process.env,
        GTM_QA_BASE_URL: baseUrl,
        GTM_QA_COOKIE: cookie,
        GTM_QA_WRITE_RESULTS: "0"
      },
      maxBuffer: 20 * 1024 * 1024,
      timeout: 6 * 60 * 1000,
      windowsHide: true
    });
    const summary = parsedSummary(stdout);
    const checks = summary.checks || 1;
    const failed = summary.failed || 0;
    return {
      name: suite.name,
      category: suite.category,
      status: failed ? "failed" : "passed",
      checks,
      passed: summary.passed || (failed ? 0 : checks),
      failed,
      durationMs: Date.now() - began,
      failures: summary.failures || [],
      note: String(stderr || "").trim().slice(0, 500)
    };
  } catch (error) {
    const summary = parsedSummary(error.stdout);
    return {
      name: suite.name,
      category: suite.category,
      status: "failed",
      checks: summary.checks || 1,
      passed: summary.passed || 0,
      failed: summary.failed || 1,
      durationMs: Date.now() - began,
      failures: summary.failures?.length
        ? summary.failures
        : [String(error.stderr || error.message || "Suite failed").trim().slice(0, 1000)]
    };
  }
}

function markdownSummary(result) {
  const lines = [
    `# GTM Intelligence OS Release Gate`,
    "",
    `- Status: **${result.status.toUpperCase()}**`,
    `- Environment: ${result.environment}`,
    `- Base URL: ${result.baseUrl}`,
    `- Commit: ${result.commit || "Unknown"}`,
    `- Started: ${result.startedAt}`,
    `- Finished: ${result.finishedAt}`,
    `- Checks: ${result.totals.passed} passed, ${result.totals.failed} failed, ${result.totals.checks} total`,
    "",
    "| Gate | Category | Status | Passed | Failed | Duration |",
    "| --- | --- | --- | ---: | ---: | ---: |",
    ...result.suites.map((suite) => `| ${suite.name} | ${suite.category} | ${suite.status} | ${suite.passed} | ${suite.failed} | ${(suite.durationMs / 1000).toFixed(1)}s |`)
  ];
  const failures = result.suites.flatMap((suite) => (suite.failures || []).map((failure) => `${suite.name}: ${failure}`));
  if (failures.length) {
    lines.push("", "## Blocking Failures", "", ...failures.map((failure) => `- ${failure}`));
  } else {
    lines.push("", "No blocking failures were found.");
  }
  return `${lines.join("\n")}\n`;
}

let commit = "";
try {
  const result = await execFileAsync("git", ["-c", `safe.directory=${root.replace(/\\/g, "/")}`, "rev-parse", "--short", "HEAD"], {
    cwd: root,
    windowsHide: true
  });
  commit = result.stdout.trim();
} catch {
  commit = "";
}

const suites = [await deployedMarkerGate()];
for (const suite of [...syntaxSuites, ...browserSuites]) {
  const result = await runSuite(suite);
  suites.push(result);
  const indicator = result.status === "passed" ? "PASS" : result.status === "skipped" ? "SKIP" : "FAIL";
  console.log(`[${indicator}] ${result.name} (${result.passed}/${result.checks})`);
}

const totals = suites.reduce((sum, suite) => ({
  checks: sum.checks + suite.checks,
  passed: sum.passed + suite.passed,
  failed: sum.failed + suite.failed
}), { checks: 0, passed: 0, failed: 0 });
const result = {
  version: 1,
  status: totals.failed ? "failed" : "passed",
  environment: isLive ? "render" : "local",
  baseUrl,
  releaseMarker: isLive ? releaseMarker : "",
  commit,
  startedAt: startedAt.toISOString(),
  finishedAt: new Date().toISOString(),
  totals,
  suites
};

fs.mkdirSync(archiveDirectory, { recursive: true });
fs.writeFileSync(path.join(archiveDirectory, "release-gate.json"), `${JSON.stringify(result, null, 2)}\n`);
fs.writeFileSync(path.join(archiveDirectory, "RELEASE_SUMMARY.md"), markdownSummary(result));
console.log(`Release gate ${result.status}: ${totals.passed}/${totals.checks} checks passed.`);
console.log(`Results: ${path.relative(root, archiveDirectory)}`);
if (totals.failed) process.exitCode = 1;
