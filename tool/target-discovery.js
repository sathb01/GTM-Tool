(function (root) {
  function clean(value) {
    return String(value || "").trim().replace(/\s+/g, " ");
  }

  function list(value) {
    if (Array.isArray(value)) return value.map(clean).filter(Boolean);
    return String(value || "")
      .split(/\s*(?:;|\n)\s*/)
      .map(clean)
      .filter(Boolean);
  }

  function unique(values) {
    return Array.from(new Set(values.map(clean).filter(Boolean)));
  }

  function parseEmployeeRange(text) {
    const value = clean(text);
    const range = value.match(/(\d{1,5})\s*(?:to|-|–|—)\s*(\d{1,5})\s+employees?/i);
    if (range) return { employeeMin: Number(range[1]), employeeMax: Number(range[2]) };
    const minimum = value.match(/(?:at least|more than|over)\s+(\d{1,5})\s+employees?/i);
    if (minimum) return { employeeMin: Number(minimum[1]), employeeMax: "" };
    return { employeeMin: "", employeeMax: "" };
  }

  function deriveSearchVariables(context = {}) {
    const icp = clean(context.icp);
    const combined = `${icp} ${clean(context.industry)} ${list(context.mustHave).join(" ")}`.toLowerCase();
    const employeeRange = parseEmployeeRange(`${icp} ${clean(context.size)}`);
    const categories = [];
    if (/managed[- ]service|msp\b/.test(combined)) categories.push("managed IT services", "managed service provider");
    if (/it consulting|technology consulting/.test(combined)) categories.push("IT consulting");
    if (/professional services/.test(combined)) categories.push("professional services");
    if (!categories.length && context.industry) categories.push(clean(context.industry));
    const technologySignals = [];
    if (/hubspot/.test(combined)) {
      technologySignals.push(
        "HubSpot partner-directory listing",
        "HubSpot mentioned on the company website",
        "HubSpot named in a public job description"
      );
    }
    const serviceSignals = [];
    if (/recurring|managed service|client contract|account management/.test(combined)) {
      serviceSignals.push(
        "managed-services or recurring-services language",
        "client-services or account-management language",
        "monthly support, retainer, or recurring contract language"
      );
    }
    const teamSignals = [];
    if (/no dedicated customer[- ]success|without.*customer[- ]success|absence.*customer[- ]success/.test(combined)) {
      teamSignals.push(
        "public team page or job listings show client services/account management but no dedicated customer-success role"
      );
    }
    return {
      categories: unique(categories),
      geography: clean(context.geography) || "North America",
      employeeMin: employeeRange.employeeMin,
      employeeMax: employeeRange.employeeMax,
      technologySignals: unique(technologySignals),
      serviceSignals: unique(serviceSignals),
      teamSignals: unique(teamSignals),
      referralPaths: unique(list(context.referralPaths)),
      exclusions: unique([...list(context.exclusions), ...list(context.disqualifications)]),
      initialTarget: Math.max(1, Number(context.initialTarget) || 25),
      batchSize: Math.max(1, Math.min(10, Number(context.batchSize) || 5))
    };
  }

  function quotedOr(values, fallback) {
    const items = list(values);
    return (items.length ? items : [fallback]).slice(0, 3).map((item) => `"${item}"`).join(" OR ");
  }

  function buildSearchApproaches(variables = {}) {
    const categoryQuery = quotedOr(variables.categories, "managed IT services");
    const techQuery = quotedOr(variables.technologySignals, "HubSpot");
    const serviceQuery = quotedOr(variables.serviceSignals, "recurring services");
    const teamQuery = quotedOr(variables.teamSignals, "client services team");
    const geography = clean(variables.geography);
    return [
      {
        id: "category",
        label: "Category and geography",
        query: [categoryQuery, geography ? `"${geography}"` : ""].filter(Boolean).join(" "),
        why: "Find companies that publicly describe the right service category in the intended market.",
        evidenceBoundary: "Category language is observable; employee count and recurring-client fit still require verification."
      },
      {
        id: "technology",
        label: "Public technology signal",
        query: [categoryQuery, techQuery].filter(Boolean).join(" "),
        why: "Look for public HubSpot partner, website, integration, or job evidence without assuming the company uses HubSpot.",
        evidenceBoundary: "A mention is evidence of association, not proof of current production use."
      },
      {
        id: "service-model",
        label: "Recurring-service language",
        query: [categoryQuery, serviceQuery].filter(Boolean).join(" "),
        why: "Find public language that suggests recurring client service, managed accounts, retainers, or ongoing support.",
        evidenceBoundary: "Recurring-service language does not prove the number of contracts."
      },
      {
        id: "team-structure",
        label: "Team-structure hypothesis",
        query: [categoryQuery, teamQuery, '"jobs" OR "team"'].filter(Boolean).join(" "),
        why: "Collect public team or hiring evidence that can support a hypothesis about how client retention work is organized.",
        evidenceBoundary: "Absence of a customer-success title is an inference and must never be presented as a verified fact."
      }
    ];
  }

  function normalizeCandidate(candidate = {}, index = 0) {
    const status = ["Pending review", "Accepted", "Rejected"].includes(candidate.status)
      ? candidate.status
      : "Pending review";
    const candidateUrl = clean(candidate.url || candidate.sourceUrl);
    return {
      id: clean(candidate.id) || `candidate-${Date.now()}-${index + 1}`,
      company: clean(candidate.company),
      url: /^https?:\/\//i.test(candidateUrl) ? candidateUrl : "",
      sourceLabel: clean(candidate.sourceLabel || candidate.source),
      observedEvidence: unique(list(candidate.observedEvidence)),
      inferredFit: unique(list(candidate.inferredFit)),
      missingInformation: unique(list(candidate.missingInformation || candidate.missingInfo)),
      risks: unique(list(candidate.risks || candidate.exclusionRisks)),
      status,
      decisionReason: clean(candidate.decisionReason)
    };
  }

  function parseCandidateResults(text) {
    const raw = String(text || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    const rows = Array.isArray(parsed) ? parsed : parsed.candidates;
    if (!Array.isArray(rows)) throw new Error("Expected a JSON array or an object with a candidates array.");
    return rows.map(normalizeCandidate).filter((item) => item.company && item.url);
  }

  function buildDiscoveryPrompt(context = {}) {
    const variables = context.variables || {};
    const approaches = context.approaches || buildSearchApproaches(variables);
    const batchSize = Math.max(1, Math.min(10, Number(variables.batchSize) || 5));
    const feedback = context.feedback && typeof context.feedback === "object" ? context.feedback : {};
    return [
      `Research a reviewable batch of up to ${batchSize} target-company hypotheses for ${clean(context.company) || "this GTM plan"}.`,
      "",
      "Use public web research. Do not treat the full ICP sentence as a literal search query.",
      "Use these focused approaches separately:",
      ...approaches.map((item, index) => `${index + 1}. ${item.label}: ${item.query}\n   Why: ${item.why}\n   Evidence boundary: ${item.evidenceBoundary}`),
      "",
      `Observable categories: ${list(variables.categories).join("; ") || "not specified"}`,
      `Geography: ${clean(variables.geography) || "not specified"}`,
      `Approximate employee range: ${variables.employeeMin || "unknown"} to ${variables.employeeMax || "unknown"}`,
      `Public technology signals to investigate: ${list(variables.technologySignals).join("; ") || "none specified"}`,
      `Recurring-service signals to investigate: ${list(variables.serviceSignals).join("; ") || "none specified"}`,
      `Team-structure signals to investigate: ${list(variables.teamSignals).join("; ") || "none specified"}`,
      `Referral paths: ${list(variables.referralPaths).join("; ") || "none specified"}`,
      `Exclusions: ${list(variables.exclusions).join("; ") || "none specified"}`,
      `Reviewer refinements from earlier batches: ${Object.entries(feedback).filter(([, value]) => clean(value)).map(([key, value]) => `${key}: ${clean(value)}`).join("; ") || "none yet"}`,
      "",
      "Evidence rules:",
      "- Cite a public source URL for every observed claim.",
      "- Separate observed evidence from inferred fit.",
      "- Never claim employee count, HubSpot use, recurring-contract volume, or absence of a customer-success function without public evidence.",
      "- Put unknown facts under missingInformation.",
      "- Put exclusion concerns and contradictory evidence under risks.",
      "- Do not find contacts, draft outreach, or send messages.",
      "",
      "Return JSON only in this shape:",
      JSON.stringify({
        candidates: [{
          company: "Company name",
          url: "https://public-source.example/company",
          sourceLabel: "Company site, directory, or job page",
          observedEvidence: ["Observable fact with source context"],
          inferredFit: ["Clearly labeled hypothesis"],
          missingInformation: ["Fact still needing verification"],
          risks: ["Exclusion or contradictory signal"],
          status: "Pending review"
        }]
      }, null, 2)
    ].join("\n");
  }

  root.GTM_TARGET_DISCOVERY = Object.freeze({
    deriveSearchVariables,
    buildSearchApproaches,
    buildDiscoveryPrompt,
    parseCandidateResults,
    normalizeCandidate
  });
})(typeof window !== "undefined" ? window : globalThis);
