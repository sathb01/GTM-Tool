(() => {
  const assistedFields = new Set([
    "customerContextStarter",
    "quickBestFitCustomer",
    "quickBuyerProblem",
    "quickUrgencyNow",
    "quickOfferPromise",
    "quickSuccessMeasure",
    "quickStopAvoid",
    "preFounderBackground",
    "preHypothesisNotes"
  ]);
  let researchResult = null;

  const backdrop = document.createElement("div");
  backdrop.className = "ai-research-backdrop";
  backdrop.hidden = true;
  backdrop.innerHTML = `
    <aside class="ai-research-panel" role="dialog" aria-modal="true" aria-labelledby="aiResearchTitle">
      <div class="ai-research-heading">
        <div><h2 id="aiResearchTitle">Research Company</h2><p>Review public findings before adding anything to the intake.</p></div>
        <button type="button" class="ai-research-close" aria-label="Close">&times;</button>
      </div>
      <div class="ai-research-form">
        <label>Company name<input id="aiResearchCompanyName"></label>
        <label>Company website <span class="muted">Recommended to prevent a wrong-company match</span><input id="aiResearchWebsite" type="url" placeholder="https://example.com"></label>
        <div class="ai-research-actions"><button type="button" id="runAiCompanyResearch">Research Public Sources</button><span class="ai-research-status" id="aiResearchStatus"></span></div>
      </div>
      <div class="ai-research-results" id="aiResearchResults" hidden></div>
    </aside>`;
  document.body.appendChild(backdrop);

  const companyInput = backdrop.querySelector("#aiResearchCompanyName");
  const websiteInput = backdrop.querySelector("#aiResearchWebsite");
  const status = backdrop.querySelector("#aiResearchStatus");
  const results = backdrop.querySelector("#aiResearchResults");

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" }[character]));
  }

  function currentData() {
    try {
      return typeof getFormData === "function" ? getFormData() : {};
    } catch {
      return {};
    }
  }

  function currentRecordId() {
    try {
      if (typeof activeRecordId === "function") return activeRecordId();
    } catch {
      // Fall back to the durable storage key.
    }
    return localStorage.getItem("gtmReadinessIntake:activeRecordId") || "";
  }

  function openResearch() {
    const data = currentData();
    companyInput.value = data.companyName || "";
    websiteInput.value = data.website || "";
    status.textContent = "AI will search public sources only after you select Research Public Sources.";
    results.hidden = true;
    results.innerHTML = "";
    backdrop.hidden = false;
    document.body.style.overflow = "hidden";
    window.setTimeout(() => (companyInput.value ? websiteInput : companyInput).focus(), 0);
  }

  function closeResearch() {
    backdrop.hidden = true;
    document.body.style.overflow = "";
  }

  function mappedValue(fieldId, value) {
    const text = String(value || "").trim();
    const source = fieldId === "industryId"
      ? window.GTM_TAXONOMY?.INDUSTRY_OPTIONS
      : fieldId === "businessTypeId"
        ? window.GTM_TAXONOMY?.BUSINESS_TYPE_OPTIONS
        : null;
    if (source) {
      const match = source.find((option) => option.id.toLowerCase() === text.toLowerCase() || option.label.toLowerCase() === text.toLowerCase());
      return match?.id || "other_not_sure";
    }
    const control = document.querySelector(`[name="${CSS.escape(fieldId)}"]`);
    if (control?.tagName === "SELECT") {
      const option = Array.from(control.options).find((item) => item.value.toLowerCase() === text.toLowerCase() || item.textContent.trim().toLowerCase() === text.toLowerCase());
      return option?.value || "";
    }
    return text;
  }

  function setFieldValue(fieldId, proposedValue) {
    const value = mappedValue(fieldId, proposedValue);
    if (!value) return false;
    try {
      formStateData[fieldId] = value;
    } catch {
      // The visible control still receives the value when global form state is unavailable.
    }
    const controls = Array.from(document.querySelectorAll(`[name="${CSS.escape(fieldId)}"]`));
    controls.forEach((control) => {
      if (control.type === "checkbox") control.checked = /^(?:yes|true|checked)$/i.test(value);
      else control.value = value;
      control.dispatchEvent(new Event("input", { bubbles: true }));
      control.dispatchEvent(new Event("change", { bubbles: true }));
    });
    return true;
  }

  function renderResearchResult(payload) {
    researchResult = payload;
    const match = payload.matchedCompany || {};
    const data = currentData();
    const proposals = Array.isArray(payload.proposals) ? payload.proposals : [];
    const conflicts = Array.isArray(payload.conflicts) ? payload.conflicts : [];
    results.innerHTML = `
      <div class="ai-company-match">
        <h3>Confirm the company match</h3>
        <p><strong>${escapeHtml(match.name || companyInput.value)}</strong>${match.website ? ` | <a href="${escapeHtml(match.website)}" target="_blank" rel="noopener">${escapeHtml(match.website)}</a>` : ""}</p>
        <p>${escapeHtml(match.matchConfidence || "Low")} confidence: ${escapeHtml(match.matchReason || "Review the match before applying research.")}</p>
      </div>
      ${conflicts.length ? `<div class="ai-research-conflicts"><strong>Conflicts or uncertainty</strong><ul>${conflicts.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul></div>` : ""}
      <div class="ai-proposal-heading"><div><h3>Proposed intake answers</h3><p class="muted">Existing answers are never selected for replacement automatically.</p></div><button type="button" class="secondary" id="selectBlankResearchFields">Select supported blank fields</button></div>
      <div class="ai-proposal-list">${proposals.length ? proposals.map((proposal, index) => {
        const existing = String(data[proposal.fieldId] || "").trim();
        const selected = !existing && proposal.confidence !== "Low" && match.matchConfidence !== "Low";
        return `<article class="ai-proposal-card${existing ? " has-existing" : ""}" data-research-proposal="${index}"><div class="ai-proposal-heading"><label><input type="checkbox"${selected ? " checked" : ""}><span>${escapeHtml(proposal.label)}</span></label><span class="ai-proposal-meta">${escapeHtml(proposal.classification)} | ${escapeHtml(proposal.confidence)} confidence</span></div><p><strong>Proposed:</strong> ${escapeHtml(proposal.value)}</p>${existing ? `<p class="ai-proposal-existing"><strong>Current answer:</strong> ${escapeHtml(existing)}</p>` : ""}<p>${escapeHtml(proposal.evidence)}</p><div class="ai-proposal-sources">${proposal.sourceUrls.map((url, sourceIndex) => `<a href="${escapeHtml(url)}" target="_blank" rel="noopener">Source ${sourceIndex + 1}</a>`).join("")}</div></article>`;
      }).join("") : "<p>No supported public fields were found. Confirm the website and try again.</p>"}</div>
      <div class="ai-research-actions"><button type="button" id="applyAiResearch"${proposals.length ? "" : " disabled"}>Add Selected Answers</button><span class="ai-research-status" id="aiResearchApplyStatus"></span></div>`;
    results.hidden = false;
    results.querySelector("#selectBlankResearchFields")?.addEventListener("click", () => {
      results.querySelectorAll("[data-research-proposal]").forEach((card) => {
        const proposal = proposals[Number(card.dataset.researchProposal)];
        card.querySelector('input[type="checkbox"]').checked = !String(data[proposal.fieldId] || "").trim() && proposal.confidence !== "Low";
      });
    });
    results.querySelector("#applyAiResearch")?.addEventListener("click", applySelectedResearch);
  }

  async function applySelectedResearch() {
    const applyStatus = results.querySelector("#aiResearchApplyStatus");
    const selected = Array.from(results.querySelectorAll("[data-research-proposal]")).filter((card) => card.querySelector('input[type="checkbox"]').checked);
    if (!selected.length) {
      applyStatus.textContent = "Select at least one proposed answer.";
      return;
    }
    const applied = [];
    selected.forEach((card) => {
      const proposal = researchResult.proposals[Number(card.dataset.researchProposal)];
      if (setFieldValue(proposal.fieldId, proposal.value)) applied.push(proposal);
    });
    const notes = document.querySelector('[name="researchNotes"]');
    const sourceSummary = applied.map((proposal) => `${proposal.label}: ${proposal.value}\nSources: ${proposal.sourceUrls.join(", ")}`).join("\n\n");
    const researchNote = `AI public research reviewed ${new Date().toISOString().slice(0, 10)}\n${researchResult.notes || ""}\n\n${sourceSummary}`.trim();
    try {
      formStateData.researchNotes = [formStateData.researchNotes, researchNote].filter(Boolean).join("\n\n");
    } catch {
      // The visible notes field is updated below when available.
    }
    if (notes) notes.value = [notes.value, researchNote].filter(Boolean).join("\n\n");
    if (typeof saveDraft === "function") await saveDraft(false);
    applyStatus.textContent = `${applied.length} reviewed answer${applied.length === 1 ? "" : "s"} added and saved.`;
  }

  async function runResearch() {
    const companyName = companyInput.value.trim();
    const website = websiteInput.value.trim();
    if (!companyName && !website) {
      status.textContent = "Add a company name or website first.";
      return;
    }
    status.textContent = website ? "Researching public sources..." : "Searching by name. Carefully confirm the company match before applying anything.";
    results.hidden = true;
    try {
      const response = await fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, website, currentFields: currentData() })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "Company research could not be completed.");
      renderResearchResult(payload);
      status.textContent = `${payload.proposals?.length || 0} supported answer${payload.proposals?.length === 1 ? "" : "s"} found. Review each one before adding it.`;
    } catch (error) {
      status.textContent = error.message;
    }
  }

  function attachFieldHelp() {
    document.querySelectorAll("[data-field-id]").forEach((wrapper) => {
      const fieldId = wrapper.dataset.fieldId;
      if (!assistedFields.has(fieldId) || wrapper.querySelector(".ai-field-help")) return;
      const control = wrapper.querySelector(`[name="${CSS.escape(fieldId)}"]`);
      if (!control || !["INPUT", "TEXTAREA"].includes(control.tagName)) return;
      const help = document.createElement("div");
      help.className = "ai-field-help";
      help.innerHTML = `<button type="button" class="ai-field-help-button">Help me answer this</button><span class="ai-field-status" aria-live="polite"></span><div class="ai-field-suggestion" hidden><p></p><div class="ai-field-suggestion-actions"><button type="button" data-use-ai-field>Use this answer</button><button type="button" class="secondary" data-dismiss-ai-field>Dismiss</button></div></div>`;
      wrapper.appendChild(help);
      const fieldStatus = help.querySelector(".ai-field-status");
      const suggestion = help.querySelector(".ai-field-suggestion");
      const suggestionText = suggestion.querySelector("p");
      help.querySelector(".ai-field-help-button").addEventListener("click", async () => {
        fieldStatus.textContent = "Building a suggestion from the current intake...";
        suggestion.hidden = true;
        const options = control.tagName === "SELECT" ? Array.from(control.options).map((option) => option.textContent.trim()).filter(Boolean) : [];
        try {
          const response = await fetch("/api/assistant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              question: `Suggest the strongest honest answer for this intake field. Use only supported context and state uncertainty inside the answer when needed.`,
              recordId: currentRecordId(),
              workspace: "GTM OS Intake",
              section: document.querySelector("#sections h2")?.textContent?.trim() || "Current intake section",
              pageContext: JSON.stringify(Object.fromEntries(Object.entries(currentData()).filter(([, value]) => String(value || "").trim()).slice(0, 80))).slice(0, 8000),
              field: { id: fieldId, label: wrapper.dataset.fieldLabel, currentValue: control.value, options }
            })
          });
          const payload = await response.json();
          if (!response.ok) throw new Error(payload.error || "AI help could not respond.");
          suggestionText.textContent = payload.answer;
          suggestion.hidden = false;
          fieldStatus.textContent = "Suggestion ready. Review it before using it.";
        } catch (error) {
          fieldStatus.textContent = error.message;
        }
      });
      help.querySelector("[data-use-ai-field]").addEventListener("click", async () => {
        control.value = suggestionText.textContent.trim();
        try { formStateData[fieldId] = control.value; } catch { /* visible input is sufficient */ }
        control.dispatchEvent(new Event("input", { bubbles: true }));
        control.dispatchEvent(new Event("change", { bubbles: true }));
        if (typeof saveDraft === "function") await saveDraft(false);
        fieldStatus.textContent = "Answer added and saved.";
        suggestion.hidden = true;
      });
      help.querySelector("[data-dismiss-ai-field]").addEventListener("click", () => {
        suggestion.hidden = true;
        fieldStatus.textContent = "Suggestion dismissed.";
      });
    });
  }

  backdrop.querySelector("#runAiCompanyResearch").addEventListener("click", runResearch);
  backdrop.querySelector(".ai-research-close").addEventListener("click", closeResearch);
  backdrop.addEventListener("click", (event) => { if (event.target === backdrop) closeResearch(); });
  document.addEventListener("keydown", (event) => { if (event.key === "Escape" && !backdrop.hidden) closeResearch(); });
  new MutationObserver(attachFieldHelp).observe(document.getElementById("sections"), { childList: true, subtree: true });
  attachFieldHelp();
  window.GTM_INTAKE_AI = { openResearch, attachFieldHelp };
})();
