import { readFile } from "node:fs/promises";

const source = await readFile(new URL("../tool/results.html", import.meta.url), "utf8");
const checks = [];
const check = (name, passed) => checks.push({ name, passed });

check(
  "Plan Summary requests decision-only score rendering",
  source.includes('renderScoreBreakdown(model.readinessDiagnostic, readinessPanel.querySelector(".score-breakdown-host"), model, { summaryOnly: true });')
);
check(
  "Summary score rendering exits before readiness tasks are built",
  /if \(options\.summaryOnly\) \{[\s\S]*?container\.innerHTML = `[\s\S]*?Score details and setup work appear only in their own workspaces\.[\s\S]*?return;[\s\S]*?\}\s*let savedChange/.test(source)
);
check(
  "Internal signal migration labels are not part of the score-review summary",
  !/summaryOnly[\s\S]{0,2200}(Saved plan item|Using saved context|Legacy \/ unverified|Choose a sourceable buying signal)/i.test(source)
);
check(
  "Score-review summary does not render score-changing controls",
  !/summaryOnly[\s\S]{0,2200}data-score-field/i.test(source)
);
check(
  "Shared guided inputs use plain help instead of internal scaffolding labels",
  /<p class="guided-input-help">\$\{escapeHtml\(answer\)\}<\/p>[\s\S]*?Optional\. Leave this blank to continue\./.test(source)
    && !/<strong>Applies to:<\/strong>[\s\S]{0,700}<strong>Readiness effect:<\/strong>/.test(source)
);
check(
  "Shared guided tasks do not disclose saved-field implementation context",
  !/<strong>Saved plan item:<\/strong>[\s\S]{0,700}<strong>Using saved context:<\/strong>/.test(source)
);
check(
  "Task workspaces reserve clearance for stacked sticky navigation",
  source.includes("html { scroll-padding-top: 250px; }")
    && source.includes(".workspace-section { scroll-margin-top: 250px; }")
);
check(
  "Task workspace hash links realign after the return bar renders",
  source.includes("The browser resolves a hash before this sticky return bar exists.")
    && source.includes("window.scrollTo({ top: Math.max(0, top), behavior: \"auto\" });")
);
check(
  "Setup prerequisites have one Finish setup launcher",
  source.includes('const currentWorkLabel = setupNavigation.current ? "Finish setup" : "This Week";')
    && source.includes('label: currentWorkLabel')
    && source.includes('Use ${escapeHtml(currentWorkLabel)} above to open the one current task.')
    && !/summary-readiness-details[\s\S]{0,1000}data-readiness-target/.test(source)
);

const failed = checks.filter((item) => !item.passed);
console.log(JSON.stringify({ checks: checks.length, passed: checks.length - failed.length, failed: failed.length, checks }, null, 2));
if (failed.length) process.exitCode = 1;
