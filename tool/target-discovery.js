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

  function isLegacyUnverifiedSignal(value) {
    return /^customer complaints?$/i.test(clean(value));
  }

  function normalizeSavedBuyingSignal(value) {
    const label = clean(value);
    return {
      label,
      status: isLegacyUnverifiedSignal(label) ? "Legacy / unverified" : label ? "Saved" : "Missing",
      eligibleForPriority: Boolean(label) && !isLegacyUnverifiedSignal(label)
    };
  }

  function observableBuyingSignals(context = {}) {
    const icp = clean(context.icp);
    const buyer = clean(context.buyer) || "the saved buyer";
    const crm = clean(context.crm) || "the CRM";
    const combined = `${icp} ${clean(context.industry)} ${list(context.mustHave).join(" ")}`.toLowerCase();
    const signals = [
      {
        id: "retention-operations-hiring",
        label: "Customer-success, account-management, renewal, or RevOps hiring",
        whereFound: "Company careers page, LinkedIn jobs, or a public job board",
        implication: `A verified role or job requirement can indicate investment in client retention or account operations relevant to ${buyer}; it does not prove a renewal problem.`
      },
      {
        id: "recurring-client-service",
        label: "Managed-services or recurring-client-service language",
        whereFound: "Company services pages, pricing pages, case studies, or public profiles",
        implication: "Public managed-service, retainer, recurring support, or account-management language can indicate an ongoing client relationship model; it does not prove contract volume or renewal risk."
      },
      {
        id: "growth-or-service-expansion",
        label: "Acquisition, rapid growth, or service expansion",
        whereFound: "Company news, press releases, leadership posts, service pages, or hiring activity",
        implication: "A sourced acquisition, growth event, or service expansion can increase account-management complexity; it does not prove the company has a client-visibility problem."
      },
      {
        id: "referral-renewal-context",
        label: "Referral or existing relationship identifies renewal-risk or client-visibility needs",
        whereFound: `A named referral conversation, partner note, or existing relationship recorded in ${crm}`,
        implication: "First-party context can justify review when the source explicitly names the need; it remains reported context until the buyer confirms it."
      }
    ];
    if (/hubspot/.test(combined) || /hubspot/i.test(clean(context.crm))) {
      signals.splice(1, 0, {
        id: "public-hubspot-evidence",
        label: "Public HubSpot use, integration, partner, or job evidence",
        whereFound: "HubSpot partner directory, company integration or technology pages, or public job requirements",
        implication: "A sourced HubSpot mention indicates an association worth verifying; it does not prove current production use or a specific configuration."
      });
    }
    return signals;
  }

  function priorityRuleForSignal(signalId, signals = observableBuyingSignals()) {
    const selected = signals.find((signal) => signal.id === clean(signalId));
    if (!selected) return null;
    return {
      signalId: selected.id,
      label: selected.label,
      explanation: "This point rule ranks accounts for outreach review only. It does not prove fit, change market truth, or change the GTM readiness score."
    };
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
    const sources = (Array.isArray(candidate.sources) ? candidate.sources : [])
      .map((source) => ({
        label: clean(source?.label || "Public source"),
        url: /^https?:\/\//i.test(clean(source?.url)) ? clean(source.url) : ""
      }))
      .filter((source) => source.url);
    if (/^https?:\/\//i.test(candidateUrl) && !sources.some((source) => source.url === candidateUrl)) {
      sources.unshift({ label: clean(candidate.sourceLabel || candidate.source || "Primary public source"), url: candidateUrl });
    }
    return {
      id: clean(candidate.id) || `candidate-${Date.now()}-${index + 1}`,
      rank: Math.max(1, Number(candidate.rank) || index + 1),
      company: clean(candidate.company),
      url: /^https?:\/\//i.test(candidateUrl) ? candidateUrl : "",
      sourceLabel: clean(candidate.sourceLabel || candidate.source),
      sources,
      whyReview: clean(candidate.whyReview),
      observedEvidence: unique(list(candidate.observedEvidence)),
      inferredFit: unique(list(candidate.inferredFit)),
      missingInformation: unique(list(candidate.missingInformation || candidate.missingInfo)),
      risks: unique(list(candidate.risks || candidate.exclusionRisks)),
      status,
      rating: clean(candidate.rating),
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
    normalizeCandidate,
    observableBuyingSignals,
    normalizeSavedBuyingSignal,
    isLegacyUnverifiedSignal,
    priorityRuleForSignal
  });
})(typeof window !== "undefined" ? window : globalThis);
