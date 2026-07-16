import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const { chromium } = require("C:/Users/sathb/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/.pnpm/playwright@1.60.0/node_modules/playwright");
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe"
});
const page = await browser.newPage();

await page.goto("http://127.0.0.1:8787/index.html", { waitUntil: "networkidle" });

const result = await page.evaluate(() => {
  const clean = dataQualityIssues({
    companyName: "Clean Company",
    bestFitCustomerGroup: "Specialty retailers",
    primaryRevenueMotion: "motion-1",
    "revenueMotionPortfolio__motion-1__motionName": "Founder-led outbound"
  });
  const dirty = dataQualityIssues({
    companyName: "Dirty Company",
    bestFitCustomerGroup: "Other",
    buyerBelief: "AI recommendation",
    primaryRevenueMotion: "motion-1",
    quickCurrentSalesMotion: "motion-2",
    "proofCandidates__proof-1__customerName": "Mission Belt",
    "proofCandidates__proof-2__customerName": "Mission Belt Co"
  });
  const duplicate = dirty.find((issue) => issue.title === "Confirm a possible duplicate");
  const keptSeparate = dataQualityIssues({
    "proofCandidates__proof-1__customerName": "Mission Belt",
    "proofCandidates__proof-2__customerName": "Mission Belt Co",
    dataHygieneDistinctPairs: JSON.stringify([duplicate?.pairId])
  });
  const standardized = {
    exact: structuredReferenceValue("Mission Belt Co", duplicate?.labels || [], "Mission Belt"),
    list: structuredReferenceValue("Mission Belt Co; Another Customer", duplicate?.labels || [], "Mission Belt"),
    narrative: structuredReferenceValue("Mission Belt Co shared a useful story", duplicate?.labels || [], "Mission Belt")
  };
  const goalConflict = dataQualityIssues({
    quick90DayGoal: "Lead flow",
    goal90: "Revenue"
  });
  const targetConflict = dataQualityIssues({
    quick90DayGoal: "Revenue",
    goal90: "Revenue",
    quick90DayRevenueTarget: "$100,000",
    goal90RevenueTarget: "$250,000"
  });
  const cleanAliases = dataQualityIssues({
    quick90DayGoal: "Category awareness",
    goal90: "Awareness"
  });
  const ambiguousDifferences = dataQualityIssues({
    quick90DayGoal: "Customer validation",
    goal90: "Revenue",
    primaryBuyerForOffer: "Founder",
    bestFitDecisionMaker: "COO",
    primaryRevenueMotion: "motion-1",
    quickCurrentSalesMotion: "Founder-led"
  });
  const acceptedConflict = dataQualityIssues({
    quick90DayGoal: "Lead flow",
    goal90: "Revenue",
    dataHygieneAcceptedConflicts: JSON.stringify(["90-day-goal"])
  });
  const planBaseline = {
    companyName: "Plan Baseline Company",
    quick90DayGoal: "Lead flow",
    "possibleCustomerGroups__customer-group-1__groupName": "Specialty retailers"
  };
  const planSignature = intakePlanSignature(planBaseline);
  const staleWarning = {
    unchanged: updatePlanStaleWarning({ ...planBaseline, lastPlanInputSignature: planSignature }),
    changed: updatePlanStaleWarning({ ...planBaseline, quick90DayGoal: "Revenue", lastPlanInputSignature: planSignature }),
    assetOnly: updatePlanStaleWarning({ ...planBaseline, activePlan__weeklyReview__learning: "New learning", lastPlanInputSignature: planSignature }),
    ignoresSavedAt: intakePlanSignature({ ...planBaseline, savedAt: "2099-01-01T00:00:00.000Z" }) === planSignature
  };

  showDataQualityReview(dirty, "detailed", "");
  const duplicatePanel = {
    panelVisible: !document.getElementById("dataQualityReview").hidden,
    panelHeading: document.querySelector("#dataQualityReview h2")?.textContent || "",
    issueCount: document.querySelectorAll("#dataQualityReview .data-quality-item").length,
    preferredNames: Array.from(document.querySelectorAll("#dataQualityReview .data-quality-resolution select option")).map((option) => option.value),
    usageCount: document.querySelectorAll("#dataQualityReview .data-quality-resolution li").length,
    actionLabels: Array.from(document.querySelectorAll("#dataQualityReview .data-quality-resolution button")).map((button) => button.textContent.trim()),
    bypassAvailable: Array.from(document.querySelectorAll("#dataQualityReview button"))
      .some((button) => button.textContent.trim() === "Generate Anyway")
  };
  showDataQualityReview(goalConflict, "detailed", "");
  return {
    clean,
    dirty,
    duplicatePanel,
    keptSeparate,
    standardized,
    goalConflict,
    targetConflict,
    cleanAliases,
    ambiguousDifferences,
    acceptedConflict,
    staleWarning,
    conflictPanel: {
      sources: Array.from(document.querySelectorAll("#dataQualityReview .data-quality-conflict-choices span")).map((item) => item.textContent.trim()),
      actionLabels: Array.from(document.querySelectorAll("#dataQualityReview .data-quality-resolution button")).map((button) => button.textContent.trim()),
      bypassAvailable: Array.from(document.querySelectorAll("#dataQualityReview button"))
        .some((button) => button.textContent.trim() === "Generate Anyway")
    }
  };
});

await browser.close();

const titles = result.dirty.map((issue) => issue.title);
const passed = result.clean.length === 0
  && titles.includes("Define the Other selection")
  && titles.includes("Replace placeholder text")
  && titles.includes("Replace an internal record label")
  && titles.includes("Confirm a possible duplicate")
  && result.duplicatePanel.panelVisible
  && result.duplicatePanel.panelHeading === "Review Data Quality Before Generating"
  && result.duplicatePanel.issueCount === result.dirty.length
  && result.duplicatePanel.preferredNames.length === 2
  && result.duplicatePanel.usageCount === 2
  && result.duplicatePanel.actionLabels.includes("Use This Name Everywhere")
  && result.duplicatePanel.actionLabels.includes("Keep as Separate Entries")
  && result.keptSeparate.length === 0
  && result.standardized.exact === "Mission Belt"
  && result.standardized.list === "Mission Belt; Another Customer"
  && result.standardized.narrative === "Mission Belt Co shared a useful story"
  && !result.duplicatePanel.bypassAvailable
  && result.goalConflict.length === 1
  && result.goalConflict[0].conflictId === "90-day-goal"
  && result.targetConflict.length === 1
  && result.targetConflict[0].conflictId === "90-day-revenue-target"
  && result.cleanAliases.length === 0
  && result.ambiguousDifferences.length === 0
  && result.acceptedConflict.length === 0
  && result.staleWarning.unchanged === false
  && result.staleWarning.changed === true
  && result.staleWarning.assetOnly === false
  && result.staleWarning.ignoresSavedAt
  && result.conflictPanel.sources.length === 2
  && result.conflictPanel.actionLabels.includes("Keep Both as Intentional")
  && result.conflictPanel.bypassAvailable;

console.log(JSON.stringify({ passed, ...result }, null, 2));
if (!passed) {
  process.exitCode = 1;
}
