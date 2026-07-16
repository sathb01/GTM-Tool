import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const root = path.resolve(import.meta.dirname, "..");
const apiBase = "http://127.0.0.1:8787";
const sourceRecords = JSON.parse(fs.readFileSync(path.join(root, "server/data/records.json"), "utf8"));
const taxonomySource = fs.readFileSync(path.join(root, "tool/gtm-taxonomy.js"), "utf8");
const schemaSource = fs.readFileSync(path.join(root, "tool/intake-schema.js"), "utf8");
const context = vm.createContext({ window: {} });
vm.runInContext(taxonomySource, context, { filename: "gtm-taxonomy.js" });
vm.runInContext(schemaSource, context, { filename: "intake-schema.js" });
const schema = context.window.GTM_INTAKE_SCHEMA;

const sourceIds = [
  "qa-pre-dtc-pawpath-20260712",
  "qa-post-b2b-forgeline-20260712",
  "qa-pre-retail-brightnest-20260712",
  "qa-post-saas-relaymetrics-20260712"
];

const slug = (value) => String(value || "")
  .trim().toLowerCase().replace(/&/g, " and ").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const filled = (value) => String(value ?? "").trim() !== "";
const valuesFrom = (value) => Array.isArray(value) ? value : [];

function visibleByCondition(definition, data) {
  const condition = definition?.showWhen;
  if (!condition) return true;
  const actual = String(data[condition.field] || "");
  if (Array.isArray(condition.values)) return condition.values.includes(actual);
  if (Object.prototype.hasOwnProperty.call(condition, "value")) return actual === String(condition.value);
  return true;
}

function usefulOptions(definition, rowId = "") {
  const rowOptions = definition.optionsByRow?.[rowId];
  const options = valuesFrom(rowOptions || definition.options)
    .map((item) => typeof item === "string" ? item : item?.value || item?.label || "")
    .filter((item) => item && !/^(other|not sure|not sure yet|unknown|select one|use recommendation as written)$/i.test(item));
  return [...new Set(options)];
}

function scenarioAnswer(definition, company, rowLabel = "") {
  const label = `${definition.label || definition.title || definition.id || "field"} ${rowLabel}`.toLowerCase();
  const options = usefulOptions(definition, slug(rowLabel));
  if (definition.type === "scoreSelect") return "4";
  if (definition.type === "checkbox") return "Yes";
  if (definition.type === "date") return "2026-08-15";
  if (definition.type === "money" || definition.type === "number") return "1000";
  if (["select", "radio"].includes(definition.type) && options.length) return options[0];
  if (["multiSelectDropdown", "multiSelect", "checkboxGroup"].includes(definition.type) && options.length) return options.slice(0, 2).join("; ");
  if (/owner|prepared by|responsible/.test(label)) return company.owner;
  if (/tool|system|crm|tracking location/.test(label)) return "QA CRM and spreadsheet";
  if (/website|url/.test(label)) return company.website;
  if (/email/.test(label)) return `qa+${company.slug}@example.invalid`;
  if (/phone/.test(label)) return "555-0100";
  if (/customer|segment|account|target/.test(label)) return company.customer;
  if (/buyer|decision maker|economic/.test(label)) return company.buyer;
  if (/offer|product|solution|service/.test(label)) return company.offer;
  if (/problem|pain|constraint|risk|gap/.test(label)) return company.problem;
  if (/trigger|timing|why now|urgent/.test(label)) return `A time-bound need makes ${company.problem.toLowerCase()} a current priority.`;
  if (/must.have|fit signal|qualification|criteria/.test(label)) return `${company.customer}; confirmed need; reachable ${company.buyer.toLowerCase()}.`;
  if (/caution|negative|disqualif|avoid|exclude/.test(label)) return `Do not prioritize targets that do not recognize this problem or cannot take the proposed next step.`;
  if (/outcome|success|result|value|impact/.test(label)) return company.outcome;
  if (/channel|source|reach/.test(label)) return company.channel;
  if (/motion|sales process/.test(label)) return company.motion;
  if (/proof|evidence|confidence/.test(label)) return company.evidence;
  if (/next action|next step|follow.up|cta/.test(label)) return company.nextStep;
  if (/activity|task|work/.test(label)) return `Run focused outreach, buyer conversations, and evidence review for ${company.customer}.`;
  if (/message|position|angle|claim/.test(label)) return `${company.offer} helps ${company.customer.toLowerCase()} ${company.outcome.toLowerCase()}.`;
  if (/stage|status/.test(label)) return "In progress and reviewed weekly.";
  if (/cost|spend|budget|price|revenue|deal size|value/.test(label)) return "1000";
  if (/date|cadence|review/.test(label)) return "Weekly review on Friday with the GTM owner.";
  if (/notes|why|describe|explain|detail|summary|statement/.test(label)) return `${company.name}: ${company.customer}. ${company.problem}. ${company.outcome}.`;
  return `${company.customer}. ${company.problem}. ${company.nextStep}.`;
}

function setField(data, definition, company, key = definition.id, rowLabel = "") {
  if (!key || !visibleByCondition(definition, data) || filled(data[key])) return;
  const options = usefulOptions(definition, slug(rowLabel));
  if (definition.type === "repeatableList") {
    data[`${key}__item-1`] = scenarioAnswer({ ...definition, type: "text" }, company, rowLabel);
    return;
  }
  data[key] = scenarioAnswer(definition, company, rowLabel);
  if (data[key] === "Other" && definition.requireOther) data[`${key}__other`] = `${company.name} defined alternative`;
  if (["multiSelectDropdown", "multiSelect", "checkboxGroup"].includes(definition.type) && options.length > 1) {
    data[key] = options.slice(0, 2).join("; ");
  }
}

function tableRows(table, data) {
  if (Array.isArray(table.rows)) {
    return table.rows.map((row) => typeof row === "string" ? { id: slug(row), label: row } : row);
  }
  const existing = Object.keys(data)
    .filter((key) => key.startsWith(`${table.id}__`))
    .map((key) => key.split("__")[1])
    .filter(Boolean);
  const unique = [...new Set(existing)];
  if (unique.length) return unique.map((id) => ({ id, label: id }));
  const count = Math.max(1, Number(table.minRows) || 1);
  return Array.from({ length: count }, (_, index) => ({ id: `${slug(table.rowLabel || "row")}-${index + 1}`, label: `${table.rowLabel || "Row"} ${index + 1}` }));
}

function populateTable(table, data, company) {
  if (!table?.id || !Array.isArray(table.columns) || !visibleByCondition(table, data)) return;
  tableRows(table, data).forEach((row) => {
    table.columns.forEach((column) => {
      const type = column.typeByRow?.[row.id] || column.type;
      const definition = { ...column, type, options: column.optionsByRow?.[row.id] || column.options };
      setField(data, definition, company, `${table.id}__${row.id}__${column.id}`, row.label);
    });
  });
}

function walk(node, data, company, seen = new Set()) {
  if (!node || typeof node !== "object" || seen.has(node)) return;
  seen.add(node);
  if (node.id && node.type && !node.columns) setField(data, node, company);
  if (node.id && Array.isArray(node.columns)) populateTable(node, data, company);
  Object.entries(node).forEach(([key, value]) => {
    if (["legacyFields", "legacyTables", "options", "optionsByRow", "rows", "columns"].includes(key)) return;
    if (Array.isArray(value)) value.forEach((item) => walk(item, data, company, seen));
    else walk(value, data, company, seen);
  });
}

function expectedKeys(node, data, keys = new Set(), seen = new Set()) {
  if (!node || typeof node !== "object" || seen.has(node)) return keys;
  seen.add(node);
  if (node.id && node.type && !node.columns && visibleByCondition(node, data)) {
    keys.add(node.type === "repeatableList" ? `${node.id}__item-1` : node.id);
  }
  if (node.id && Array.isArray(node.columns) && visibleByCondition(node, data)) {
    tableRows(node, data).forEach((row) => node.columns.forEach((column) => {
      if (visibleByCondition(column, data)) keys.add(`${node.id}__${row.id}__${column.id}`);
    }));
  }
  Object.entries(node).forEach(([key, value]) => {
    if (["legacyFields", "legacyTables", "options", "optionsByRow", "rows", "columns"].includes(key)) return;
    if (Array.isArray(value)) value.forEach((item) => expectedKeys(item, data, keys, seen));
    else expectedKeys(value, data, keys, seen);
  });
  return keys;
}

function workspaceData(company, isPreRevenue) {
  const now = new Date().toISOString();
  const target = { id: "target-1", name: company.buyer, profile: company.customer, source: company.channel, contact: `qa+${company.slug}@example.invalid`, fitTier: "Tier A", fitReason: company.evidence, personaId: "primary", messageId: "message-1", status: "Meaningful next step", owner: company.owner, lastTouch: "2026-07-14", nextAction: company.nextStep, dueDate: "2026-07-21", notes: company.evidence };
  const message = { id: "message-1", version: 1, name: `${company.buyer} outreach - v1`, personaId: "primary", personaRole: company.buyer, channel: company.channel, objective: "Start a conversation", status: "Active test", subject: `A question about ${company.problem.split(" ").slice(0, 5).join(" ")}`, opening: `I am speaking with ${company.customer}.`, body: `${company.problem} We are testing whether ${company.offer} can ${company.outcome.toLowerCase()}.`, cta: company.nextStep, attempts: 10, replies: 4, conversations: 3, nextSteps: 1, learning: company.evidence, decision: "Continue", interactions: [{ id: "interaction-1", targetId: "target-1", date: "2026-07-14", channel: company.channel, result: "Meaningful next step", response: company.problem, learning: company.evidence, nextAction: company.nextStep }] };
  const proof = { id: "proof-1", version: 1, name: `${company.name} evidence brief`, title: `${company.offer} evidence brief`, type: isPreRevenue ? "Interview evidence summary" : "Case study", status: "Ready to use", strength: "Medium", source: company.evidence, permission: "Approved for synthetic QA", claim: company.outcome, audience: company.buyer, problem: company.problem, result: company.outcome, nextStep: company.nextStep, uses: [{ id: "proof-use-1", date: "2026-07-14", targetId: "target-1", result: "Meaningful next step", learning: company.evidence }] };
  const sequence = { id: "sequence-1", version: 1, name: `${company.channel} sequence - v1`, channel: company.channel, personaId: "primary", status: "Active", steps: [{ id: "step-1", day: 0, action: "Send the approved message.", messageId: "message-1", proofId: "proof-1", status: "Complete" }, { id: "step-2", day: 3, action: "Follow up with one useful question.", messageId: "message-1", proofId: "", status: "Ready" }], assignments: [{ id: "assignment-1", targetId: "target-1", owner: company.owner, startDate: "2026-07-14", currentStep: "Step 2", status: "Meaningful next step", nextAction: company.nextStep, dueDate: "2026-07-21" }], stopRules: ["Stop when the target is not a fit.", "Pause automation when a real conversation begins."], createdAt: now, updatedAt: now };
  const opportunity = { id: "opportunity-1", targetId: "target-1", name: `${company.name} QA opportunity`, buyer: company.buyer, stage: "Qualified conversation", value: isPreRevenue ? "500" : "25000", source: company.channel, owner: company.owner, nextAction: company.nextStep, dueDate: "2026-07-21", crmId: `QA-${company.slug.toUpperCase()}-001`, crmUrl: `https://example.invalid/crm/${company.slug}`, crmStatus: "CRM updated", learning: company.evidence, updatedAt: now };
  return {
    messagingKitWorkspace: { version: 1, drafts: [message], selectedDraftId: message.id, selectedPersonaId: "primary", selectedChannel: company.channel, selectedObjective: "Start a conversation", updatedAt: now },
    targetListWorkspace: { version: 1, targets: [target], updatedAt: now },
    proofAssetWorkspace: { version: 1, drafts: [proof], selectedDraftId: proof.id, updatedAt: now },
    outreachSequenceWorkspace: { version: 1, sequences: [sequence], selectedSequenceId: sequence.id, updatedAt: now },
    pipelineOpportunityWorkspace: { version: 1, sourceOfTruth: "CRM is the source of truth", crmName: "QA CRM", reviewCadence: "Weekly", opportunities: [opportunity], updatedAt: now },
    weeklyReviewWorkspace: { version: 1, reviews: [{ id: "weekly-review-1", date: "2026-07-14", decision: "Continue", rationale: company.evidence, actions: [{ action: company.nextStep, owner: company.owner, dueDate: "2026-07-21", status: "In progress" }], metrics: { targets: 1, attempts: 10, replies: 4, conversations: 3, nextSteps: 1, proofUses: 1, openOpportunities: 1, pipelineValue: isPreRevenue ? 500 : 25000 } }], updatedAt: now },
    activePlanWorkspace: { version: 1, status: "In progress", owner: company.owner, evidence: company.evidence, decision: "Continue", nextStep: company.nextStep, updatedAt: now },
    ...(isPreRevenue ? { validationWorkspace: { version: 1, targets: [target], interviews: [{ id: "interview-1", targetId: target.id, date: "2026-07-14", status: "Complete", evidence: company.evidence, nextStep: company.nextStep }], decision: "Continue", updatedAt: now } } : {})
  };
}

const profiles = {
  "qa-pre-dtc-pawpath-20260712": { slug: "pawpath-full", owner: "Founder", customer: "Urban dog owners who walk before sunrise or after dark at least four times per week", buyer: "End consumer and product user", offer: "NightWalk illuminated dog harness", problem: "Current visibility products do not solve low-light dog-walking safety well", outcome: "Improve visibility and confidence during low-light walks", channel: "Customer or user interviews", motion: "Founder-led DTC validation", evidence: "Eight interviews and four prototype reactions support the problem hypothesis", nextStep: "Schedule a product and price feedback interview" },
  "qa-pre-retail-brightnest-20260712": { slug: "brightnest-full", owner: "Founder", customer: "Independent natural-home and zero-waste retailers with one to five locations", buyer: "Independent retail buyer", offer: "BrightNest cleaning concentrate starter kit", problem: "Retailers need differentiated products with credible margin and sell-through potential", outcome: "Validate retailer margin, opening-order interest, and sell-through confidence", channel: "Retail buyer outreach and trade shows", motion: "Founder-led retail validation", evidence: "Retail buyer conversations and sample feedback support the retail-first hypothesis", nextStep: "Schedule a sample and opening-order review" },
  "qa-post-b2b-forgeline-20260712": { slug: "forgeline-full", owner: "Revenue Operations Manager", customer: "Specialty manufacturers with 75-400 employees and urgent throughput constraints", buyer: "COO", offer: "90-Day Throughput Improvement Program", problem: "Backlog and operating bottlenecks reduce throughput, delivery reliability, and margin", outcome: "Increase throughput and contribution margin within 90 days", channel: "Network referrals", motion: "Referral-led consultative selling", evidence: "Seven comparable programs improved throughput by 10-22 percent", nextStep: "Schedule a 45-minute throughput diagnostic" },
  "qa-post-saas-relaymetrics-20260712": { slug: "relaymetrics-full", owner: "Head of Sales", customer: "B2B professional-services firms with 20-75 employees and no dedicated RevOps team", buyer: "Founder or owner", offer: "RelayMetrics Forecast Workspace", problem: "Leaders cannot trust weekly forecasts because pipeline stages and updates are inconsistent", outcome: "Create a trustworthy weekly forecast without rebuilding the CRM workflow", channel: "Direct outbound email", motion: "Inside-sales professional-services forecast test", evidence: "Retained wins and controlled outreach convert better in professional services than the assumed SaaS segment", nextStep: "Schedule a forecast-health review" }
};

const created = [];
for (const sourceId of sourceIds) {
  const source = sourceRecords.find((item) => item.id === sourceId);
  if (!source) throw new Error(`Missing source record ${sourceId}`);
  const company = { ...profiles[sourceId], name: source.name.replace(/^QA - /, "QA Full - "), website: source.data.website || `https://example.invalid/${profiles[sourceId].slug}` };
  const isPreRevenue = source.data.toolMode === "Pre-Revenue Validation" || /pre.?revenue/i.test(source.data.companyStage || "");
  const data = structuredClone(source.data);
  data.companyName = company.name;
  data.website = company.website;
  data.toolMode = isPreRevenue ? "Pre-Revenue Validation" : (data.toolMode || "GTM Readiness");
  data.reviewMode = isPreRevenue ? "preRevenue" : "detailed";
  const sections = schema.sections.filter((section) => !section.hidden && !section.deprecated && (isPreRevenue ? section.id === "company" || section.preRevenue : !section.preRevenue));
  sections.forEach((section) => walk(section, data, company));
  // A second pass fills fields revealed by choices made during the first pass.
  sections.forEach((section) => walk(section, data, company, new Set()));
  Object.assign(data, workspaceData(company, isPreRevenue));
  data.savedAt = new Date().toISOString();
  const record = { id: `${sourceId}-full-20260714`, name: company.name, data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() };
  const response = await fetch(`${apiBase}/api/records/${encodeURIComponent(record.id)}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(record) });
  if (!response.ok) throw new Error(`Could not save ${record.name}: ${response.status} ${await response.text()}`);
  const saved = (await response.json()).record;
  const reloadedResponse = await fetch(`${apiBase}/api/records/${encodeURIComponent(record.id)}`);
  if (!reloadedResponse.ok) throw new Error(`Could not reload ${record.name}`);
  const reloaded = (await reloadedResponse.json()).record;
  if (JSON.stringify(saved.data) !== JSON.stringify(reloaded.data)) throw new Error(`${record.name} changed during API save and reload`);
  const expected = new Set();
  sections.forEach((section) => expectedKeys(section, reloaded.data, expected, new Set()));
  const blankApplicableFields = [...expected].filter((key) => !filled(reloaded.data[key]));
  if (blankApplicableFields.length) throw new Error(`${record.name} has ${blankApplicableFields.length} blank applicable fields: ${blankApplicableFields.slice(0, 20).join(", ")}`);
  created.push({ id: record.id, name: record.name, isPreRevenue, fieldCount: Object.keys(reloaded.data).length, applicableFieldCount: expected.size, blankApplicableFields: blankApplicableFields.length, sections: sections.map((section) => section.id) });
}

console.log(JSON.stringify(created, null, 2));
