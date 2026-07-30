import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const baseUrl = String(process.env.GTM_QA_BASE_URL || "http://127.0.0.1:8787").replace(/\/$/, "");
const recordId = "qa3-post-saas-clientrenew-20260724";
const mutate = process.env.GTM_QA_MUTATE_BLOCKER === "1";
const recordUrl = `${baseUrl}/api/records/${recordId}`;

const helperSource = fs.readFileSync(path.join(root, "tool", "guided-task-context.js"), "utf8");
const helperContext = vm.createContext({});
vm.runInContext(helperSource, helperContext, { filename: "guided-task-context.js" });
const helper = helperContext.GTM_GUIDED_TASK_CONTEXT;
const resultsSource = fs.readFileSync(path.join(root, "tool", "results.html"), "utf8");

const checks = [];
const check = (name, passed, detail = "") => checks.push({ name, passed: Boolean(passed), ...(detail ? { detail } : {}) });

const initialResponse = await fetch(recordUrl, { cache: "no-store" });
if (!initialResponse.ok) throw new Error(`Could not load ${recordId}: ${initialResponse.status}`);
const initialRecord = (await initialResponse.json()).record;
check("Correct ClientRenew record loaded", /ClientRenew/i.test(initialRecord.name || initialRecord.data?.companyName), initialRecord.name);
check("Blocker lifecycle is isolated from score inputs", !/readiness|score/i.test(helper.resolveToolBlockerState.toString()));
check("Canonical clear deletes the reason instead of saving an empty blocker", /else delete toolSetup\.reasons\[toolId\]/.test(resultsSource));
check("Successful clear recomputes the guided workspace immediately", /clearToolSetupBlockerButton[\s\S]*?const saved = await persistActivePlanData\(data, status\)[\s\S]*?if \(saved\) renderActivePlanWorkspace\(data\)/.test(resultsSource));
check("Readback normalizes impossible blocked-without-reason state", /Waiting\\s\*\\\/\\s\*Blocked[\s\S]*?delete saved\.reasons\[tool\.id\]/.test(resultsSource));

if (mutate) {
  const data = structuredClone(initialRecord.data || {});
  const setup = data.activePlanToolSetupWorkspace && typeof data.activePlanToolSetupWorkspace === "object"
    ? data.activePlanToolSetupWorkspace
    : { statuses: {}, reasons: {} };
  setup.statuses = setup.statuses && typeof setup.statuses === "object" ? setup.statuses : {};
  setup.reasons = setup.reasons && typeof setup.reasons === "object" ? setup.reasons : {};
  data.activePlanToolSetupWorkspace = setup;
  const toolId = "weekly-review-setup";
  const testReason = "QA lifecycle: waiting for the revenue owner to confirm Thursday.";
  const setState = helper.resolveToolBlockerState({
    currentStatus: setup.statuses[toolId],
    reason: testReason
  });
  setup.statuses[toolId] = setState.status;
  setup.reasons[toolId] = setState.reason;

  const save = async (nextData) => {
    const response = await fetch(recordUrl, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: recordId, name: initialRecord.name, data: nextData })
    });
    if (!response.ok) throw new Error(`Could not save ${recordId}: ${response.status}`);
    return (await response.json()).record;
  };
  const reload = async () => {
    const response = await fetch(recordUrl, { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not reload ${recordId}: ${response.status}`);
    return (await response.json()).record;
  };

  await save(data);
  const setReadback = await reload();
  check(
    "Set blocker persists after reload",
    setReadback.data?.activePlanToolSetupWorkspace?.statuses?.[toolId] === "Waiting / Blocked"
      && setReadback.data?.activePlanToolSetupWorkspace?.reasons?.[toolId] === testReason
  );

  const clearState = helper.resolveToolBlockerState({
    currentStatus: setup.statuses[toolId],
    reason: "",
    observedReady: false
  });
  setup.statuses[toolId] = clearState.status;
  delete setup.reasons[toolId];
  await save(data);
  const clearReadback = await reload();
  const clearSetup = clearReadback.data?.activePlanToolSetupWorkspace || {};
  check(
    "Clear blocker persists after reload",
    clearSetup.statuses?.[toolId] === "In progress"
      && !Object.prototype.hasOwnProperty.call(clearSetup.reasons || {}, toolId),
    JSON.stringify({ status: clearSetup.statuses?.[toolId], reasons: clearSetup.reasons })
  );
  check(
    "Clear advances ClientRenew to the correct current task",
    Object.entries(clearSetup.statuses || {}).filter(([, status]) => !["Ready", "Complete", "Skip for now"].includes(status)).length === 1
      && clearSetup.statuses?.[toolId] === "In progress",
    JSON.stringify(clearSetup.statuses)
  );
}

const failed = checks.filter((item) => !item.passed);
console.log(JSON.stringify({
  mutationRun: mutate,
  checks: checks.length,
  passed: checks.length - failed.length,
  failed: failed.length,
  failures: failed
}, null, 2));
if (failed.length) process.exitCode = 1;
