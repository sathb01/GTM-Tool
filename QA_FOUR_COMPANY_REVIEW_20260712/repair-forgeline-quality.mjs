import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(import.meta.dirname, "..");
const recordId = "qa-post-b2b-forgeline-20260712-full-20260714";
const filePath = path.join(root, "server", "data", "records.json");

const roleAnswers = {
  "executive-sponsor": {
    titles: "COO; President; VP Operations",
    belief: "The throughput constraint is material, the 90-day program can improve it without a major capital project, and the operating team can sustain the new cadence.",
    question: "Which throughput constraint has the largest effect on delivery, margin, or growth, and what would make a 90-day intervention worth sponsoring?",
    objection: "May view the constraint as a plant-management issue or question whether an outside program will produce durable operating change.",
    message: "Improve throughput and delivery reliability in 90 days by focusing the operating team on the highest-value constraint before considering added facilities or headcount."
  },
  champion: {
    titles: "Plant Manager; Director of Operations; Continuous Improvement Leader",
    belief: "The program will help the plant solve a visible constraint, produce an executive-supported win, and avoid adding reporting work that does not improve output.",
    question: "Where does work currently stall, how is that constraint managed today, and what support would help the team improve it?",
    objection: "May support the objective but worry that the program adds meetings, exposes performance problems, or lacks executive backing.",
    message: "Give the plant team a practical weekly cadence for resolving the constraint that is disrupting schedules, output, and delivery commitments."
  },
  "day-to-day-user": {
    titles: "Production Manager; Operations Manager; Production Planner; Frontline Supervisor",
    belief: "The weekly process will make priorities clearer, reduce firefighting, and help the team resolve bottlenecks rather than create another reporting burden.",
    question: "What causes the most schedule disruption during a normal week, and what information or decisions are missing when the team responds?",
    objection: "May expect another short-lived improvement initiative that creates extra tracking without removing daily obstacles.",
    message: "Reduce weekly firefighting by making the current production constraint, owner, next action, and result visible to the people doing the work."
  },
  "technical-security-reviewer": {
    titles: "IT Manager; Systems Manager; Data Security Lead",
    belief: "The program can use approved operating data with limited access and does not require risky integrations or uncontrolled data sharing.",
    question: "Which operating data can be shared, what access restrictions apply, and which systems or security reviews must be considered?",
    objection: "May delay the work if data access, system permissions, or handling requirements are unclear.",
    message: "Run the throughput program with a defined data set, approved access, and no unnecessary system integration."
  },
  "procurement-finance": {
    titles: "CFO; Finance Director; Procurement Manager",
    belief: "The expected margin or capacity gain justifies the fee, commercial terms are clear, and the result can be measured against an agreed baseline.",
    question: "What financial threshold would justify the program, and which baseline should be used to measure throughput or margin improvement?",
    objection: "May require a quantified business case, clearer commercial terms, or stronger evidence that gains will exceed program cost.",
    message: "Tie the 90-day program to an agreed throughput and contribution-margin baseline so the financial return can be reviewed before expansion."
  },
  legal: {
    titles: "General Counsel; Corporate Counsel; Contract Manager",
    belief: "The scope, confidentiality, data use, liability, and ownership terms are proportionate to a focused advisory engagement.",
    question: "Which contracting, confidentiality, data-use, or site-access terms require review before work can begin?",
    objection: "May pause contracting if the scope, data handling, site access, or liability terms are broader than the engagement requires.",
    message: "Use a focused statement of work with clear confidentiality, data-use, site-access, and deliverable terms."
  },
  operations: {
    titles: "VP Operations; Plant Manager; Director of Manufacturing",
    belief: "The method fits the operating environment, the team can provide the required data and time, and changes can be implemented without destabilizing production.",
    question: "Which plant, line, or process should be assessed first, and what operational constraints could prevent the team from acting on findings?",
    objection: "May resist an approach that is too theoretical, interrupts production, or ignores existing improvement work.",
    message: "Focus the first 90 days on one measurable plant constraint and integrate the work into the existing operating rhythm."
  },
  "external-advisor-consultant": {
    titles: "Operating Advisor; Manufacturing Consultant; Private Equity Operating Partner",
    belief: "The program complements existing advisors, uses a credible method, and gives leadership an objective way to prioritize the operating constraint.",
    question: "What improvement work is already underway, and where would an independent throughput assessment add value rather than duplicate it?",
    objection: "May view the program as duplicative or may protect an existing methodology or advisory relationship.",
    message: "Add a focused throughput diagnostic that complements existing improvement work and creates a shared 90-day operating priority."
  },
  "board-investor": {
    titles: "Board Director; Operating Partner; Lead Investor",
    belief: "The program addresses a material growth or margin constraint, management owns the work, and progress can be monitored through a small set of operating measures.",
    question: "Which operating constraint most threatens the value-creation plan, and what evidence would show management is resolving it?",
    objection: "May question whether the initiative is material enough, sufficiently owned by management, or connected to the value-creation plan.",
    message: "Connect one 90-day throughput priority to the value-creation plan, with management ownership and measurable weekly evidence."
  },
  "likely-blocker": {
    titles: "Plant Manager; Functional Leader; Improvement Program Owner",
    belief: "The work respects current priorities, uses the team's knowledge, and will not displace ownership or create an unrealistic implementation burden.",
    question: "What would make this program difficult to support, and what would need to be true for it to help rather than disrupt the team?",
    objection: "May fear loss of control, criticism of current performance, competing priorities, or additional work for an already constrained team.",
    message: "Start with the team's operating reality, agree on one constraint together, and keep ownership of implementation with the people running the plant."
  }
};

export function repairedForgeLineData(data) {
  const updates = {
    bestFitSizeScaleRange: "75-400 employees, typically with a complex production environment, meaningful backlog, or limited ability to add capacity through facilities or headcount.",
    "bestFitImplementationRequirements__item-1": "Executive sponsor, plant-level owner, access to baseline throughput and schedule data, and protected weekly time for the operating review.",
    "constraintLevels__delivery-implementation__why": "Delivery capacity is constrained because the engagement requires an executive sponsor and a plant team that can participate in weekly analysis and implementation.",
    "topBlockers__blocker-1__blocker": "The plant team lacks protected time and clear ownership for implementing constraint-management changes.",
    "topBlockers__blocker-1__whyItMatters": "Without an accountable plant owner and weekly working time, recommendations may be understood but not implemented or measured.",
    "topBlockers__blocker-1__mustBeTrue": "A plant leader owns the work, the operating team protects a weekly review, and baseline throughput data is available.",
    "expansionOpportunities__expansion-opportunity-1__opportunity": "Expand from the first validated plant or production line to additional facilities after the initial 90-day program produces a measurable result.",
    "opportunitySnapshot__total-open-opportunities__answer": "6",
    "opportunitySnapshot__qualified-opportunities__answer": "4",
    "opportunitySnapshot__opportunities-likely-to-close-in-30-days__answer": "1",
    "opportunitySnapshot__opportunities-likely-to-close-in-90-days__answer": "3",
    "opportunitySnapshot__average-sales-cycle__answer": "45-75 days",
    "opportunitySnapshot__discovery-to-demo-rate__answer": "60%",
    "opportunitySnapshot__demo-to-proposal-rate__answer": "50%",
    "opportunitySnapshot__proposal-to-close-rate__answer": "35%",
    "opportunitySnapshot__most-common-next-step-failure-point__answer": "The executive sponsor is not engaged before the proposal, so the operational problem does not become a funded priority."
  };
  Object.entries(roleAnswers).forEach(([role, answers]) => {
    updates[`buyerRoleCards__${role}__commonTitles`] = answers.titles;
    updates[`buyerRoleCards__${role}__needsToBelieve`] = answers.belief;
    updates[`buyerRoleCards__${role}__discoveryQuestions`] = answers.question;
    updates[`buyerRoleCards__${role}__objectionDetail`] = answers.objection;
    updates[`buyerRoleCards__${role}__message`] = answers.message;
  });
  ["executive-sponsor", "champion", "day-to-day-user", "procurement-finance", "likely-blocker"].forEach((role) => {
    updates[`personaPriority__${role}__why`] = roleAnswers[role].belief;
  });
  return { ...data, ...updates, savedAt: new Date().toISOString() };
}

async function remoteSession(baseUrl, password) {
  const login = await fetch(`${baseUrl}/login`, {
    method: "POST",
    redirect: "manual",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ password })
  });
  const cookie = String(login.headers.get("set-cookie") || "").split(";")[0];
  if (!cookie) throw new Error("Could not authenticate to the deployed QA workspace.");
  return cookie;
}

async function repairRemote(baseUrl, password) {
  const cookie = await remoteSession(baseUrl, password);
  const response = await fetch(`${baseUrl}/api/records/${encodeURIComponent(recordId)}`, { headers: { Cookie: cookie } });
  if (!response.ok) throw new Error(`Could not load deployed ForgeLine record: ${response.status}`);
  const payload = await response.json();
  const record = payload.record;
  record.data = repairedForgeLineData(record.data);
  record.updatedAt = new Date().toISOString();
  const saved = await fetch(`${baseUrl}/api/records/${encodeURIComponent(recordId)}`, {
    method: "PUT",
    headers: { Cookie: cookie, "Content-Type": "application/json" },
    body: JSON.stringify(record)
  });
  if (!saved.ok) throw new Error(`Could not save deployed ForgeLine record: ${saved.status}`);
  console.log("Repaired the deployed ForgeLine QA record.");
}

function repairLocal() {
  const records = JSON.parse(fs.readFileSync(filePath, "utf8"));
  const record = records.find((candidate) => candidate.id === recordId);
  if (!record) throw new Error(`Missing local record ${recordId}`);
  record.data = repairedForgeLineData(record.data);
  record.updatedAt = new Date().toISOString();
  fs.writeFileSync(filePath, `${JSON.stringify(records, null, 2)}\n`, "utf8");
  console.log("Repaired the local ForgeLine QA record.");
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const remoteUrl = String(process.env.GTM_QA_URL || "").replace(/\/$/, "");
  const password = process.env.GTM_QA_PASSWORD || "";
  if (remoteUrl) {
    if (!password) throw new Error("GTM_QA_PASSWORD is required for a remote repair.");
    await repairRemote(remoteUrl, password);
  } else {
    repairLocal();
  }
}
