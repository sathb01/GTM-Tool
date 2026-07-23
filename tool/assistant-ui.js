(() => {
  const forms = [...document.querySelectorAll(".workspace-find-ask")];
  if (!forms.length) return;

  const backdrop = document.createElement("div");
  backdrop.className = "workspace-assistant-backdrop";
  backdrop.hidden = true;
  backdrop.innerHTML = `
    <aside class="workspace-assistant-panel" role="dialog" aria-modal="true" aria-labelledby="workspaceAssistantTitle">
      <div class="workspace-assistant-heading">
        <div><h2 id="workspaceAssistantTitle">Find or ask</h2><p>Find a workspace section or ask for GTM guidance based on the current company.</p></div>
        <button class="workspace-assistant-close" type="button" aria-label="Close">&times;</button>
      </div>
      <div class="workspace-assistant-query">
        <label for="workspaceAssistantQuestion"><strong>What do you need?</strong></label>
        <textarea id="workspaceAssistantQuestion" placeholder="Example: Recommend the best answer for this section and explain why."></textarea>
        <div class="workspace-assistant-actions">
          <button type="button" class="secondary" data-assistant-find>Find in workspace</button>
          <button type="button" data-assistant-ask>Ask AI</button>
        </div>
      </div>
      <div class="workspace-assistant-prompts" aria-label="Suggested questions"></div>
      <p class="workspace-assistant-status" aria-live="polite"></p>
      <div class="workspace-assistant-results"></div>
      <div class="workspace-assistant-answer" hidden></div>
    </aside>`;
  document.body.appendChild(backdrop);

  const panel = backdrop.querySelector(".workspace-assistant-panel");
  const question = backdrop.querySelector("#workspaceAssistantQuestion");
  const status = backdrop.querySelector(".workspace-assistant-status");
  const results = backdrop.querySelector(".workspace-assistant-results");
  const answer = backdrop.querySelector(".workspace-assistant-answer");
  const prompts = backdrop.querySelector(".workspace-assistant-prompts");

  function isIntake() {
    return /(?:^|\/)index\.html$/.test(window.location.pathname) || window.location.pathname === "/";
  }

  function currentSection() {
    const sections = [...document.querySelectorAll("main > section, main section")].filter((section) => {
      const style = getComputedStyle(section);
      return style.display !== "none" && section.getBoundingClientRect().height > 0;
    });
    const visible = sections.find((section) => {
      const bounds = section.getBoundingClientRect();
      return bounds.top <= 180 && bounds.bottom > 180;
    }) || sections.sort((first, second) => Math.abs(first.getBoundingClientRect().top - 180) - Math.abs(second.getBoundingClientRect().top - 180))[0];
    return visible?.querySelector("h1, h2")?.textContent?.trim() || document.querySelector("main h1, main h2")?.textContent?.trim() || document.title;
  }

  function pageContext() {
    const root = document.querySelector("main") || document.body;
    const visibleText = root.innerText.replace(/\n{3,}/g, "\n\n").slice(0, 8000);
    const fields = [...root.querySelectorAll("input[name], select[name], textarea[name]")]
      .filter((control) => control.value && control.type !== "password" && control.type !== "email" && control.type !== "tel")
      .slice(0, 80)
      .map((control) => `${control.name}: ${String(control.value).slice(0, 300)}`)
      .join("\n");
    return `${visibleText}\n\nVisible saved fields:\n${fields}`.slice(0, 8000);
  }

  function recordId() {
    return new URLSearchParams(window.location.search).get("recordId")
      || localStorage.getItem("gtmReadinessIntake:activeRecordId")
      || "";
  }

  function setPrompts() {
    const items = isIntake()
      ? ["Recommend answers for this section", "Explain the current question", "Review these answers for gaps"]
      : ["Explain the current recommendation", "What should I do next?", "What information is still missing?"];
    prompts.innerHTML = "";
    items.forEach((label) => {
      const button = document.createElement("button");
      button.type = "button";
      button.textContent = label;
      button.addEventListener("click", () => {
        question.value = label;
        askAi();
      });
      prompts.appendChild(button);
    });
  }

  function openAssistant(initial = "") {
    backdrop.hidden = false;
    document.body.style.overflow = "hidden";
    question.value = initial;
    setPrompts();
    status.textContent = "AI uses the current company and visible section only when you select Ask AI.";
    results.innerHTML = "";
    answer.hidden = true;
    window.setTimeout(() => question.focus(), 0);
  }

  function closeAssistant() {
    backdrop.hidden = true;
    document.body.style.overflow = "";
  }

  function searchableItems() {
    const items = [];
    const seen = new Set();
    document.querySelectorAll("nav a, aside a, #reportToc a, h1, h2, h3").forEach((element, index) => {
      const label = element.textContent.trim();
      if (!label || seen.has(label.toLowerCase())) return;
      seen.add(label.toLowerCase());
      if (element.matches("a")) {
        items.push({ label, href: element.getAttribute("href") || "#" });
        return;
      }
      if (!element.id) element.id = `workspace-find-${index + 1}`;
      items.push({ label, href: `#${element.id}` });
    });
    return items;
  }

  function findInWorkspace() {
    const query = question.value.trim().toLowerCase();
    results.innerHTML = "";
    answer.hidden = true;
    if (!query) {
      status.textContent = "Enter a section, asset, question, or topic.";
      return;
    }
    const matches = searchableItems().filter((item) => item.label.toLowerCase().includes(query)).slice(0, 8);
    if (!matches.length) {
      status.textContent = "No matching section was found. Select Ask AI for guidance.";
      return;
    }
    status.textContent = `${matches.length} matching location${matches.length === 1 ? "" : "s"}.`;
    matches.forEach((item) => {
      const link = document.createElement("a");
      link.href = item.href;
      link.textContent = item.label;
      link.addEventListener("click", () => closeAssistant());
      results.appendChild(link);
    });
  }

  async function askAi() {
    const text = question.value.trim();
    if (!text) {
      status.textContent = "Enter a question first.";
      question.focus();
      return;
    }
    status.textContent = "Reviewing the current company and section...";
    results.innerHTML = "";
    answer.hidden = true;
    try {
      const response = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: text,
          recordId: recordId(),
          workspace: isIntake() ? "GTM Intelligence OS Intake" : "GTM Intelligence OS Action Plan",
          section: currentSection(),
          pageContext: pageContext()
        })
      });
      const payload = await response.json();
      if (!response.ok) throw new Error(payload.error || "AI help could not respond.");
      answer.textContent = payload.answer || "No recommendation was returned.";
      answer.hidden = false;
      status.textContent = "Recommendation ready. Review it before changing the intake or plan.";
    } catch (error) {
      status.textContent = error.message;
    }
  }

  forms.forEach((form) => {
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      const input = form.querySelector("input");
      openAssistant(input?.value || "");
      if (input?.value) findInWorkspace();
    });
  });
  backdrop.querySelector(".workspace-assistant-close").addEventListener("click", closeAssistant);
  backdrop.querySelector("[data-assistant-find]").addEventListener("click", findInWorkspace);
  backdrop.querySelector("[data-assistant-ask]").addEventListener("click", askAi);
  backdrop.addEventListener("click", (event) => {
    if (event.target === backdrop) closeAssistant();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !backdrop.hidden) closeAssistant();
  });
})();
