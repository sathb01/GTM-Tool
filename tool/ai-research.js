(function () {
  function apiBase() {
    return window.GTM_API_BASE || (window.location.protocol.startsWith("http") ? window.location.origin : "");
  }

  function collectFormData() {
    if (typeof window.getFormData === "function") {
      return window.getFormData();
    }

    const form = document.getElementById("intakeForm");
    const data = {};

    if (!form) {
      return data;
    }

    for (const [key, value] of new FormData(form).entries()) {
      data[key] = data[key] ? `${data[key]}, ${value}` : value;
    }

    return data;
  }

  function applyFields(fields) {
    if (typeof window.normalizeRepeatableData === "function" && typeof window.setFormData === "function") {
      window.setFormData(window.normalizeRepeatableData(fields || {}));
      return;
    }

    Object.entries(fields || {}).forEach(([key, value]) => {
      document.querySelectorAll(`[name="${CSS.escape(key)}"]`).forEach((field) => {
        if (field.type === "checkbox") {
          field.checked = String(value).split(", ").includes(field.value) || value === true || value === "true";
        } else {
          field.value = value;
        }
      });
    });
  }

  function addPrompt(notes, companyName, website) {
    if (!notes) {
      return;
    }

    const prompt = [
      `Research ${companyName || website} for a GTM readiness intake.`,
      "Use public sources such as the company website, product pages, pricing pages, resource pages, LinkedIn, review sites, directories, news, and visible social profiles.",
      "Prefill as much of the intake as possible: company profile, geography, public presence, business model, stage, ICP, buyer roles, offer, pricing signals, proof assets, channels, sales motion, competitors, trigger events, and likely GTM risks.",
      "Return JSON field suggestions matching the online intake schema, plus research notes and source URLs for anything inferred."
    ].join("\n");

    notes.value = notes.value ? `${notes.value}\n\nAI research prompt:\n${prompt}` : `AI research prompt:\n${prompt}`;
  }

  async function runAiResearch(event) {
    event.preventDefault();
    event.stopImmediatePropagation();

    const status = document.getElementById("researchStatus");
    const companyName = document.querySelector("[name='companyName']")?.value.trim() || "";
    const website = document.querySelector("[name='website']")?.value.trim() || "";
    const notes = document.querySelector("[name='researchNotes']");

    if (!companyName && !website) {
      status.textContent = "Add a company name or website first.";
      return;
    }

    status.textContent = "Starting AI research...";

    try {
      const endpoint = window.GTM_RESEARCH_ENDPOINT || `${apiBase()}/api/research`;
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          website,
          currentFields: collectFormData()
        })
      });
      const rawText = await response.text();
      let result = {};

      try {
        result = rawText ? JSON.parse(rawText) : {};
      } catch (error) {
        result = { error: rawText };
      }

      if (!response.ok) {
        throw new Error(result.nextStep || result.error || `AI Research failed with status ${response.status}.`);
      }

      applyFields(result.fields || {});

      if (notes && result.researchNotes) {
        notes.value = result.researchNotes;
      }

      status.textContent = "AI research completed. Review the prefilled fields before generating results.";

      if (typeof window.saveDraft === "function") {
        window.saveDraft(false);
      }
    } catch (error) {
      addPrompt(notes, companyName, website);
      status.textContent = `AI Research could not run: ${error.message}`;

      if (typeof window.saveDraft === "function") {
        window.saveDraft(false);
      }
    }
  }

  function installAiResearchOverride() {
    const button = document.getElementById("researchButton");

    if (!button) {
      return;
    }

    button.addEventListener("click", runAiResearch, true);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", installAiResearchOverride);
  } else {
    installAiResearchOverride();
  }
})();
